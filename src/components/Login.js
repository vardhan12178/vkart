// src/pages/Login.jsx
import React, { useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate,useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import {
  EyeIcon,
  EyeOffIcon,
  ShoppingCartIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

const currentYear = new Date().getFullYear();
const cx = (...c) => c.filter(Boolean).join(" ");

const FieldError = ({ id, message }) =>
  !message ? null : (
    <p id={id} className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <ExclamationCircleIcon className="h-4 w-4" /> {message}
    </p>
  );

const Toast = ({ show, kind = "error", children }) => {
  if (!show) return null;
  const palette =
    kind === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800"
      : "bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-800";
  const Icon = kind === "success" ? CheckCircleIcon : ExclamationCircleIcon;
  return (
    <div
      className={cx("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", palette)}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
const redirect = new URLSearchParams(location.search).get("redirect") || "/";


  // base login state
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({ userId: "", password: "" });
  const passRef = useRef(null);

  // 2FA modal state
  const [show2fa, setShow2fa] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaError, setTwofaError] = useState("");
  const [verifying2fa, setVerifying2fa] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null); // {username,password,remember}

  const validate = () => {
    const e = { userId: "", password: "" };
    if (!userId.trim()) e.userId = "User ID is required.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return !e.userId && !e.password;
  };

  const onKeyEventCheckCaps = (ev) => {
    if (typeof ev.getModifierState === "function") {
      setCapsOn(!!ev.getModifierState("CapsLock"));
    }
  };

  // ------------ base submit ------------
  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    const start = performance.now();
    try {
      const payload = {
        username: userId.trim(),
        password,
        remember,
      };
      const res = await axios.post("/api/login", payload, {
        withCredentials: true,
      });

      // 2FA required -> open modal
      if (res.data?.require2FA) {
        setPendingLogin(payload);
        setShow2fa(true);
        setTwofaCode("");
        setTwofaError("");
        setLoading(false);
        return;
      }

      // normal login
      if (res.data?.token) localStorage.setItem("auth_token", res.data.token);
      setIsLoggedIn?.(true);
      navigate(redirect);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Invalid credentials. Please try again.");
      const took = performance.now() - start;
      if (took > 15000 && !apiMsg)
        setFormError("Server is waking up. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // ------------ 2FA verify submit ------------
  const submit2FA = async () => {
    if (!pendingLogin) return;
    const code = twofaCode.trim();
    if (!code || code.length < 6) {
      setTwofaError("Enter the 6-digit code");
      return;
    }
    setVerifying2fa(true);
    setTwofaError("");
    try {
      const verify = await axios.post(
        "/api/login",
        {
          ...pendingLogin,
          token2fa: code,
        },
        { withCredentials: true }
      );
      if (verify.data?.token) localStorage.setItem("auth_token", verify.data.token);
      setIsLoggedIn?.(true);
      setShow2fa(false);
      setPendingLogin(null);
      navigate(redirect);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setTwofaError(apiMsg || "Invalid or expired code. Try again.");
    } finally {
      setVerifying2fa(false);
    }
  };

  // allow Enter inside 2FA input
  const on2faKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit2FA();
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setFormError("");
    setGoogleLoading(true);
    try {
      const res = await axios.post(
        "/auth/google",
        { idToken: cred?.credential, remember },
        { withCredentials: true }
      );
      if (res?.data?.token) localStorage.setItem("auth_token", res.data.token);
      setIsLoggedIn?.(true);
      navigate(redirect);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Google sign-in failed. Try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () =>
    setFormError("Google sign-in was cancelled or failed.");

return (
  <>
    <Helmet>
      <title>Sign in — VKart</title>
      <meta
        name="description"
        content="Sign in to VKart to shop curated products, track orders, and enjoy fast delivery."
      />
    </Helmet>

    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100">
          <div className="flex justify-center items-center flex-1">
            <img
              src="/login.webp"
              alt="Shopping illustration"
              className="max-h-[320px] w-auto object-contain select-none pointer-events-none"
            />
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Everything you love, in one cart.
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Explore top brands, curated collections, and smart deals — all in one place.
            </p>
            <p className="mt-8 text-xs text-gray-400">
              © {currentYear} VKart. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="relative bg-white px-6 py-10 sm:px-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white shadow">
                <ShoppingCartIcon className="h-6 w-6" />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">VKart</span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to continue to your account
              </p>
            </div>

            {/* Google */}
            <div className="mt-4 flex justify-center">
              <div className="relative w-full sm:w-auto">
                {googleLoading && (
                  <div className="absolute inset-0 grid place-items-center rounded-md bg-white/70 backdrop-blur-sm">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                  </div>
                )}
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  ux_mode="popup"
                  useOneTap={false}
                  shape="rectangular"
                  text="continue_with"
                  theme="outline"
                />
              </div>
            </div>

            <div className="relative my-6">
              <hr className="border-gray-200" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
                or
              </span>
            </div>

            <div aria-live="polite" className="min-h-0">
              <Toast show={!!formError}>{formError}</Toast>
            </div>

            {/* FORM */}
            <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
              <label htmlFor="userId" className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="userId"
                  type="email"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onBlur={validate}
                  aria-invalid={!!errors.userId}
                  placeholder="you@example.com"
                  autoComplete="username"
                  className={cx(
                    "block w-full rounded-xl border bg-gray-50 pl-10 pr-3 py-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400",
                    errors.userId
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  )}
                  required
                />
              </div>
              <FieldError id="userId-error" message={errors.userId} />

              <label htmlFor="password" className="mt-4 mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  ref={passRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={onKeyEventCheckCaps}
                  onKeyDown={onKeyEventCheckCaps}
                  onBlur={validate}
                  aria-invalid={!!errors.password}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={cx(
                    "block w-full rounded-xl border bg-gray-50 pl-10 pr-12 py-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400",
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 transition hover:text-orange-500"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {capsOn && (
                <p id="caps-hint" className="mt-1 text-xs text-amber-600" aria-live="assertive">
                  Caps Lock is ON
                </p>
              )}
              <FieldError id="password-error" message={errors.password} />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 text-base font-semibold text-white shadow-md hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-semibold text-orange-600 hover:text-orange-500"
              >
                Create one
              </button>
            </p>

            <p className="mt-2 text-center text-[11px] text-gray-400">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-orange-500">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-orange-500">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* 2FA MODAL */}
    {show2fa && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 relative">
          <button
            onClick={() => {
              setShow2fa(false);
              setTwofaCode("");
              setTwofaError("");
            }}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-sm"
          >
            ✕
          </button>

          <div className="flex flex-col items-center gap-2 mb-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 text-xl">
              🔐
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Two-factor verification</h2>
            <p className="text-xs text-gray-600 text-center">
              Enter the 6-digit code from your Authenticator app.
            </p>
          </div>

          <div className="mt-4">
            <input
              autoFocus
              value={twofaCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setTwofaCode(v);
                setTwofaError("");
              }}
              onKeyDown={on2faKeyDown}
              placeholder="••••••"
              inputMode="numeric"
              className="w-full tracking-[0.6em] text-center text-xl font-semibold rounded-xl bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            {twofaError ? (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" /> {twofaError}
              </p>
            ) : (
              <p className="mt-2 text-[10px] uppercase tracking-wide text-gray-500">
                Code changes every 30 seconds
              </p>
            )}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => {
                setShow2fa(false);
                setTwofaCode("");
                setTwofaError("");
              }}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={submit2FA}
              disabled={verifying2fa}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow hover:brightness-105 disabled:opacity-70"
            >
              {verifying2fa ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

}
