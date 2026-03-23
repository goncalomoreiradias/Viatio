import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

// Schema validation to ensure the AI output is usable (Updated for Final Schema)
function validateItinerary(data: any, requestedDays: number): string | null {
    if (!data || typeof data !== 'object') return "Invalid JSON structure";
    if (!data.trip_name) return "Missing trip_name";
    if (!Array.isArray(data.itinerary) || data.itinerary.length === 0) return "Missing or empty itinerary array";
    
    // Check if we have exactly the number of days requested (Zero Omissions)
    if (data.itinerary.length !== requestedDays) return `Requested ${requestedDays} days but got ${data.itinerary.length}`;

    for (const day of data.itinerary) {
        if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
            return `Day ${day.day || 'unknown'} has no activities`;
        }
    }
    return null;
}

export async function POST(request: Request) {
    try {
        // 1. Auth & Plan Check
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Please log in first." }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId as string },
            select: { plan: true, planUpdatedAt: true, id: true }
        });

        if (!user || user.plan === "FREE") {
            return NextResponse.json(
                { error: "Upgrade your plan to use AI Trip Planning.", requiresUpgrade: true },
                { status: 403 }
            );
        }

        const config = await prisma.pricingConfig.findFirst();
        if (!config) {
             return NextResponse.json({ error: "Pricing Configuration is missing from the server." }, { status: 500 });
        }

        // Calculate AI Spend since last plan update
        const usageAmount = await prisma.aiUsage.aggregate({
             where: {
                 userId: user.id,
                 createdAt: { gte: user.planUpdatedAt }
             },
             _sum: { estimatedCost: true }
        });
        const currentSpend = usageAmount._sum.estimatedCost || 0;

        let aiMax = 0;
        let isBListAllowed = false;
        if (user.plan === "SINGLE_TRIP") {
            aiMax = config.singleTripAiMax;
            isBListAllowed = config.singleTripBList;
        } else if (user.plan === "MONTHLY") {
            aiMax = config.monthlyAiMax;
            isBListAllowed = config.monthlyBList;
        } else if (user.plan === "YEARLY") {
            aiMax = config.yearlyAiMax;
            isBListAllowed = config.yearlyBList;
        }

        if (currentSpend >= aiMax) {
            return NextResponse.json({ 
                error: `Atingiu o limite de plafond de Inteligência Artificial para o seu plano (€${aiMax.toFixed(2)}). Por favor atualize o seu plano.`, 
                requiresUpgrade: true 
            }, { status: 403 });
        }

        // 2. Parse request
        const body = await request.json();
        const { destination, startDate, endDate, budget, travelStyle, numberOfPeople, customRequirements, mapsListUrl, language } = body;

        if (mapsListUrl && !isBListAllowed) {
             return NextResponse.json({ 
                 error: "O seu plano atual não permite integrar listas do Google Maps (Bucketlist).", 
                 requiresUpgrade: true 
             }, { status: 403 });
        }

        const isPT = language === "pt";
        const langName = isPT ? "Portuguese (pt-PT)" : "English (En-US)";

        if (!destination || !startDate || !endDate) {
            return NextResponse.json({ error: "Destination, start date, and end date are required." }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (numberOfDays < 1 || numberOfDays > 30) {
            return NextResponse.json({ error: "Trip must be between 1 and 30 days." }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ 
                error: "AI service is not configured. Please add 'OPENROUTER_API_KEY' to your Environment Variables." 
            }, { status: 500 });
        }

        // 3. Retry Loop for Resilient AI Generation
        let lastError = "";
        let finalItinerary: any = null;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const isLongTrip = numberOfDays > 10;
                const concisenessInstruction = isLongTrip 
                    ? "As this is a long trip, keep location descriptions very concise (1 short sentence) to ensure the complete itinerary fits in one response." 
                    : "Provide detailed and engaging descriptions.";

                const mapsInstruction = mapsListUrl 
                    ? `REGRA DE CONSUMO TOTAL: O utilizador forneceu uma lista de locais / links (${mapsListUrl}). Deves garantir que 100% destes locais são integrados no roteiro. Analisa a localização e agrupa-os de forma lógica.`
                    : "";

                const prompt = `És o "Viatio AI Architect", o motor de inteligência de um planeador de viagens de luxo. A tua missão é gerar roteiros de "alta densidade" e "zero omissões".

DETERMINISMO TEMPORAL (OBRIGATÓRIO):
1. CONTAGEM DE DIAS: Deves gerar EXACTAMENTE ${numberOfDays} objetos de "dia". Nunca resumas. O dia 1 e o dia ${numberOfDays} devem estar completos.
2. INTEGRIDADE HORÁRIA: Preenche o horário das 09:00 às 21:00 (mínimo). Proibido janelas vazias > 2h. Se necessário, sugere miradouros, café, paragens para fotografia ou "buffer time".
3. REALISMO: Tempos de visita realistas (1h igrejas, 3h museus grandes). Cada atividade deve considerar a deslocação do ponto anterior.

REGRAS DE PLANEAMENTO:
1. DENSIDADE: Mínimo de 4 atividades principais por dia + sugestões de refeições (pequeno-almoço e jantar).
2. LOGÍSTICA: Agrupa locais por proximidade geográfica para minimizar deslocações inúteis.
3. PERSONALIDADE: Profissional, inspirador e extremamente organizado.
${mapsInstruction}

LÍNGUA E TOM:
- Responde SEMPRE em Português de Portugal (pt-PT) impecável.
- Usa termos como "Pequeno-almoço", "Comboio", "Miradouro", "Autocarro".

CONTEXTO:
- Destino: ${destination}
- Datas: ${startDate} até ${endDate}
- Orçamento: ${budget ? `€${budget}` : "flexível"}
- Estilo: ${travelStyle || "equilibrado"}
- Viajantes: ${numberOfPeople || 2}
- Requisitos: ${customRequirements || "Nenhum"}

DEVOLVE APENAS UM OBJECTO JSON VÁLIDO SEGUINDO ESTE ESQUEMA:
{
  "trip_name": "Nome Elegante da Viagem",
  "total_days": ${numberOfDays},
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "09:00",
          "name": "Nome da Atividade",
          "category": "Cultura|Gastronomia|Lazer|Transporte|Natureza",
          "description": "Descrição apelativa e motivo da escolha (max 2 frases).",
          "coordinates": {"lat": 0.0, "lng": 0.0}
        }
      ]
    }
  ]
}`;

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": `https://viatio.app`,
                        "X-Title": `Viatio AI Architect`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "google/gemini-3.1-flash-lite-preview",
                        "messages": [{ "role": "user", "content": prompt }],
                        "response_format": { "type": "json_object" },
                        "max_tokens": 8192,
                        "temperature": 0.7
                    })
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`API ${response.status}: ${errorDetails.error?.message || "Unknown error"}`);
                }

                const aiResult = await response.json();
                const aiMessage = aiResult.choices[0].message.content;
                const finishReason = aiResult.choices[0].finish_reason;

                if (finishReason === "length") {
                    throw new Error("Response truncated due to token limit. Retrying with more conciseness...");
                }

                let itineraryData;
                try {
                    itineraryData = JSON.parse(aiMessage.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim());
                } catch (e) {
                    throw new Error("AI returned invalid JSON formatting.");
                }

                const validationError = validateItinerary(itineraryData, numberOfDays);
                if (validationError) {
                    throw new Error(`Validation failed: ${validationError}`);
                }

                finalItinerary = itineraryData;
                
                // Track Usage & Cost
                const usage = aiResult.usage;
                if (usage) {
                    const promptTokens = usage.prompt_tokens || 0;
                    const completionTokens = usage.completion_tokens || 0;
                    // Conservative estimate for Gemini 1.5 Flash Lite via OpenRouter
                    // Input: $0.075/1M (~0.000000075 / token)
                    // Output: $0.30/1M (~0.0000003 / token)
                    const cost = (promptTokens * 0.000000075) + (completionTokens * 0.0000003);

                    await prisma.aiUsage.create({
                        data: {
                            userId: session.userId as string,
                            model: aiResult.model || "google/gemini-3.1-flash-lite-preview",
                            promptTokens,
                            completionTokens,
                            totalTokens: usage.total_tokens || (promptTokens + completionTokens),
                            estimatedCost: cost,
                        }
                    });
                }
                break; // Success! Exit retry loop.

            } catch (err: any) {
                console.error(`AI Attempt ${attempt} failed:`, err.message);
                lastError = err.message;
                // Optional: add a small delay before retry if needed
                if (attempt < maxRetries) await new Promise(r => setTimeout(r, 500));
            }
        }

        if (!finalItinerary) {
            return NextResponse.json({ 
                error: `The AI Architect is experiencing difficulties: ${lastError}. Please refine your parameters or try again in a moment.`,
                isRetryable: true 
            }, { status: 500 });
        }

        // 4. Save to database (Mapped to New Schema)
        const trip = await prisma.trip.create({
            data: {
                title: finalItinerary.trip_name || `${destination} Trip`,
                description: `Viatio AI Architect Itinerary for ${destination} (${numberOfDays} days)`,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                ownerId: session.userId as string,
                days: {
                    create: finalItinerary.itinerary.map((day: any) => ({
                        dayNumber: day.day,
                        title: `Dia ${day.day}`,
                        locations: {
                            create: (day.activities || []).map((act: any) => ({
                                name: act.name || "Unknown Location",
                                description: act.description || "",
                                timeSlot: act.time || null,
                                lat: parseFloat(act.coordinates?.lat) || 0,
                                lng: parseFloat(act.coordinates?.lng) || 0,
                                tag: act.category?.toLowerCase() || null,
                                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.name} ${destination}`)}`,
                            }))
                        }
                    }))
                }
            }
        });

        // 5. Automatic Downgrade for SINGLE_TRIP Users
        if (user.plan === "SINGLE_TRIP") {
            await prisma.user.update({
                where: { id: user.id },
                data: { plan: "FREE", planUpdatedAt: new Date() }
            });
        }

        return NextResponse.json({ tripId: trip.id, title: trip.title });

    } catch (error: any) {
        console.error("Critical AI Plan Trip error:", error);
        return NextResponse.json(
            { error: "A server error occurred while building your trip. Our engineers have been notified." },
            { status: 500 }
        );
    }
}
