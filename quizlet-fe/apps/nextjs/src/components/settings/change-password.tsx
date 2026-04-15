"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@acme/ui/card";
import { useAuth } from "~/contexts/auth-context";

const ChangePassword = () => {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    if (pw.length < 6) return 1;
    if (pw.length < 10) return 2;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 4;
    return 3;
  };

  const strength = passwordStrength(newPassword);
  const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword === oldPassword) {
      setError("Mật khẩu mới không được trùng mật khẩu cũ.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.");
        return;
      }

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Đổi mật khẩu thành công!");
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
      {/* Left label */}
      <div className="flex items-center gap-2 lg:basis-48 lg:flex-col lg:justify-center lg:pt-8">
        <Lock size={40} className="text-indigo-600 dark:text-indigo-400" />
        <span className="text-xl font-semibold">Change Password</span>
      </div>

      {/* Card */}
      <Card className="flex-1">
        <CardHeader>
          <span className="text-xl font-semibold">Đổi mật khẩu</span>
          <p className="text-sm text-muted-foreground">
            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-xl p-4">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Đổi mật khẩu thành công!
                </p>
              </div>
            )}

            {/* Old Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowOld((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
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
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      strength === 1
                        ? "text-red-500"
                        : strength === 2
                          ? "text-orange-500"
                          : strength === 3
                            ? "text-yellow-600"
                            : "text-green-600"
                    }`}
                  >
                    Độ mạnh: {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-background text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-400 focus:ring-red-400"
                      : confirmPassword && confirmPassword === newPassword
                        ? "border-green-400 focus:ring-green-400"
                        : "border-input focus:ring-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Mật khẩu không khớp</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
