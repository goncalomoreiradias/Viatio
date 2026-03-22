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
// Helper for deterministic extraction
function extractPlacesDeterministic(data: any): any[] {
    const places: any[] = [];
    const seenNames = new Set<string>();

    function traverse(node: any) {
        if (!node) return;

        if (Array.isArray(node)) {
            // Check for Google Maps place node signature
            if (
                node.length >= 3 &&
                Array.isArray(node[1]) &&
                typeof node[2] === 'string' &&
                node[1].length > 5 &&
                Array.isArray(node[1][5]) &&
                typeof node[1][5][2] === 'number' &&
                typeof node[1][5][3] === 'number'
            ) {
                const inner = node[1];
                const shortName = node[2];
                const fullAddress = inner[4] || inner[2];
                const lat = inner[5][2];
                const lng = inner[5][3];

                if (!seenNames.has(shortName) && typeof lat === 'number' && typeof lng === 'number') {
                    seenNames.add(shortName);
                    
                    const lowerText = (shortName + " " + fullAddress).toLowerCase();
                    let category = "Local";
                    if (lowerText.includes("restaurant") || lowerText.includes("cafe") || lowerText.includes("food") || lowerText.includes("warung")) category = "Restaurante";
                    else if (lowerText.includes("hotel") || lowerText.includes("resort") || lowerText.includes("villa") || lowerText.includes("stay")) category = "Alojamento";
                    else if (lowerText.includes("temple") || lowerText.includes("pura")) category = "Templo";
                    else if (lowerText.includes("beach") || lowerText.includes("pantai") || lowerText.includes("praia")) category = "Praia";
                    else if (lowerText.includes("waterfall") || lowerText.includes("air terjun") || lowerText.includes("cascata")) category = "Cascata";

                    places.push({
                        name: shortName,
                        lat: lat,
                        lng: lng,
                        category: category,
                        address: fullAddress ? String(fullAddress) : null
                    });
                }
            }

            for (const item of node) {
                if (Array.isArray(item) || typeof item === 'object') {
                    traverse(item);
                }
            }
        } else if (typeof node === 'object') {
            for (const key in node) {
                traverse(node[key]);
            }
        }
    }

    traverse(data);
    return places;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const trip = await prisma.trip.findUnique({
            where: { id },
            include: { bucketListItems: true, owner: true },
        });

        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        if (trip.ownerId !== session.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        
        // Premium Restriction: Free users cannot use the Bucket List sync feature
        if (trip.owner.plan === "FREE") {
             return NextResponse.json({ error: "Premium feature only" }, { status: 403 });
        }

        if (!trip.bucketListUrls || trip.bucketListUrls.length === 0) {
            return NextResponse.json({ bucketListItems: trip.bucketListItems });
        }

        const newExtractedPlaces: Array<{
            name: string;
            lat: number;
            lng: number;
            category?: string;
            address?: string;
            mapsUrl?: string;
            sourceUrl: string;
        }> = [];

        // 1. Helper to resolve short URLs and find the data endpoint
        const resolveFinalUrl = async (url: string, depth = 0): Promise<string> => {
            if (depth > 5) return url;
            try {
                const initialUA = url.includes("maps.app.goo.gl") ? "curl/7.64.1" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
                
                const res = await fetch(url, {
                    method: "GET",
                    redirect: "manual",
                    headers: { "User-Agent": initialUA }
                });

                if (res.status >= 300 && res.status < 400) {
                    const location = res.headers.get("location");
                    if (location) return resolveFinalUrl(new URL(location, url).toString(), depth + 1);
                }

                if (res.status === 200) {
                    const text = await res.text();
                    const mapsUrlMatch = text.match(/https:\/\/www\.google\.com\/maps\/[^"'\\]+/);
                    if (mapsUrlMatch) {
                        let longUrl = mapsUrlMatch[0];
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
                
                const targetUrl = await resolveFinalUrl(url);
                process.stdout.write(`Resolvido para: ${targetUrl}\n`);

                const shellRes = await fetch(targetUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
                    },
                });

                if (!shellRes.ok) continue;

                const shellHtml = await shellRes.text();
                
                const rpcMatch = shellHtml.match(/["']([^"']*\/maps\/preview\/entitylist\/getlist\?[^"']+)["']/);
                let rpcUrl = rpcMatch ? rpcMatch[1] : null;

                if (rpcUrl && !rpcUrl.startsWith("http")) {
                    rpcUrl = `https://www.google.com${rpcUrl.replace(/&amp;/g, "&")}`;
                }

                if (rpcUrl) {
                    process.stdout.write(`RPC Encontrado: ${rpcUrl.substring(0, 100)}...\n`);
                    const rpcRes = await fetch(rpcUrl, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Referer": "https://www.google.com/maps/",
                        }
                    });
                    if (rpcRes.ok) {
                        let rpcData = await rpcRes.text();
                        rpcData = rpcData.replace(")]}'\n", ""); // Clean prefix
                        try {
                            const jsonNode = JSON.parse(rpcData);
                            const extracted = extractPlacesDeterministic(jsonNode);
                            process.stdout.write(`Extraídos ${extracted.length} locais de forma determinística!\n`);
                            for (const place of extracted) {
                                newExtractedPlaces.push({ 
                                    ...place, 
                                    sourceUrl: url,
                                    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + (place.address ? " " + place.address : ""))}`
                                });
                            }
                        } catch(e) {
                            console.error("Error parsing RPC JSON:", e);
                        }
                    }
                } else {
                     process.stdout.write(`Aviso: RPC não encontrado para ${url}\n`);
                }
            } catch (error) {
                console.error(`Error processing URL ${url}:`, error);
                continue;
            }
        }

        // 3. Sync: Delete old items and insert new ones (atomic)
        await prisma.$transaction(async (tx) => {
            // Delete all existing items for this trip
            await tx.bucketListItem.deleteMany({ where: { tripId: id } });

            // Insert all newly extracted items
            if (newExtractedPlaces.length > 0) {
                await tx.bucketListItem.createMany({
                    data: newExtractedPlaces.map((item) => ({
                        tripId: id,
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
            where: { tripId: id },
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
