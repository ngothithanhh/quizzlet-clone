"use client";

import { useState } from "react";
import { LoaderIcon, AlertCircle } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { useAuth } from "~/contexts/auth-context";

interface LoginWithEmailProps {
  onSuccess?: () => void;
}

const LoginWithEmail: React.FC<LoginWithEmailProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Gọi AuthContext.login() → POST /api/auth/login (Next.js route)
      // → BE POST /api/auth/login/profile → trả { accessToken, refreshToken, user }
      // → Token được lưu vào httpOnly cookie bởi Next.js route handler
      const result = await login(email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess?.();
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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="w-full pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
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
