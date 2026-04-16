import { NextRequest, NextResponse } from "next/server";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

/**
 * POST /api/auth/callback/email
 * Handles OAuth email callback by forwarding user info to the Spring Boot backend.
 * Backend is expected to return { accessToken, refreshToken, id, email, username, avatarUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, image } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Forward to Spring Boot backend to handle OAuth user upsert + token generation
    const res = await fetch(`${BE_URL}/api/auth/oauth/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, image }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "OAuth callback failed" }));
      return NextResponse.json(
        { error: err.message ?? "OAuth callback failed" },
        { status: res.status }
      );
    }

    const data = await res.json();

    const user = {
      id: data.id,
      email: data.email,
      username: data.username,
      avatarUrl: data.avatarUrl,
    };

    const response = NextResponse.json({ success: true, user });

    const isProduction = process.env.NODE_ENV === "production";

    if (data.accessToken) {
      response.cookies.set("access_token", data.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24h
      });
    }

    if (data.refreshToken) {
      response.cookies.set("refresh_token", data.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Email callback error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
