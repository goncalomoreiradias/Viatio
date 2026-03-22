import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.userId as string;

        // Only fetch trips where the user is the owner OR a participant
        const trips = await prisma.trip.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { participants: { some: { id: userId } } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                participants: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return NextResponse.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, password, startDate, endDate, bucketListUrls } = body;

        const userId = session.userId as string;

        // Check Free Tier Limit
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true, _count: { select: { ownedTrips: true } } }
        });

        if (!user) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.plan === "FREE" && user._count.ownedTrips >= 3) {
             return NextResponse.json({ error: "Free tier limit reached (max 3 trips). Please upgrade." }, { status: 403 });
        }

        // Normalize: accept string or array for backwards compat
        const urls = Array.isArray(bucketListUrls)
            ? bucketListUrls.filter((u: string) => u && u.trim())
            : (bucketListUrls ? [bucketListUrls] : []);

        const newTrip = await prisma.trip.create({
            data: {
                title,
                description,
                password,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                bucketListUrls: urls,
                ownerId: userId,
                // Automatically add the creator as a participant as well for easier querying
                participants: {
                    connect: [{ id: userId }]
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Log the creation
        await prisma.adminLog.create({
            data: {
                userId: userId,
                action: "TRIP_CREATED",
                details: `Trip '${title}' created.`,
            }
        });

        return NextResponse.json(newTrip, { status: 201 });
    } catch (error) {
        console.error('Error creating trip:', error);
        return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
    }
}
