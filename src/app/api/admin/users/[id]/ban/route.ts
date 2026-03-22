import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        
        // Only allow ADMIN role 
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isBanned } = await request.json();

        if (typeof isBanned !== "boolean") {
            return NextResponse.json({ error: "Invalid status format" }, { status: 400 });
        }

        // Prevent admin from banning themselves
        if (session.userId === params.id) {
            return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: { isBanned }
        });

        // Log the action implicitly or let the admin view reflect it
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error toggling user ban status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
