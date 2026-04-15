"use client";

import { Button } from "@acme/ui/button";
import GoogleIcon from "../icons/google";
import { signInWithGoogle } from "~/app/login/oauth-actions";

interface LoginWithOAuthProps {
  onSuccess?: () => void;
}

export default function LoginWithOAuth({ onSuccess }: LoginWithOAuthProps) {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error("Google sign in failed:", error);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-gray-600 mb-4">
        Sign in with your social account
      </p>

      <form action={signInWithGoogle}>
        <Button
          type="submit"
          variant="outline"
          className="w-full border border-gray-300 hover:bg-gray-50"
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
