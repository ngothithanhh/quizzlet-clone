"use client";

import { useState } from "react";

import LoginWithEmail from "~/components/login/login-with-email";
import LoginWithOAuth from "~/components/login/login-with-oauth";
import { useLoginDialogContext } from "~/contexts/login-dialog-context";

const LoginFormDialog = () => {
  const [activeTab, setActiveTab] = useState<"email" | "oauth">("email");
  const { onOpenChange } = useLoginDialogContext();

  const handleLoginSuccess = () => {
    onOpenChange(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switch */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("email")}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === "email"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Email & Password
        </button>
        <button
          onClick={() => setActiveTab("oauth")}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === "oauth"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Google
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "email" && (
          <LoginWithEmail onSuccess={handleLoginSuccess} />
        )}
        {activeTab === "oauth" && (
          <LoginWithOAuth onSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default LoginFormDialog;
