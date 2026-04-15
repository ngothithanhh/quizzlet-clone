import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

/**
 * POST /api/auth/refresh
 * Dùng refresh_token cookie để lấy access_token mới từ BE.
 * Trả về access_token mới và set lại cookie.
 */
export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(
      `${BE_URL}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST" },
    );

    if (!res.ok) {
      // Refresh token hết hạn hoặc không hợp lệ → clear cookies
      const response = NextResponse.json(
        { error: "Refresh token expired" },
        { status: 401 },
      );
      response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
      return response;
    }

    const data = await res.json();
    const newAccessToken: string = data.accessToken;

    const secure = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ accessToken: newAccessToken });
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch (err) {
    console.error("Refresh token error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
