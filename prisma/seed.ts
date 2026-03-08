import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const itineraryJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/initialItinerary.json'), 'utf-8'));
const itineraryData = itineraryJson as any;

async function main() {
    console.log('Start seeding ...');

    // Create an Admin user to own the seed trip
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@system.local' },
        update: {},
        create: {
            email: 'admin@system.local',
            name: 'System Admin',
            role: 'ADMIN',
            plan: 'YEARLY'
        }
    });

    // Create the main Trip
    const trip = await prisma.trip.create({
        data: {
            title: "Bali Expedition",
            description: "15-Day Expedition",
            ownerId: adminUser.id,
            participants: {
                connect: [{ id: adminUser.id }]
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

    console.log(`Created Trip with id: ${trip.id}`);
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
