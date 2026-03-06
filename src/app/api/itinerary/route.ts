import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In a real app, this ID would come from a URL parameter (e.g. /api/itinerary/[tripId])
// For the scope of this migration, we'll fetch the first trip found (our seeded Bali trip)
export async function GET() {
  try {
    const trip = await prisma.trip.findFirst({
      include: {
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
      return NextResponse.json({ error: "No Trips found in database." }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error reading from Prisma Database:', error);
    return NextResponse.json({ error: "Database Connection Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItinerary = await request.json();

    // 1. We must handle the relational updates. Since the frontend sends the "entire" updated itinerary object
    // replacing the entire nested structure is simplest via delete & create (or a massive nested upsert).
    // For simplicity in this demo, we can just delete the old arrays and create the new ones, or use Prisma nested writes.

    // A robust way to "replace" the days/locations/expenses for a specific trip:
    const tripId = newItinerary.id;

    // We do this in a transaction to ensure no data loss
    await prisma.$transaction(async (tx) => {
      // Delete old relations
      await tx.dayPlan.deleteMany({ where: { tripId } });
      await tx.expense.deleteMany({ where: { tripId } });

      // Insert new relations
      await tx.trip.update({
        where: { id: tripId },
        data: {
          title: newItinerary.title,
          participants: newItinerary.participants || [],
          days: {
            create: newItinerary.days.map((day: any) => ({
              id: day.id,
              dayNumber: day.dayNumber,
              title: day.title,
              locations: {
                create: day.locations.map((loc: any) => ({
                  id: loc.id,
                  name: loc.name,
                  description: loc.description || null,
                  lat: loc.lat,
                  lng: loc.lng,
                  completed: loc.completed || false,
                  tag: loc.tag || null,
                  mapsUrl: loc.mapsUrl || null,
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

    return NextResponse.json({ success: true, message: 'Itinerary saved to Postgres successfully' });
  } catch (error) {
    console.error('Error writing to Prisma Database:', error);
    return NextResponse.json({ error: 'Failed to save itinerary' }, { status: 500 });
  }
}
