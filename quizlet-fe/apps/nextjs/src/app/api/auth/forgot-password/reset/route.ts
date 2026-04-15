import { NextRequest, NextResponse } from "next/server";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

/**
 * POST /api/auth/forgot-password/reset
 * Xác thực OTP và đặt lại mật khẩu mới.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BE_URL}/api/auth/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Đặt lại mật khẩu thất bại" },
        { status: res.status },
      );
    }

    return NextResponse.json({ message: data?.message ?? "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
