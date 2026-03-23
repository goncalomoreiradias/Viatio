import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getSession();
        
        // This config should be public to allow LandingPage and Pricing models to fetch it,
        // but for now, we'll return it if there's no session (for landing) or any session.
        let config = await prisma.pricingConfig.findFirst();

        // If no config exists, seed a default one using upsert-like logic
        if (!config) {
            config = await prisma.pricingConfig.create({
                data: {
                    id: "singleton"
                }
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to fetch PricingConfig:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();
        
        // STRICT ADMIN ONLY
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const data = await request.json();

        // Update the singleton row. 
        const updatedConfig = await prisma.pricingConfig.upsert({
            where: { id: "singleton" },
            update: {
                singleTripPrice: data.singleTripPrice,
                singleTripAiMax: data.singleTripAiMax,
                singleTripBList: data.singleTripBList,
                monthlyPrice: data.monthlyPrice,
                monthlyAiMax: data.monthlyAiMax,
                monthlyBList: data.monthlyBList,
                yearlyPrice: data.yearlyPrice,
                yearlyAiMax: data.yearlyAiMax,
                yearlyBList: data.yearlyBList,
            },
            create: {
                id: "singleton",
                singleTripPrice: data.singleTripPrice,
                singleTripAiMax: data.singleTripAiMax,
                singleTripBList: data.singleTripBList,
                monthlyPrice: data.monthlyPrice,
                monthlyAiMax: data.monthlyAiMax,
                monthlyBList: data.monthlyBList,
                yearlyPrice: data.yearlyPrice,
                yearlyAiMax: data.yearlyAiMax,
                yearlyBList: data.yearlyBList,
            }
        });

        // Log the administrative action
        await prisma.adminLog.create({
            data: {
                userId: session.userId as string,
                action: "UPDATE_PRICING_CONFIG",
                details: `Updated dynamic pricing rules.`
            }
        });

        return NextResponse.json(updatedConfig);
    } catch (error) {
        console.error("Failed to update PricingConfig:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
