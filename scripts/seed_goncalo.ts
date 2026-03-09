import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const itineraryJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/initialItinerary.json'), 'utf-8'));
const itineraryData = itineraryJson as any;

async function main() {
    const userEmail = "gmoreirad@gmail.com";
    console.log(`Start seeding trip for ${userEmail} ...`);

    // Create or find the user
    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            role: 'ADMIN',
            plan: 'YEARLY'
        },
        create: {
            email: userEmail,
            name: 'Gonçalo Moreira Dias',
            role: 'ADMIN',
            plan: 'YEARLY',
            password: 'seeded_oauth_stub'
        }
    });

    // Check if they already have a trip to prevent duplicates when script re-runs
    const existingTrips = await prisma.trip.findMany({
        where: { ownerId: user.id }
    });

    if (existingTrips.length > 0) {
        console.log(`User ${userEmail} already has trips. Skipping creation.`);
        return;
    }

    // Create the main Trip
    const trip = await prisma.trip.create({
        data: {
            title: "Bali Expedition",
            description: "15-Day Expedition",
            ownerId: user.id,
            participants: {
                connect: [{ id: user.id }]
            },
            days: {
                create: itineraryData.days.map((day: any) => ({
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
        },
    });

    console.log(`Successfully created Trip with id: ${trip.id} for ${userEmail}`);
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
