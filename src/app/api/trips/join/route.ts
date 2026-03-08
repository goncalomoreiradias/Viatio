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
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Invite token is required" }, { status: 400 });
        }

        // Find the trip by the unique invite token
        const trip = await prisma.trip.findUnique({
            where: { inviteToken: token },
            include: { participants: { select: { id: true } } }
        });

        if (!trip) {
            return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 });
        }

        const userId = session.userId as string;

        // Check if user is already a participant or is the owner
        const isParticipant = trip.participants.some(p => p.id === userId);
        if (trip.ownerId === userId || isParticipant) {
            return NextResponse.json({ success: true, tripId: trip.id, message: "You are already part of this trip" });
        }

        // Add the user to the participants list
        await prisma.trip.update({
            where: { id: trip.id },
            data: {
                participants: {
                    connect: { id: userId }
                }
            }
        });

        return NextResponse.json({ success: true, tripId: trip.id, message: "Successfully joined the trip!" });

    } catch (error) {
        console.error('Error joining trip:', error);
        return NextResponse.json({ error: "Failed to join trip" }, { status: 500 });
    }
}
