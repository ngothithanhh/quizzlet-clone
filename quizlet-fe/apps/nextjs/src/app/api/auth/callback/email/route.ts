import { db } from "@acme/db/client";
import { Session, User } from "@acme/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, image } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.query.User.findFirst({
      where: eq(User.email, email),
    });

    if (!user) {
      // MySQL không hỗ trợ .returning() — insert rồi query lại
      const id = crypto.randomUUID();
      await db.insert(User).values({
        id,
        email,
        name: name || email.split("@")[0],
        image: image || null,
        emailVerified: new Date(),
      });

      user = await db.query.User.findFirst({ where: eq(User.id, id) });
    } else {
      const updateData: Record<string, unknown> = {};
      if (name && user.name !== name) updateData.name = name;
      if (image && user.image !== image) updateData.image = image;

      if (Object.keys(updateData).length > 0) {
        await db.update(User).set(updateData).where(eq(User.id, user.id));
        user = await db.query.User.findFirst({ where: eq(User.id, user.id) });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
    }

    // Create NextAuth session
    const sessionToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(Session).values({
      sessionToken,
      userId: user.id,
      expires: expiresAt,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });

    response.cookies.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
