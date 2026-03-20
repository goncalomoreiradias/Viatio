import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

// GET: Return all bucket list items for this trip
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: tripId } = await params;

        const items = await prisma.bucketListItem.findMany({
            where: { tripId },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching bucket list:", error);
        return NextResponse.json({ error: "Failed to fetch bucket list" }, { status: 500 });
    }
}

// POST: Sync bucket list items by fetching URLs and using AI to extract places
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: tripId } = await params;

        // Get trip with its bucket list URLs
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { bucketListUrls: true, ownerId: true },
        });

        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        if (!trip.bucketListUrls || trip.bucketListUrls.length === 0) {
            return NextResponse.json({ error: "No bucket list URLs configured" }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
        }

        // 1. Fetch the content of each URL
        const allExtractedItems: Array<{
            name: string;
            lat: number;
            lng: number;
            category: string;
            address: string;
            mapsUrl: string;
            sourceUrl: string;
        }> = [];

        // 1. Helper to resolve short URLs and find the data endpoint
        const resolveFinalUrl = async (url: string, depth = 0): Promise<string> => {
            if (depth > 5) return url;
            try {
                // Use a simple UA for the initial jump to bypass splash screens that prefer modern browsers
                const initialUA = url.includes("maps.app.goo.gl") ? "curl/7.64.1" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
                
                const res = await fetch(url, {
                    method: "GET",
                    redirect: "manual",
                    headers: {
                        "User-Agent": initialUA,
                    }
                });

                if (res.status >= 300 && res.status < 400) {
                    const location = res.headers.get("location");
                    if (location) return resolveFinalUrl(new URL(location, url).toString(), depth + 1);
                }

                if (res.status === 200) {
                    const text = await res.text();
                    // Detect WIZ/Splash redirect in body
                    const mapsUrlMatch = text.match(/https:\/\/www\.google\.com\/maps\/[^"'\\]+/);
                    if (mapsUrlMatch) {
                        let longUrl = mapsUrlMatch[0];
                        // Cleanup encoded characters
                        longUrl = longUrl
                            .replace(/\\u0026/g, "&")
                            .replace(/&amp;/g, "&")
                            .replace(/%3D/g, "=")
                            .replace(/%3F/g, "?")
                            .replace(/%26/g, "&")
                            .replace(/%40/g, "@")
                            .replace(/\\/g, "");
                        
                        if (longUrl !== url) return resolveFinalUrl(longUrl, depth + 1);
                    }
                }
                return res.url;
            } catch (e) {
                return url;
            }
        };

        for (const url of trip.bucketListUrls) {
            try {
                process.stdout.write(`\n--- Sincronizando: ${url} ---\n`);
                
                // A. Resolve short URLs
                const targetUrl = await resolveFinalUrl(url);
                process.stdout.write(`Resolvido para: ${targetUrl}\n`);

                // B. Fetch the initial HTML to find the RPC data link
                const shellRes = await fetch(targetUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
                    },
                });

                if (!shellRes.ok) {
                    process.stdout.write(`Erro ao buscar shell (${shellRes.status})\n`);
                    continue;
                }

                const shellHtml = await shellRes.text();
                
                // C. Extract the getlist RPC URL
                // Format: /maps/preview/entitylist/getlist?hl=...&pb=...
                const rpcMatch = shellHtml.match(/["']([^"']*\/maps\/preview\/entitylist\/getlist\?[^"']+)["']/);
                let rpcUrl = rpcMatch ? rpcMatch[1] : null;

                if (rpcUrl && !rpcUrl.startsWith("http")) {
                    rpcUrl = `https://www.google.com${rpcUrl.replace(/&amp;/g, "&")}`;
                }

                let dataToParse = "";
                if (rpcUrl) {
                    process.stdout.write(`RPC Encontrado: ${rpcUrl.substring(0, 100)}...\n`);
                    // Fetch the actual list data
                    const rpcRes = await fetch(rpcUrl, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Referer": "https://www.google.com/maps/",
                        }
                    });
                    if (rpcRes.ok) {
                        dataToParse = await rpcRes.text();
                    }
                }

                // Fallback: If no RPC found, use cleaned HTML (but RPC is much better)
                if (!dataToParse) {
                    process.stdout.write(`Aviso: RPC não encontrado, usando shell HTML como fallback.\n`);
                    dataToParse = shellHtml
                        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                        .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
                        .substring(0, 50000);
                }

                // 2. Use AI to extract places from the data
                const prompt = `Analisa os seguintes dados brutos de uma lista do Google Maps. 
Estes dados contêm uma lista de locais/pontos de interesse.

Extrai TODOS os locais encontrados. Para cada local, identifica:
- name: nome do local
- lat: latitude (número float)
- lng: longitude (número float)  
- category: categoria (Restaurante, Café, Hotel, Templo, Praia, Bar, Cascata, Miradouro, Natureza, Loja, etc.)
- address: morada ou localização descritiva

IMPORTANTE: 
1. Os dados podem estar num formato de array aninhado (JSON-like). Procura nomes de locais e coordenadas próximas.
2. Extrai o MÁXIMO de locais possíveis. Não ignores nenhum.
3. Ignora locais que não tenham nome claro.

Devolve APENAS um JSON válido no formato:
{ "places": [ { "name": "...", "lat": 0.0, "lng": 0.0, "category": "...", "address": "..." } ] }

Dados:
${dataToParse.substring(0, 80000)}`; // Increased limit for RPC data (AI can handle large JSON strings)

                const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "https://viatio.app",
                        "X-Title": "Viatio Bucket List Extractor",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.0-flash-001",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" },
                        max_tokens: 4096,
                        temperature: 0.3,
                    }),
                });

                if (!aiRes.ok) {
                    const errData = await aiRes.json();
                    console.error("AI extraction error:", errData);
                    continue;
                }

                const aiResult = await aiRes.json();
                const content = aiResult.choices?.[0]?.message?.content;

                if (!content) continue;

                let parsed;
                try {
                    parsed = JSON.parse(content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim());
                } catch {
                    console.error("Failed to parse AI response for URL:", url);
                    continue;
                }

                if (parsed.places && Array.isArray(parsed.places)) {
                    for (const place of parsed.places) {
                        if (place.name) {
                            allExtractedItems.push({
                                name: place.name,
                                lat: parseFloat(place.lat) || 0,
                                lng: parseFloat(place.lng) || 0,
                                category: place.category || null,
                                address: place.address || null,
                                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + (place.address ? " " + place.address : ""))}`,
                                sourceUrl: url,
                            });
                        }
                    }
                }

                // Track AI usage
                const usage = aiResult.usage;
                if (usage) {
                    await prisma.aiUsage.create({
                        data: {
                            userId: session.userId as string,
                            tripId,
                            model: aiResult.model || "google/gemini-2.0-flash-001",
                            promptTokens: usage.prompt_tokens || 0,
                            completionTokens: usage.completion_tokens || 0,
                            totalTokens: usage.total_tokens || 0,
                            estimatedCost: ((usage.prompt_tokens || 0) * 0.0000001) + ((usage.completion_tokens || 0) * 0.0000004),
                        },
                    });
                }
            } catch (urlError) {
                console.error(`Error processing URL ${url}:`, urlError);
                continue;
            }
        }

        // 3. Sync: Delete old items and insert new ones (atomic)
        await prisma.$transaction(async (tx) => {
            // Delete all existing items for this trip
            await tx.bucketListItem.deleteMany({ where: { tripId } });

            // Insert all newly extracted items
            if (allExtractedItems.length > 0) {
                await tx.bucketListItem.createMany({
                    data: allExtractedItems.map((item) => ({
                        tripId,
                        name: item.name,
                        lat: item.lat,
                        lng: item.lng,
                        category: item.category,
                        address: item.address,
                        mapsUrl: item.mapsUrl,
                        sourceUrl: item.sourceUrl,
                    })),
                });
            }
        });

        // 4. Return updated items
        const updatedItems = await prisma.bucketListItem.findMany({
            where: { tripId },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({
            items: updatedItems,
            count: updatedItems.length,
            message: `Encontrados ${updatedItems.length} locais nas tuas listas.`,
        });
    } catch (error) {
        console.error("Error syncing bucket list:", error);
        return NextResponse.json({ error: "Failed to sync bucket list" }, { status: 500 });
    }
}

// Helper to get base URL from request
function getBaseUrl(request: Request): string {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
}
