import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

// Fetch a specific trip by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const trip = await prisma.trip.findUnique({
            where: { id },
            include: {
                participants: { select: { id: true, name: true, email: true } },
                days: {
                    include: {
                        locations: {
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { dayNumber: 'asc' }
                },
                expenses: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!trip) {
            return NextResponse.json({ error: "Trip not found." }, { status: 404 });
        }

        // --- Privacy Isolation Check ---
        // Verify if the active user is the owner or in the participants list
        const isParticipant = trip.participants.some(p => p.id === session.userId);
        if (trip.ownerId !== session.userId && !isParticipant) {
            return NextResponse.json({ error: "Forbidden: You do not have access to this trip" }, { status: 403 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        console.error('Error reading trip from Database:', error);
        return NextResponse.json({ error: "Database Connection Error" }, { status: 500 });
    }
}

// Update a specific trip
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: tripId } = await params;
        const newItinerary = await request.json();

        // 1. Verify Ownership
        const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } });
        if (!trip) {
            return NextResponse.json({ error: "Trip not found." }, { status: 404 });
        }
        if (trip.ownerId !== session.userId) {
            // Only the owner can execute massive PUTs to override the entire trip currently
            return NextResponse.json({ error: "Forbidden: Only the Trip Owner can modify the core itinerary." }, { status: 403 });
        }

        // Use a transaction to safely swap out days and expenses
        await prisma.$transaction(async (tx) => {
            // Delete old relations for this trip
            await tx.dayPlan.deleteMany({ where: { tripId } });
            await tx.expense.deleteMany({ where: { tripId } });

            // Ensure the owner cannot be accidentally removed from connectivity arrays if passed
            // For simplicity in this massive update block, we will just apply the data creation 
            await tx.trip.update({
                where: { id: tripId },
                data: {
                    title: newItinerary.title,
                    bucketListUrl: newItinerary.bucketListUrl || null,
                    // If you want to update participants from user IDs you would use connect/disconnect. 
                    // Skipping participants update here unless explicitly sent as user IDs

                    days: {
                        create: (newItinerary.days || []).map((day: any) => ({
                            id: day.id,
                            dayNumber: day.dayNumber,
                            title: day.title,
                            locations: {
                                create: (day.locations || []).map((loc: any) => ({
                                    id: loc.id,
                                    name: loc.name,
                                    description: loc.description || null,
                                    lat: loc.lat,
                                    lng: loc.lng,
                                    completed: loc.completed || false,
                                    tag: loc.tag || null,
                                    mapsUrl: loc.mapsUrl || null,
                                    notes: loc.notes || null,
                                    timeSlot: loc.timeSlot || null,
                                })),
                            },
                        })),
                    },
                    expenses: {
                        create: (newItinerary.expenses || []).map((exp: any) => ({
                            id: exp.id,
                            amount: exp.amount,
                            description: exp.description,
                            paidBy: exp.paidBy,
                            date: new Date(exp.date),
                            category: exp.category || null,
                        })),
                    },
                },
            });
        });

        return NextResponse.json({ success: true, message: 'Trip updated successfully' });
    } catch (error) {
        console.error('Error updating trip in Database:', error);
        return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
    }
}

// Delete a specific trip
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.userId as string;

        // 1. Verify Ownership
        const trip = await prisma.trip.findUnique({ where: { id }, select: { ownerId: true } });
        if (!trip) {
            return NextResponse.json({ error: "Trip not found." }, { status: 404 });
        }
        if (trip.ownerId !== session.userId && session.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Only the Trip Owner or an Admin can delete this trip." }, { status: 403 });
        }

        await prisma.trip.delete({
            where: { id }
        });

        // Log the deletion
        await prisma.adminLog.create({
            data: {
                userId: userId,
                action: "TRIP_DELETED",
                details: `Trip ${id} deleted.`,
            }
        });

        return NextResponse.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error);
        return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
    }
}
