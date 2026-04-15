import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const res = await fetch(`${BE_URL}/api/auth/login/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      return NextResponse.json(
        { error: err.message ?? "Login failed" },
        { status: res.status },
      );
    }

    const data = await res.json();
    // data = { accessToken, refreshToken, user: { id, email, username, ... } }

    const response = NextResponse.json({ user: data.user });

    const cookieStore = cookies();
    const secure = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24; // 24h

    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    if (data.refreshToken) {
      response.cookies.set("refresh_token", data.refreshToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
