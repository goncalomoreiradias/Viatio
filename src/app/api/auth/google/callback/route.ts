import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { signToken } from "@/lib/auth";
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

        // 4. Issue our proprietary Session JWT (Manually constructing cookie for Vercel V8 edge bugs)
        const token = await signToken({ userId: user.id, role: user.role, name: user.name || undefined });
        const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days
        const isProd = process.env.NODE_ENV === "production";

        const cookieString = `bali_session=${token}; HttpOnly; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax${isProd ? '; Secure' : ''}`;

        // 5. Redirect back to Application with the Cookie forcefully attached to the Headers
        return new Response(null, {
            status: 302,
            headers: {
                "Location": `${url.origin}/`,
                "Set-Cookie": cookieString
            }
        });

    } catch (error: any) {
        console.error("Google OAuth Exchange error:", error);
        const url = new URL(req.url);

        // Pass the actual system error so we can read it on the login page in prod
        const errMessage = error?.message || "Failed+to+authenticate+with+Google";
        const encodedError = encodeURIComponent(errMessage);

        return NextResponse.redirect(`${url.origin}/login?error=${encodedError}`);
    }
}
