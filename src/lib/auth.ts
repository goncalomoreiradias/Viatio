import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_prod";
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("bali_session")?.value;
    if (!session) return null;
    return await verifyToken(session);
}

export async function setSession(userId: string, role: string) {
    const token = await signToken({ userId, role });
    const cookieStore = await cookies();
    cookieStore.set("bali_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete("bali_session");
}
