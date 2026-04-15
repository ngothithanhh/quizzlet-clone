"use client";

import { Button } from "@acme/ui/button";
import GoogleIcon from "../icons/google";

export default function LoginWithOAuth() {
  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-gray-600 mb-4">
        Sign in with your social account
      </p>

      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full border border-gray-300 hover:bg-gray-50"
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
