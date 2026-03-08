import { NextResponse } from 'next/server';
import { PrismaClient, PlanTier } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        if (i === 4) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { planGranted, usesLeft, expiresAt } = body;

        if (!planGranted || !Object.keys(PlanTier).includes(planGranted)) {
            return NextResponse.json({ error: "Invalid Plan Tier" }, { status: 400 });
        }

        const code = generateRandomCode();

        const coupon = await prisma.coupon.create({
            data: {
                code,
                planGranted,
                usesLeft: parseInt(usesLeft) || 1,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: session.userId as string
            }
        });

        await prisma.adminLog.create({
            data: {
                userId: session.userId as string,
                action: "COUPON_CREATED",
                details: `Generated coupon ${code} for plan ${planGranted} with ${usesLeft} uses`
            }
        });

        return NextResponse.json({ coupon });

    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Failed to generate coupon" }, { status: 500 });
    }
}
