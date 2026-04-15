"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon, AlertCircle, CheckCircle } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";

const SignUpWithEmail = () => {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { onOpenChange } = useSignInDialogContext();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/otp?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to send OTP");
        return;
      }

      setSuccess("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while sending OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: `${firstName} ${lastName}`,
            email,
            password,
            otpCode: otp,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
        return;
      }

      const data = await response.json();

      // Create NextAuth session with registered user info from backend
      try {
        await fetch("/api/auth/callback/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email || email,
            name: data.username || `${firstName} ${lastName}`,
            image: null, // Avatar can be set later by user
          }),
        });
      } catch (sessionError) {
        console.error("Session creation error:", sessionError);
      }

      setSuccess("Account created successfully!");
      
      // Close dialog and redirect
      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
        router.push("/");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    handleSendOtp(e);
  };

  return (
    <form onSubmit={step === "details" ? handleNextStep : handleVerifyOtp} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Step: User Details */}
      {step === "details" && (
        <>
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
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
            <Label htmlFor="password" className="block text-sm font-medium mb-1">
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
            <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <LoaderIcon size={16} className="animate-spin mr-2" />
                Sending OTP...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </>
      )}

      {/* Step: OTP Verification */}
      {step === "otp" && (
        <>
          <div>
            <p className="text-sm text-gray-600 mb-3">
              We've sent a code to <span className="font-semibold">{email}</span>
            </p>

            <Label htmlFor="otp" className="block text-sm font-medium mb-1">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={loading}
              required
              maxLength={6}
              className="w-full text-center text-xl tracking-widest"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <LoaderIcon size={16} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <button
            type="button"
            onClick={() => setStep("details")}
            className="w-full text-indigo-600 hover:text-indigo-700 text-sm font-semibold py-1"
          >
            Change Email
          </button>
        </>
      )}
    </form>
  );
};

export default SignUpWithEmail;
