"use client";

import { Button } from "@acme/ui/button";

import GoogleIcon from "../icons/google";
import { signInWithGoogleSignUp } from "~/app/sign-up/oauth-actions";

export default function SignInWithOauth() {
  return (
    <form className="flex flex-col gap-2">
      <Button
        formAction={signInWithGoogleSignUp}
        variant="outline"
        className="w-full border border-gray-300 hover:bg-gray-50"
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Sign Up with Google
      </Button>
    </form>
  );
}
