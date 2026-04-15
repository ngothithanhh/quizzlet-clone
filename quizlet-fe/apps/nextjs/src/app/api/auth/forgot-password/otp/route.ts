import { NextRequest, NextResponse } from "next/server";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

/**
 * POST /api/auth/forgot-password/otp
 * Gửi OTP về email để reset mật khẩu.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const res = await fetch(
      `${BE_URL}/api/auth/forgot-password/otp?email=${encodeURIComponent(email)}`,
      { method: "POST" },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Không thể gửi OTP" },
        { status: res.status },
      );
    }

    return NextResponse.json({ message: data?.message ?? "OTP đã được gửi" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
