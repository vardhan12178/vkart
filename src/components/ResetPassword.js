import React, { useMemo, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline";

const cx = (...c) => c.filter(Boolean).join(" ");

const Toast = ({ show, kind = "error", children }) => {
  if (!show) return null;
  const palette =
    kind === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : "bg-red-50 text-red-800 ring-1 ring-red-200";
  const Icon = kind === "success" ? CheckCircleIcon : ExclamationCircleIcon;
  return (
    <div className={cx("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", palette)} aria-live="polite">
      <Icon className="h-4 w-4" />
      <div>{children}</div>
    </div>
  );
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = useMemo(() => new URLSearchParams(search).get("token") || "", [search]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [errors, setErrors] = useState({ password: "", confirm: "" });

  const validate = () => {
    const e = { password: "", confirm: "" };
    if (!password || password.length < 8) e.password = "Use at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    if (!e.password && !e.confirm && password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return !e.password && !e.confirm;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setOkMsg("");
    setErrMsg("");
    if (!token) {
      setErrMsg("Missing or invalid reset link.");
      return;
    }
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/reset", {
        token,
        password,
        confirmPassword: confirm,
      });
      setOkMsg(data?.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Reset failed. Try again or request a new link.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-500"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sign in
        </button>

        <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
            <p className="mt-2 text-sm text-gray-500">Choose a strong password and keep it safe.</p>
          </div>

          <div className="space-y-3">
            <Toast show={!!okMsg} kind="success">{okMsg}</Toast>
            <Toast show={!!errMsg}>{errMsg}</Toast>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              New password
            </label>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={cx(
                  "block w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-gray-900 shadow-sm outline-none transition",
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-gray-600 hover:text-orange-600"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.password}
              </p>
            )}

            <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className={cx(
                  "block w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-gray-900 shadow-sm outline-none transition",
                  errors.confirm
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-gray-600 hover:text-orange-600"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.confirm}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered it?{" "}
            <button onClick={() => navigate("/login")} className="font-semibold text-orange-600 hover:text-orange-500">
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
