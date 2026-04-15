import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  // Redirect về trang chủ rồi set cookie qua NextResponse
  const response = NextResponse.redirect(new URL("/", req.url));

  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 86400, // 24h
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 86400 * 30, // 30 days
  });

  return response;
}
