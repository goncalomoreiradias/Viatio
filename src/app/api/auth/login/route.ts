import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { setSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (!user.password) {
            return NextResponse.json({ error: "Please log in using your Google or Apple account." }, { status: 400 });
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        await setSession(user.id, user.role);

        return NextResponse.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    }
}
