import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

/**
 * POST /api/auth/change-password
 * Đổi mật khẩu khi đã đăng nhập. Yêu cầu access_token cookie.
 */
export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const res = await fetch(`${BE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Đổi mật khẩu thất bại" },
        { status: res.status },
      );
    }

    return NextResponse.json({ message: data?.message ?? "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
