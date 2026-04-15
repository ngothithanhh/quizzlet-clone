"use client";

import { Button } from "@acme/ui/button";

import GoogleIcon from "../icons/google";

export default function SignInWithOauth() {
  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleGoogleSignUp}
        variant="outline"
        className="w-full border border-gray-300 hover:bg-gray-50"
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Sign Up with Google
      </Button>
    </div>
  );
}
