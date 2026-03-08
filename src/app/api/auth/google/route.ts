import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { setSession } from "@/lib/auth";

const prisma = new PrismaClient();

// This is a minimal implementation for handling Google OAuth callbacks.
// To use in production, replace with actual ID token verification using google-auth-library
export async function POST(req: Request) {
    try {
        const { email, name, googleId, picture } = await req.json();

        if (!email || !googleId) {
            return NextResponse.json({ error: "Missing required OAuth fields" }, { status: 400 });
        }

        // 1. Find or Create the user securely via Google ID
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // Update an existing user to link their Google account if it wasn't linked
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { email },
                    data: { googleId }
                });
            }
        } else {
            // Register a new user bypassing password
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || "Google User",
                    googleId,
                    // No password needed for OAuth
                }
            });
        }

        // 2. Set the secure Edge JWT session
        await setSession(user.id, user.role);

        return NextResponse.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 });
    }
}
