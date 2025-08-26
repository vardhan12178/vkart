import React, { useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  MailIcon,
  PhotographIcon,
  LockClosedIcon,
} from "@heroicons/react/outline";

const cx = (...c) => c.filter(Boolean).join(" ");
const currentYear = new Date().getFullYear();

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
    if (!form.username.trim()) e.username = "Username is required.";
    else if (!/^[a-z0-9._-]{3,64}$/i.test(form.username.trim())) e.username = "Use 3-64 chars: letters, numbers, . _ -";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Use at least 8 characters.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
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
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const submit = async (e) => {
    e.preventDefault();
    setToast({ show: false, kind: "error", msg: "" });
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("username", form.username.trim());
      fd.append("email", form.email.trim());
      fd.append("password", form.password);
      fd.append("confirmPassword", form.confirmPassword);
      if (profileImage) fd.append("profileImage", profileImage);

      await axios.post("/api/register", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast({ show: true, kind: "success", msg: "Account created. Please sign in." });
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

  const handleGoogleError = () => setToast({ show: true, kind: "error", msg: "Google sign-in was cancelled or failed." });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-6rem] h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08]" style={{ backgroundImage: "url('/noise.png')" }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(1200px 600px at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,0.06))" }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <div className="mx-auto grid overflow-hidden rounded-3xl bg-gradient-to-tr from-neutral-200/60 via-white to-white p-[1px] shadow-[0_20px_70px_-30px_rgba(0,0,0,0.35)] lg:grid-cols-2">
            <div className="relative hidden min-h-[560px] flex-col items-center justify-between bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 p-10 text-white lg:flex overflow-hidden">
              <div className="flex items-center gap-2 text-white drop-shadow-md">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v2H3zM3 9h18v2H3zM3 15h18v2H3zM3 21h18v2H3z" /></svg>
                <span className="text-2xl font-extrabold tracking-tight">VKart</span>
              </div>
              <img src="login.webp" alt="" className="pointer-events-none absolute right-[-40px] bottom-[-20px] w-[520px] opacity-90 mix-blend-luminosity" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <div className="space-y-4 text-left relative z-10">
                <h3 className="text-3xl font-bold leading-tight">Join VKart</h3>
                <p className="max-w-sm text-white/90">Create your account to track orders and enjoy faster checkout.</p>
              </div>
              <div className="text-xs text-white/70 relative z-10">© {currentYear} VKart. All rights reserved.</div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            </div>

            <div className="relative bg-white/80 p-6 backdrop-blur-sm sm:p-10">
              <div className="mx-auto max-w-md space-y-7">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
                  <p className="mt-2 text-sm text-gray-500">It takes less than a minute</p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      ux_mode="popup"
                      useOneTap={false}
                      shape="rectangular"
                      text={googleLoading ? "continue_with" : "continue_with"}
                      theme="outline"
                    />
                  </div>
                  <button type="button" disabled className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-400 shadow-sm">
                    Continue with Apple
                  </button>
                </div>

                <div className="relative">
                  <hr className="border-gray-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">or</span>
                </div>

                <Toast show={toast.show} kind={toast.kind}>{toast.msg}</Toast>

                <form onSubmit={submit} className="space-y-5" noValidate>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Your name"
                        className="block w-full rounded-xl border bg-white pl-10 pr-3 py-3 text-gray-900 shadow-sm outline-none transition border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setField("username", e.target.value)}
                      placeholder="e.g. john_doe"
                      className={cx(
                        "block w-full rounded-xl border bg-white px-3 py-3 text-gray-900 shadow-sm outline-none transition",
                        errors.username ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      )}
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "username-error" : undefined}
                      required
                    />
                    <FieldError id="username-error" message={errors.username} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="you@example.com"
                        className={cx(
                          "block w-full rounded-xl border bg-white pl-10 pr-3 py-3 text-gray-900 shadow-sm outline-none transition",
                          errors.email ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        )}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        required
                      />
                    </div>
                    <FieldError id="email-error" message={errors.email} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        placeholder="Min 8 characters"
                        autoComplete="new-password"
                        className={cx(
                          "block w-full rounded-xl border bg-white pl-10 pr-10 py-3 text-gray-900 shadow-sm outline-none transition",
                          errors.password ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        )}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        required
                      />
                      <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-600">
                        {showPw ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    <FieldError id="password-error" message={errors.password} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPw2 ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => setField("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        className={cx(
                          "block w-full rounded-xl border bg-white pl-10 pr-10 py-3 text-gray-900 shadow-sm outline-none transition",
                          errors.confirmPassword ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        )}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                        required
                      />
                      <button type="button" onClick={() => setShowPw2((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-600">
                        {showPw2 ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    <FieldError id="confirm-error" message={errors.confirmPassword} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Profile image (optional)</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
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
                      {preview && <img src={preview} alt="preview" className="h-10 w-10 rounded-lg object-cover ring-1 ring-gray-200" />}
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

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button onClick={() => navigate("/login")} className="font-semibold text-orange-600 hover:text-orange-500">
                      Sign in
                    </button>
                  </p>

                  <p className="text-center text-[11px] text-gray-400">
                    By creating an account, you agree to our Terms and acknowledge our Privacy Policy.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
