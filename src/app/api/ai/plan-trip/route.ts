import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        // 1. Auth & Plan Check
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Please log in first." }, { status: 401 });
        }

        // Check user plan from DB (session might be stale)
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

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (numberOfDays < 1 || numberOfDays > 30) {
            return NextResponse.json({ error: "Trip must be between 1 and 30 days." }, { status: 400 });
        }

        // 3. Call OpenRouter AI (Gemini 2.0 Flash)
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ 
                error: "AI service is not configured. Please add 'OPENROUTER_API_KEY' to your Vercel Environment Variables and redeploy." 
            }, { status: 500 });
        }

        const prompt = `You are a world-class travel architect and expert strategist. Your goal is to design a high-converting, localized travel experience that feels exclusive and perfectly optimized.
Create a detailed ${numberOfDays}-day luxury/optimized travel itinerary for ${destination}.

Context:
- Travel dates: ${startDate} to ${endDate}
- Budget per person: ${budget ? `€${budget}` : "flexible"}
- Travel style: ${travelStyle || "balanced"}
- Number of travelers: ${numberOfPeople || 2}
- User custom requirements: ${customRequirements || "None"}
- Google Maps List Link (USER PROVIDED): ${mapsListUrl || "Not provided"}

LANGUAGE REQUIREMENT:
You MUST return all content in ${langName}. This includes the trip title, description, day titles, and location descriptions. Use professional, engaging, and premium language.

IMPORTANT INSTRUCTION FOR GOOGLE MAPS LIST:
If a Google Maps List Link is provided, analyze the potential locations it might contain and prioritize including those spots or similar high-quality spots. Complement them with more amazing locations to fill the ${numberOfDays} days.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "title": "A high-converting trip title",
  "description": "A compelling 1-2 sentence trip description",
  "days": [
    {
      "dayNumber": 1,
      "title": "Architectural day theme",
      "locations": [
        {
          "name": "Location Name",
          "description": "Detailed architectural/travel insight (2-3 sentences)",
          "lat": -8.5069,
          "lng": 115.2625,
          "tag": "culture|nature|food|adventure|relaxation|nightlife|shopping",
          "mapsUrl": "https://maps.google.com/?q=lat,lng"
        }
      ]
    }
  ]
}

Requirements:
- Include 3-5 locations per day
- Use real, accurate GPS coordinates
- Provide REAL, high-quality Google Maps search URLs: https://www.google.com/maps/search/?api=1&query=LOCATION_NAME+DESTINATION
- Tags must be exactly: culture, nature, food, adventure, relaxation, nightlife, shopping`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": `https://bali2026.vercel.app`, // Optional
                "X-Title": `Bali Trip Planner`, // Optional
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "OpenRouter API error");
        }

        const aiResult = await response.json();
        const aiMessage = aiResult.choices[0].message.content;

        // 4. Parse AI response
        let itineraryData;
        try {
            let rawText = aiMessage || "";
            // Strip markdown code fences if present
            rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
            itineraryData = JSON.parse(rawText);
        } catch (parseError) {
            console.error("Failed to parse AI response:", aiMessage);
            return NextResponse.json({ error: "AI generated an invalid response. Please try again." }, { status: 500 });
        }

        // 5. Save to database
        const trip = await prisma.trip.create({
            data: {
                title: itineraryData.title || `${destination} Trip`,
                description: itineraryData.description || `AI-planned trip to ${destination}`,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                ownerId: session.userId as string,
                days: {
                    create: (itineraryData.days || []).map((day: any) => ({
                        dayNumber: day.dayNumber,
                        title: day.title || `Day ${day.dayNumber}`,
                        locations: {
                            create: (day.locations || []).map((loc: any) => {
                                // Programmatic fallback for Google Maps URL
                                let mapsUrl = loc.mapsUrl;
                                if (!mapsUrl || !mapsUrl.startsWith("http")) {
                                    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name} ${destination}`)}`;
                                }
                                
                                return {
                                    name: loc.name || "Unknown Location",
                                    description: loc.description || "",
                                    lat: parseFloat(loc.lat) || 0,
                                    lng: parseFloat(loc.lng) || 0,
                                    tag: loc.tag || null,
                                    mapsUrl: mapsUrl,
                                };
                            })
                        }
                    }))
                }
            },
            include: {
                days: { include: { locations: true } }
            }
        });

        return NextResponse.json({ tripId: trip.id, title: trip.title });

    } catch (error: any) {
        console.error("AI Plan Trip error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate trip plan." },
            { status: 500 }
        );
    }
}
