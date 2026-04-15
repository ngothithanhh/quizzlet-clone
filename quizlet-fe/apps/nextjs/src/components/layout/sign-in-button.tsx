"use client";

import React from "react";

import { Button } from "@acme/ui/button";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import { useLoginDialogContext } from "~/contexts/login-dialog-context";

export default function SignInButton() {
  const { onOpenChange: onSignUpOpen } = useSignInDialogContext();
  const { onOpenChange: onLoginOpen } = useLoginDialogContext();

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => onLoginOpen(true)} variant="outline">
        Log In
      </Button>
      <Button onClick={() => onSignUpOpen(true)}>Sign Up</Button>
    </div>
  );
}
