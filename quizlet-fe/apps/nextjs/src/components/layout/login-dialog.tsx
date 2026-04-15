"use client";

import type { PropsWithChildren } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { useLoginDialogContext } from "~/contexts/login-dialog-context";

const LoginDialog = ({ children }: PropsWithChildren) => {
  const { open, onOpenChange } = useLoginDialogContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log In</DialogTitle>
          <DialogDescription>
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
