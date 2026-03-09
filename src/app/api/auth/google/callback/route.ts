import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { setSession } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${url.origin}/api/auth/google/callback`;

        const client = new OAuth2Client(clientId, clientSecret, redirectUri);

        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
            return NextResponse.redirect(`${url.origin}/login?error=${error}`);
        }

        if (!code) {
            return NextResponse.redirect(`${url.origin}/login?error=Missing+Google+Auth+Code`);
        }

        // 1. Exchange the code for the JWT ID Token
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // 2. Verify the ID Token and extract User Info
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: clientId,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return NextResponse.redirect(`${url.origin}/login?error=Invalid+Google+Profile`);
        }

        const email = payload.email;
        const name = payload.name || "Google User";
        // const googleId = payload.sub; // The unique Google subject ID (could save if schema supported it)

        // 3. Find or Create the User in Postgres
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: Math.random().toString(36).slice(-10) + "_oauth",
                    role: "USER"
                }
            });
        }

        // 4. Issue our proprietary Session JWT
        await setSession(user.id, user.role, user.name || undefined);

        // 5. Redirect back to Application
        return NextResponse.redirect(`${url.origin}/`);

    } catch (error) {
        console.error("Google OAuth Exchange error:", error);
        const url = new URL(req.url);
        return NextResponse.redirect(`${url.origin}/login?error=Failed+to+authenticate+with+Google`);
    }
}
