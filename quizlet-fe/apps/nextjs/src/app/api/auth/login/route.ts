import { NextRequest, NextResponse } from "next/server";

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

    // BE trả về flat object: { id, username, email, avatarUrl, accessToken, refreshToken }
    const data = await res.json();

    // Xây dựng user object từ các field của LoginResponse
    const user = {
      id: data.id,
      email: data.email,
      username: data.username,
      avatarUrl: data.avatarUrl,
    };

    const response = NextResponse.json({ user });

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24; // 24h

    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
