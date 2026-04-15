import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/quizzlet-clone";

export async function GET(_req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const res = await fetch(`${BE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await res.json();
  return NextResponse.json({ user, accessToken: token });
}
