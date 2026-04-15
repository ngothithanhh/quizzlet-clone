"use server";

import { signIn } from "@acme/auth";

export async function signInWithGoogleSignUp() {
  try {
    await signIn("google", {
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Google sign up error:", error);
    throw error;
  }
}
