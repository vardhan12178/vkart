import React, { useEffect, useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
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
const cx = (...classes) => classes.filter(Boolean).join(" ");

const FieldError = ({ id, message }) => {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <ExclamationCircleIcon className="h-4 w-4" /> {message}
    </p>
  );
};

const Toast = ({ show, kind = "error", children }) => {
  if (!show) return null;
  const palette =
    kind === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800"
      : "bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-800";
  const Icon = kind === "success" ? CheckCircleIcon : ExclamationCircleIcon;
  return (
    <div
      className={cx(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
        palette
      )}
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    const start = performance.now();
    try {
      const res = await axios.post(
        "/api/login",
        { username: userId.trim(), password, remember },
        { withCredentials: true }
      );
      if (res?.data?.token) localStorage.setItem("auth_token", res.data.token);
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

  const handleGoogleError = () => setFormError("Google sign-in was cancelled or failed.");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="pointer-events-none absolute -top-24 -left-24 hidden h-72 w-72 rounded-full bg-orange-200/50 blur-3xl lg:block" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-6rem] hidden h-80 w-80 rounded-full bg-amber-200/50 blur-3xl lg:block" />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,0.06))",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          <div className="mx-auto grid overflow-hidden rounded-3xl bg-gradient-to-tr from-neutral-200/60 via-white to-white p-[1px] shadow-[0_20px_70px_-30px_rgba(0,0,0,0.35)] dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900 lg:grid-cols-2">
            <div className="relative hidden min-h-[520px] flex-col items-center justify-between bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 p-8 text-white lg:flex">
              <div className="flex items-center gap-2 text-white drop-shadow-md">
                <ShoppingCartIcon className="h-8 w-8" />
                <span className="text-2xl font-extrabold tracking-tight">VKart</span>
              </div>
              <img
                src="login.webp"
                alt="Woman shopping illustration"
                className="pointer-events-none absolute right-[-40px] bottom-[-16px] w-[520px] opacity-90 [mix-blend:luminosity]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="relative z-10 space-y-3 text-left">
                <h3 className="text-3xl font-bold leading-tight">
                  Shop smarter.
                  <br /> Sign in faster.
                </h3>
                <p className="max-w-sm text-white/90">
                  Track orders, check out with one tap, and get personalized picks.
                </p>
              </div>
              <div className="relative z-10 text-xs text-white/70">© {currentYear} VKart. All rights reserved.</div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            </div>

            <div className="relative bg-white/80 p-5 backdrop-blur-sm dark:bg-zinc-900/80 sm:p-8">
              <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-7">
                <div className="flex items-center justify-center gap-2 lg:hidden">
                  <ShoppingCartIcon className="h-8 w-8 text-orange-600" />
                  <span className="text-2xl font-extrabold text-orange-600">VKart</span>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Sign in to continue to your account
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-full sm:w-auto">
                    {googleLoading && (
                      <div className="absolute inset-0 grid place-items-center rounded-md bg-white/60 backdrop-blur-sm dark:bg-zinc-900/60">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
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

                <div className="relative">
                  <hr className="border-gray-200 dark:border-zinc-700" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400 dark:bg-zinc-900 dark:text-gray-500">
                    or
                  </span>
                </div>

                <div aria-live="polite" className="min-h-0">
                  <Toast show={!!formError}>{formError}</Toast>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5" noValidate>
                  <label htmlFor="userId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User ID
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="userId"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      onBlur={validate}
                      inputMode="email"
                      aria-invalid={!!errors.userId}
                      aria-describedby={errors.userId ? "userId-error" : undefined}
                      placeholder="Enter your VKart ID"
                      autoComplete="username"
                      className={cx(
                        "block w-full rounded-xl border bg-white pl-10 pr-3 py-3 text-gray-900 shadow-sm outline-none transition dark:bg-zinc-900 dark:text-gray-100",
                        errors.userId
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40"
                          : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:focus:ring-orange-900/40"
                      )}
                      required
                    />
                  </div>
                  <FieldError id="userId-error" message={errors.userId} />

                  <label htmlFor="password" className="mt-4 mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      aria-describedby={cx(errors.password ? "password-error" : "", capsOn ? "caps-hint" : "")}
                      placeholder="Your password"
                      autoComplete="current-password"
                      className={cx(
                        "block w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-gray-900 shadow-sm outline-none transition dark:bg-zinc-900 dark:text-gray-100",
                        errors.password
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40"
                          : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:focus:ring-orange-900/40"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 transition hover:text-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={capsOn ? "Caps Lock is ON" : "Toggle password visibility"}
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
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-zinc-600"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-left text-sm font-medium text-orange-600 transition hover:text-orange-500 sm:text-right"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-80 motion-reduce:transition-none"
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

                <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                  Don’t have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="font-semibold text-orange-600 transition hover:text-orange-500"
                  >
                    Create one
                  </button>
                </p>

                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                  By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                </p>
              </div>

              {loading && (
                <div className="pointer-events-auto absolute inset-0 -z-10" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
