import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { setSession } from "@/lib/auth";

const prisma = new PrismaClient();

// This is a minimal implementation for handling Apple OAuth callbacks.
// Apple sign in is notoriously complex. In production, use `apple-signin-auth` to parse the `identityToken`.
export async function POST(req: Request) {
    try {
        const { email, name, appleId } = await req.json();

        if (!email || !appleId) {
            return NextResponse.json({ error: "Missing required Apple OAuth fields" }, { status: 400 });
        }

        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // Link existing user if logging in via Apple for the first time
            if (!user.appleId) {
                user = await prisma.user.update({
                    where: { email },
                    data: { appleId }
                });
            }
        } else {
            // Register new user 
            // Note: Apple only sends `name` on the VERY FIRST login instance. Afterwards name is null in their payload.
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || "Apple User",
                    appleId,
                }
            });
        }

        // Establish session
        await setSession(user.id, user.role);

        return NextResponse.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Apple OAuth error:", error);
        return NextResponse.json({ error: "Failed to authenticate with Apple" }, { status: 500 });
    }
}
