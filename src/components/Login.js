// src/pages/Login.jsx
import React, { useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
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
      navigate("/");
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
      navigate("/");
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
      navigate("/");
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

    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between items-center bg-gradient-to-br from-orange-50 to-amber-100 p-10 text-center">
          <img
            src="/login.webp"
            alt="Shopping illustration"
            className="max-h-[360px] w-auto object-contain select-none pointer-events-none drop-shadow-[0_0_20px_rgba(255,140,0,0.15)]"
          />
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Everything you love, in one cart.
            </h3>
            <p className="text-sm text-gray-600">
              Explore top brands, curated collections, and smart deals — all in one place.
            </p>
            <p className="mt-8 text-xs text-gray-400">
              © {currentYear} VKart. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="px-6 py-10 sm:px-10">
          {/* Brand (mobile only) */}
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600 shadow-inner">
              <ShoppingCartIcon className="h-6 w-6" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-gray-800">VKart</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to continue to your account</p>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <div className="relative w-full sm:w-auto">
              {googleLoading && (
                <div className="absolute inset-0 grid place-items-center rounded-md bg-white/70">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
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
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
              or
            </span>
          </div>

          {formError && <Toast show>{formError}</Toast>}

          {/* FORM */}
          <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
            {/* Email */}
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="userId"
                type="email"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onBlur={validate}
                placeholder="Enter your email"
                autoComplete="username"
                className={cx(
                  "block w-full rounded-xl border px-10 py-3 shadow-sm text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder:text-gray-400",
                  errors.userId ? "border-red-500" : "border-gray-300"
                )}
              />
            </div>
            <FieldError id="userId-error" message={errors.userId} />

            {/* Password */}
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                ref={passRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onKeyEventCheckCaps}
                onKeyDown={onKeyEventCheckCaps}
                onBlur={validate}
                placeholder="Your password"
                autoComplete="current-password"
                className={cx(
                  "block w-full rounded-xl border px-10 pr-12 py-3 shadow-sm text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder:text-gray-400",
                  errors.password ? "border-red-500" : "border-gray-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {capsOn && (
              <p id="caps-hint" className="mt-1 text-xs text-amber-600">
                Caps Lock is ON
              </p>
            )}
            <FieldError id="password-error" message={errors.password} />

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 shadow-md transition disabled:opacity-75"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-700">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Create one
            </button>
          </p>

          <p className="mt-2 text-center text-[11px] text-gray-500">
            By continuing, you agree to our Terms and acknowledge our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  </>
);
}