// NextAuth đã bị xóa — route này không còn dùng
// Auth được xử lý bởi Spring Boot BE với JWT
import { NextResponse } from "next/server";

export const GET = () => NextResponse.json({ message: "Not implemented" }, { status: 404 });
export const POST = () => NextResponse.json({ message: "Not implemented" }, { status: 404 });
