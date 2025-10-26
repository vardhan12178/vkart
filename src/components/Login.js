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
        <meta property="og:title" content="VKart — Sign in" />
        <meta property="og:description" content="Shop smarter. Sign in faster." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-vkart.jpg" />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-[#0b0d10]">
        {/* glow orbs */}
        <div className="pointer-events-none absolute -top-40 -left-28 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-amber-400 blur-[140px] opacity-40" />
        <div className="pointer-events-none absolute -bottom-40 -right-28 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-amber-300 blur-[140px] opacity-30" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-3xl p-[1px]">
              <motion.div
                aria-hidden
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -z-10 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(255,115,64,0.9), rgba(244,63,94,0.8), rgba(251,191,36,0.9))",
                  backgroundSize: "200% 200%",
                  filter: "blur(30px)",
                }}
              />
              <div className="grid rounded-3xl bg-zinc-950/70 ring-1 ring-white/10 backdrop-blur-xl lg:grid-cols-2">
                {/* LEFT PANEL */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                  className="relative hidden min-h-[560px] items-center justify-center lg:flex"
                >
                 <div className="mx-8 my-10 w-[92%] rounded-2xl bg-gradient-to-br from-zinc-900/70 to-zinc-900/30 p-8 ring-1 ring-white/10 shadow-2xl backdrop-blur-md relative z-10 flex flex-col justify-between">
                <div className="flex justify-center items-center flex-1">
                  <img
                    src="/login.webp"
                    alt="Shopping illustration"
                    className="max-h-[360px] w-auto object-contain select-none pointer-events-none drop-shadow-[0_0_25px_rgba(255,140,0,0.15)]"
                  />
                </div>

                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Everything you love, in one cart.
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Explore top brands, curated collections, and smart deals — all in one
                    place.
                  </p>
                  <p className="mt-8 text-xs text-zinc-500">
                    © {currentYear} VKart. All rights reserved.
                  </p>
                </div>
              </div>

                </motion.div>

                {/* RIGHT FORM */}
                <div className="relative bg-zinc-950/40 px-5 py-8 sm:px-8">
                  <div className="mx-auto w-full max-w-md">
                    {/* mobile brand */}
                    <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 text-white">
                        <ShoppingCartIcon className="h-6 w-6" />
                      </span>
                      <span className="text-2xl font-extrabold tracking-tight text-white">
                        VKart
                      </span>
                    </div>

                    <div className="text-center">
                      <h1 className="text-3xl font-semibold tracking-tight text-white">
                        Welcome back
                      </h1>
                      <p className="mt-2 text-sm text-zinc-400">
                        Sign in to continue to your account
                      </p>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <div className="relative w-full sm:w-auto">
                        {googleLoading && (
                          <div className="absolute inset-0 grid place-items-center rounded-md bg-zinc-900/60 backdrop-blur-sm">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
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
                      <hr className="border-white/10" />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950/40 px-3 text-xs text-zinc-500">
                        or
                      </span>
                    </div>

                    <div aria-live="polite" className="min-h-0">
                      <Toast show={!!formError}>{formError}</Toast>
                    </div>

                    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                      <label htmlFor="userId" className="mb-1 block text-sm font-medium text-zinc-300">
                        User ID
                      </label>
                      <div className="relative">
                        <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
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
                            "block w-full rounded-xl border bg-zinc-950/40 pl-10 pr-3 py-3 text-white shadow-sm outline-none transition placeholder:text-zinc-500",
                            errors.userId
                              ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          )}
                          required
                        />
                      </div>
                      <FieldError id="userId-error" message={errors.userId} />

                      <label htmlFor="password" className="mt-4 mb-1 block text-sm font-medium text-zinc-300">
                        Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
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
                            "block w-full rounded-xl border bg-zinc-950/40 pl-10 pr-12 py-3 text-white shadow-sm outline-none transition placeholder:text-zinc-500",
                            errors.password
                              ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          )}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition hover:text-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          title={capsOn ? "Caps Lock is ON" : "Toggle password visibility"}
                        >
                          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {capsOn && (
                        <p id="caps-hint" className="mt-1 text-xs text-amber-400" aria-live="assertive">
                          Caps Lock is ON
                        </p>
                      )}
                      <FieldError id="password-error" message={errors.password} />

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate("/forgot-password")}
                          className="text-left text-sm font-medium text-orange-400 transition hover:text-orange-300 sm:text-right"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-80"
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

                    <p className="mt-5 text-center text-sm text-zinc-300">
                      Don’t have an account?{" "}
                      <button
                        onClick={() => navigate("/register")}
                        className="font-semibold text-orange-400 transition hover:text-orange-300"
                      >
                        Create one
                      </button>
                    </p>

                    <p className="mt-2 text-center text-[11px] text-zinc-500">
                      By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
