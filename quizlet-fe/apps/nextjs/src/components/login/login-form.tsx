"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import LoginWithEmail from "./login-with-email";
import LoginWithOAuth from "./login-with-oauth";

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState<"email" | "oauth">("email");
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push("/");
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
          Quick Login
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

export default LoginForm;
