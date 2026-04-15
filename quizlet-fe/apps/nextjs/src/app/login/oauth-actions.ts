"use server";

import { signIn } from "@acme/auth";

export async function signInWithGoogle() {
  try {
    await signIn("google", {
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}
