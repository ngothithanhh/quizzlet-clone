import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

export async function GET(_req: NextRequest) {
  const cookieStore = cookies();
  let token = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!token && !refreshToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Thử gọi BE với access_token hiện tại
  if (token) {
    const res = await fetch(`${BE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const user = await res.json();
      return NextResponse.json({ user, accessToken: token });
    }

    // access_token hết hạn → thử refresh
    if (res.status !== 401) {
      return NextResponse.json({ user: null }, { status: res.status });
    }
  }

  // Tự động refresh access_token bằng refresh_token
  if (!refreshToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const refreshRes = await fetch(
      `${BE_URL}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST" },
    );

    if (!refreshRes.ok) {
      // Refresh token hết hạn → xóa cookies
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
      return response;
    }

    const refreshData = await refreshRes.json();
    token = refreshData.accessToken as string;

    // Gọi lại lấy user với token mới
    const userRes = await fetch(`${BE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await userRes.json();
    const secure = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ user, accessToken: token });
    // Set lại cookie access_token mới
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("Auto refresh error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
