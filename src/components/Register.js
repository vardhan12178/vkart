import React, { useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  MailIcon,
  PhotographIcon,
  LockClosedIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";

const cx = (...c) => c.filter(Boolean).join(" ");
const currentYear = new Date().getFullYear();

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
      <Icon className="h-4 w-4" />
      <div>{children}</div>
    </div>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, kind: "error", msg: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const imgRef = useRef(null);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.username.trim())
      e.username = "Username is required.";
    else if (!/^[a-z0-9._-]{3,64}$/i.test(form.username.trim()))
      e.username = "Use 3-64 chars: letters, numbers, . _ -";
    if (!form.email.trim())
      e.email = "Email is required.";
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email.";
    if (!form.password)
      e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Use at least 8 characters.";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    if (profileImage) {
      const okType = ["image/png", "image/jpeg", "image/webp"].includes(profileImage.type);
      if (!okType) e.profileImage = "Only PNG, JPG, or WEBP.";
      if (profileImage.size > 2 * 1024 * 1024) e.profileImage = "Max size 2MB.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onPickImage = (file) => {
    if (!file) {
      setProfileImage(null);
      setPreview("");
      return;
    }
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setToast({ show: false, kind: "error", msg: "" });
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim()));
      if (profileImage) fd.append("profileImage", profileImage);
      await axios.post("/api/register", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({
        show: true,
        kind: "success",
        msg: "Account created. Please sign in.",
      });
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Try again.";
      setToast({ show: true, kind: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setToast({ show: false, kind: "error", msg: "" });
    setGoogleLoading(true);
    try {
      await axios.post("/auth/google", { idToken: cred?.credential, remember: true }, { withCredentials: true });
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Google sign-in failed.";
      setToast({ show: true, kind: "error", msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () =>
    setToast({ show: true, kind: "error", msg: "Google sign-in was cancelled or failed." });

  return (
    <>
      <Helmet>
        <title>Register — VKart</title>
        <meta
          name="description"
          content="Create your VKart account to explore top deals, curated products, and fast checkout."
        />
        <meta property="og:title" content="VKart — Register" />
        <meta
          property="og:description"
          content="Join VKart today and shop smarter with curated selections and secure checkout."
        />
        <meta property="og:image" content="/og-vkart.jpg" />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-[#0b0d10]">
        {/* background blobs */}
        <div className="pointer-events-none absolute -top-40 -left-28 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-amber-400 blur-[140px] opacity-40" />
        <div className="pointer-events-none absolute -bottom-40 -right-28 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-amber-300 blur-[140px] opacity-30" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-3xl p-[1px]">
              <motion.div
                aria-hidden
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
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
                {/* Left Panel */}
                <div className="relative hidden min-h-[560px] items-center justify-center lg:flex">
                  <div className="mx-8 my-10 w-[92%] rounded-2xl bg-gradient-to-br from-zinc-900/70 to-zinc-900/30 p-8 ring-1 ring-white/10 shadow-2xl backdrop-blur-md relative z-10 flex flex-col justify-between">
                    <div className="flex justify-center items-center flex-1">
                      <img
                        src="/login.webp"
                        alt="Shopping illustration"
                        className="max-h-[360px] w-auto object-contain select-none pointer-events-none drop-shadow-[0_0_25px_rgba(255,140,0,0.15)]"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-6 text-center">
                      <h3 className="text-2xl font-semibold text-white mb-2">
                        Join VKart Today.
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Create your account and enjoy personalized shopping and
                        faster checkout.
                      </p>
                      <p className="mt-8 text-xs text-zinc-500">
                        © {currentYear} VKart. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right form */}
                <div className="relative bg-zinc-950/40 px-5 py-8 sm:px-8">
                  <div className="mx-auto w-full max-w-md">
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
                        Create your account
                      </h1>
                      <p className="mt-2 text-sm text-zinc-400">
                        It only takes a minute to get started
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
                      <Toast show={toast.show} kind={toast.kind}>
                        {toast.msg}
                      </Toast>
                    </div>

                    <form onSubmit={submit} className="space-y-4" noValidate>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-300">
                          Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          placeholder="Your full name"
                          className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-3 text-white shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder:text-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-300">
                          Username
                        </label>
                        <input
                          type="text"
                          value={form.username}
                          onChange={(e) => setField("username", e.target.value)}
                          placeholder="e.g. john_doe"
                          className={cx(
                            "w-full rounded-xl border bg-zinc-950/40 px-3 py-3 text-white shadow-sm outline-none placeholder:text-zinc-500",
                            errors.username
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          )}
                        />
                        <FieldError id="username-error" message={errors.username} />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          placeholder="you@example.com"
                          className={cx(
                            "w-full rounded-xl border bg-zinc-950/40 px-3 py-3 text-white shadow-sm outline-none placeholder:text-zinc-500",
                            errors.email
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          )}
                        />
                        <FieldError id="email-error" message={errors.email} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-300">
                            Password
                          </label>
                          <div className="relative">
                            <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                            <input
                              type={showPw ? "text" : "password"}
                              value={form.password}
                              onChange={(e) => setField("password", e.target.value)}
                              placeholder="Min 8 characters"
                              className="block w-full rounded-xl border bg-zinc-950/40 pl-10 pr-10 py-3 text-white shadow-sm outline-none transition placeholder:text-zinc-500 border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw((s) => !s)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition hover:text-orange-400"
                            >
                              {showPw ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                          </div>
                          <FieldError id="password-error" message={errors.password} />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-300">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                            <input
                              type={showPw2 ? "text" : "password"}
                              value={form.confirmPassword}
                              onChange={(e) => setField("confirmPassword", e.target.value)}
                              placeholder="Re-enter password"
                              className="block w-full rounded-xl border bg-zinc-950/40 pl-10 pr-10 py-3 text-white shadow-sm outline-none transition placeholder:text-zinc-500 border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw2((s) => !s)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition hover:text-orange-400"
                            >
                              {showPw2 ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                          </div>
                          <FieldError id="confirm-error" message={errors.confirmPassword} />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-300">
                          Profile image (optional)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm font-medium text-zinc-300 shadow-sm transition hover:bg-white/10">
                            <PhotographIcon className="h-5 w-5" />
                            <span>Choose file</span>
                            <input
                              ref={imgRef}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => onPickImage(e.target.files?.[0])}
                            />
                          </label>
                          {preview && (
                            <img
                              src={preview}
                              alt="Preview"
                              className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10"
                            />
                          )}
                        </div>
                        <FieldError id="profileImage-error" message={errors.profileImage} />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        {loading ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating account…
                          </>
                        ) : (
                          "Create account"
                        )}
                      </button>

                      <p className="text-center text-sm text-zinc-400">
                        Already have an account?{" "}
                        <button
                          onClick={() => navigate("/login")}
                          type="button"
                          className="font-semibold text-orange-500 transition hover:text-orange-400"
                        >
                          Sign in
                        </button>
                      </p>

                      <p className="text-center text-[11px] text-zinc-500">
                        By creating an account, you agree to our{" "}
                        <a
                          href="/terms"
                          className="underline decoration-orange-400/50 hover:text-orange-300"
                        >
                          Terms
                        </a>{" "}
                        and acknowledge our{" "}
                        <a
                          href="/privacy"
                          className="underline decoration-orange-400/50 hover:text-orange-300"
                        >
                          Privacy Policy
                        </a>.
                      </p>
                    </form>
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

