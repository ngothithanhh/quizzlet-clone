import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const res = await fetch(
      `${BE_URL}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST" },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = await res.json();
    // data = { accessToken: "..." }

    const response = NextResponse.json({ success: true });

    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
