"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  // Step 1
  const [email, setEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Step 2
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // ─── Cooldown countdown ───────────────────────────────────────────────────
  const startCooldown = (seconds = 60) => {
    setCooldown(seconds);
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ─── Step 1: Gửi OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSendingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/auth/forgot-password/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error ?? "Không thể gửi OTP. Vui lòng thử lại.");
        return;
      }

      setOtpSent(true);
      startCooldown(60);
      setStep("reset");
    } catch {
      setOtpError("Lỗi kết nối. Vui lòng kiểm tra mạng.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Gửi lại OTP (từ step 2)
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setSendingOtp(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/forgot-password/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        startCooldown(60);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // ─── Step 2: Đặt lại mật khẩu ────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode: otp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error ?? "Đặt lại mật khẩu thất bại. OTP có thể đã hết hạn.");
        return;
      }

      setStep("done");
    } catch {
      setResetError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        {step !== "done" && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 mb-8 transition-colors"
          >
            <ArrowLeft size={15} />
            Quay lại trang chủ
          </Link>
        )}

        {/* ── Step indicator ── */}
        {step !== "done" && (
          <div className="flex items-center gap-2 mb-8">
            {/* Step 1 dot */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                step === "email"
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {step === "reset" ? <CheckCircle2 size={16} /> : "1"}
            </div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            {/* Step 2 dot */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                step === "reset"
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900"
                  : "bg-gray-200 text-gray-400 dark:bg-gray-700"
              }`}
            >
              2
            </div>
          </div>
        )}

        {/* ════════ STEP 1: Email ════════ */}
        {step === "email" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 mb-6">
              <KeyRound size={28} className="text-indigo-600 dark:text-indigo-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Quên mật khẩu?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-5">
              {otpError && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{otpError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={sendingOtp}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {sendingOtp ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã OTP"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ════════ STEP 2: OTP + Mật khẩu mới ════════ */}
        {step === "reset" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 mb-6">
              <ShieldCheck size={28} className="text-indigo-600 dark:text-indigo-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Xác nhận OTP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Chúng tôi đã gửi mã OTP tới
            </p>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-8">
              {email}
            </p>

            <form onSubmit={handleReset} className="space-y-5">
              {resetError && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{resetError}</p>
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã OTP
                </label>
                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Nhập mã OTP 6 chữ số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    disabled={resetting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition tracking-widest text-center text-lg font-mono disabled:opacity-60"
                  />
                </div>
                {/* Resend OTP */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || sendingOtp}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition"
                  >
                    {cooldown > 0
                      ? `Gửi lại sau ${cooldown}s`
                      : sendingOtp
                        ? "Đang gửi..."
                        : "Gửi lại OTP"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Ít nhất 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={resetting}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength */}
                {newPassword && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= i * 3
                            ? i <= 2
                              ? "bg-orange-400"
                              : "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={resetting}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-red-400 focus:ring-red-400"
                        : confirmPassword && confirmPassword === newPassword
                          ? "border-green-400 focus:ring-green-400"
                          : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500">Mật khẩu không khớp</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setResetError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={resetting || !otp || !newPassword || !confirmPassword}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                >
                  {resetting ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════ STEP 3: Thành công ════════ */}
        {step === "done" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/30 mx-auto mb-6">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đặt lại thành công!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập lại.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            >
              Về trang chủ & Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
