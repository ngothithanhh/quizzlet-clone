"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon, AlertCircle } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

interface LoginWithEmailProps {
  onSuccess?: () => void;
}

const LoginWithEmail: React.FC<LoginWithEmailProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
        return;
      }

      const data = await response.json();

      // Save tokens to localStorage
      if (data.accessToken) {
        localStorage.setItem("access_token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }

        // Get user profile from backend
        try {
          const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${data.accessToken}`,
              },
            }
          );

          let userName = email.split("@")[0];
          let userImage = null;

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            userName = profileData.username || userName;
            userImage = profileData.avatarUrl || null;
          }

          // Create NextAuth session
          await fetch("/api/auth/callback/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              name: userName,
              image: userImage,
            }),
          });
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          // Continue with basic session
          await fetch("/api/auth/callback/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              name: email.split("@")[0],
            }),
          });
        }

        // Close dialog and redirect
        onSuccess?.();
        setTimeout(() => {
          router.refresh();
          router.push("/");
        }, 500);
      } else {
        setError(data.message || "Login failed - no token received");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {loading ? (
          <>
            <LoaderIcon size={18} className="animate-spin mr-2" />
            Logging in...
          </>
        ) : (
          "Log In"
        )}
      </Button>

      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
};

export default LoginWithEmail;
