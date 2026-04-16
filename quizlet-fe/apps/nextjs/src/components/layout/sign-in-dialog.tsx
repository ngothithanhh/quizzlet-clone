"use client";

import { useState } from "react";
import type { PropsWithChildren } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import SignInWithOauth from "./sign-in-with-oauth";
import SignUpWithEmail from "./sign-up-with-email";

const SignInDialog = ({ children }: PropsWithChildren) => {
  const { open, onOpenChange } = useSignInDialogContext();
  const [activeTab, setActiveTab] = useState<"google" | "email">("google");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản</DialogTitle>
          <DialogDescription>
            Đăng ký để bắt đầu học ngay.
          </DialogDescription>
        </DialogHeader>
        
        {/* Tab Switch */}
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("google")}
            className={`pb-2 px-3 text-sm font-semibold transition-colors ${
              activeTab === "google"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Đăng ký nhanh
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`pb-2 px-3 text-sm font-semibold transition-colors ${
              activeTab === "email"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Đăng ký bằng Email
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "google" && <SignInWithOauth />}
          {activeTab === "email" && <SignUpWithEmail />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
