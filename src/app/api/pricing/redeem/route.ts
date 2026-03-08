import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
        }

        if (coupon.usesLeft <= 0 || (coupon.expiresAt && new Date() > new Date(coupon.expiresAt))) {
            return NextResponse.json({ error: "Coupon is expired or has reached its usage limit" }, { status: 400 });
        }

        const userId = session.userId as string;

        // Apply transaction to deduct coupon usage and upgrade user
        await prisma.$transaction(async (tx) => {
            // Deduct usage
            await tx.coupon.update({
                where: { id: coupon.id },
                data: { usesLeft: coupon.usesLeft - 1 }
            });

            // Upgrade User Profile
            await tx.user.update({
                where: { id: userId },
                data: { plan: coupon.planGranted }
            });

            // Write Admin Log for traceability
            await tx.adminLog.create({
                data: {
                    userId: userId,
                    action: "COUPON_REDEEMED",
                    details: `Redeemed coupon ${code} for plan ${coupon.planGranted}`,
                }
            });
        });

        return NextResponse.json({ success: true, newPlan: coupon.planGranted, message: `Successfully upgraded to ${coupon.planGranted} plan` });
    } catch (error) {
        console.error('Error redeeming coupon:', error);
        return NextResponse.json({ error: "Failed to redeem coupon" }, { status: 500 });
    }
}
