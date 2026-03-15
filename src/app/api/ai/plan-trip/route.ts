import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

// Schema validation to ensure the AI output is usable
function validateItinerary(data: any, requestedDays: number): string | null {
    if (!data || typeof data !== 'object') return "Invalid JSON structure";
    if (!data.title || !data.description) return "Missing title or description";
    if (!Array.isArray(data.days) || data.days.length === 0) return "Missing or empty days array";
    
    // Check if we have enough days
    if (data.days.length < Math.min(requestedDays, 1)) return `Insufficient days generated: ${data.days.length}/${requestedDays}`;

    for (const day of data.days) {
        if (!day.locations || !Array.isArray(day.locations) || day.locations.length === 0) {
            return `Day ${day.dayNumber || 'unknown'} has no locations`;
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
            select: { plan: true }
        });

        if (!user || user.plan === "FREE") {
            return NextResponse.json(
                { error: "Upgrade your plan to use AI Trip Planning.", requiresUpgrade: true },
                { status: 403 }
            );
        }

        // 2. Parse request
        const body = await request.json();
        const { destination, startDate, endDate, budget, travelStyle, numberOfPeople, customRequirements, mapsListUrl, language } = body;

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
                    ? `IMPORTANT DATA SOURCE: The user provided a Google Maps List (${mapsListUrl}). You MUST analyze these locations and prioritize them. 
                       - Treat all locations in the list as mandatory or highly preferred.
                       - If there are too many for the timeframe, select the most relevant ones.
                       - Group locations from this list that are in the same geographic area to optimize the route.`
                    : "";

                const prompt = `You are the "Viatio AI Architect", a world-class travel engineering expert and luxury consultant specializing in high-density, high-efficiency itineraries.

OBJECTIVE: Design an elite ${numberOfDays}-day "1-shot" complete itinerary for ${destination}. 

STRICT PLANNING RULES (The 1-Shot Rule):
1. MANDATORY DENSITY: Each day MUST have at least 4-5 points of interest, covering "Morning", "Lunch", "Afternoon 1", "Afternoon 2", and "Dinner/Night" blocks.
2. TIME REALISM: No single activity window should exceed 2h30, unless it is a major landmark (e.g., Vatican, Louvre, or a long trek).
3. BUFFER & TRANSITIONS: Calculate logical travel times between points. Every activity MUST start with a 15-30 min "Note" regarding the transition from the previous location.
4. GEOGRAPHIC CLUSTERING: Group activities by neighborhood or zone. Do NOT cross the city more than twice a day.
5. ADAPTIVE LOGIC: Only provide fewer locations if the user specifically asked for "Relaxed" or if an activity is inherently long (e.g., a 6-hour hike).
6. COMPLETE EXPERIENCE: Always include specific suggestions for breakfast/coffee and dinner to ensure a seamless "1-shot" day.

DATA PROCESSING:
${mapsInstruction}

LANGUAGE & LOCALIZATION:
- All output MUST be in ${langName}. If Portuguese, use flawless "Português de Portugal" (PT-PT).

Context:
- Dates: ${startDate} to ${endDate}
- Budget: ${budget ? `€${budget}` : "flexible"}
- Style: ${travelStyle || "balanced"}
- Travelers: ${numberOfPeople || 2}
- Custom Requirements: ${customRequirements || "None"}

${concisenessInstruction}

Return ONLY a valid JSON object in this format:
{
  "title": "Elite Portfolio Title",
  "description": "Sophisticated executive summary of the strategy",
  "days": [
    {
      "dayNumber": 1,
      "title": "Daily Architectural Theme",
      "locations": [
        {
          "name": "Location Name",
          "timeSlot": "HH:MM - HH:MM",
          "description": "Appealing, short insight with transportation buffer note",
          "lat": 0.0,
          "lng": 0.0,
          "category": "Cultura|Gastronomia|Lazer|Transporte|Natureza",
          "tag": "culture|nature|food|adventure|relaxation|nightlife|shopping",
          "mapsUrl": "https://www.google.com/maps/search/?api=1&query=LOC+DEST"
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

        // 4. Save to database
        const trip = await prisma.trip.create({
            data: {
                title: finalItinerary.title || `${destination} Trip`,
                description: finalItinerary.description || `AI-planned trip to ${destination}`,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                ownerId: session.userId as string,
                days: {
                    create: finalItinerary.days.map((day: any) => ({
                        dayNumber: day.dayNumber,
                        title: day.title || `Day ${day.dayNumber}`,
                        locations: {
                            create: (day.locations || []).map((loc: any) => ({
                                name: loc.name || "Unknown Location",
                                description: loc.description || "",
                                timeSlot: loc.timeSlot || null,
                                lat: parseFloat(loc.lat) || 0,
                                lng: parseFloat(loc.lng) || 0,
                                tag: loc.tag || null,
                                mapsUrl: loc.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name} ${destination}`)}`,
                            }))
                        }
                    }))
                }
            }
        });

        return NextResponse.json({ tripId: trip.id, title: trip.title });

    } catch (error: any) {
        console.error("Critical AI Plan Trip error:", error);
        return NextResponse.json(
            { error: "A server error occurred while building your trip. Our engineers have been notified." },
            { status: 500 }
        );
    }
}
