import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { subject, message } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: String(session.userId),
                subject,
                message,
                status: "OPEN"
            }
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.error("Failed to create ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only allow admins to fetch ALL tickets. Users fetch only their own.
        // For /api/tickets, we will just return the current user's tickets.
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: String(session.userId) },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(tickets, { status: 200 });
    } catch (error) {
        console.error("Failed to retrieve tickets:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
