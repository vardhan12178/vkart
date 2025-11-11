import React, { useRef, useState, useEffect } from "react";
import axios from "./axiosInstance"; // adjust if file is one level up/down
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
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
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : "bg-red-50 text-red-800 ring-1 ring-red-200";
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

export default function AdminLogin({ setIsAdmin }) {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({ adminId: "", password: "" });
  const passRef = useRef(null);

  // redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin/dashboard");
  }, [navigate]);

  const validate = () => {
    const e = { adminId: "", password: "" };
    if (!adminId.trim()) e.adminId = "Admin ID is required.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return !e.adminId && !e.password;
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
    try {
      const payload = { username: adminId.trim(), password };
      // using normal login API for now
      const res = await axios.post("/api/login", payload, {
        withCredentials: true,
      });

      if (res.data?.token) {
        localStorage.setItem("admin_token", res.data.token);
        setIsAdmin?.(true);
        navigate("/admin/dashboard");
      } else {
        setFormError("Invalid admin credentials.");
      }
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login — VKart</title>
        <meta
          name="description"
          content="Admin panel login for VKart — manage products, orders, and more."
        />
      </Helmet>

      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* LEFT PANEL */}
          <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100">
            <div className="flex justify-center items-center flex-1">
              <img
                src="/login.webp"
                alt="Admin login illustration"
                className="max-h-[320px] w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                VKart Admin Dashboard
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage products, process orders, and oversee your online store
                all from one secure dashboard.
              </p>
              <p className="mt-8 text-xs text-gray-400">
                © {currentYear} VKart. All rights reserved.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative bg-white px-6 py-10 sm:px-10 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white shadow">
                  <ShieldCheckIcon className="h-6 w-6" />
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                  VKart Admin
                </span>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                  Admin Sign In
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Use your credentials to access admin dashboard
                </p>
              </div>

              <div aria-live="polite" className="min-h-0">
                <Toast show={!!formError}>{formError}</Toast>
              </div>

              {/* FORM */}
              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <label
                  htmlFor="adminId"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="adminId"
                    type="email"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    onBlur={validate}
                    aria-invalid={!!errors.adminId}
                    placeholder="admin@vkart.com"
                    autoComplete="username"
                    className={cx(
                      "block w-full rounded-xl border bg-gray-50 pl-10 pr-3 py-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400",
                      errors.adminId
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    )}
                    required
                  />
                </div>
                <FieldError id="adminId-error" message={errors.adminId} />

                <label
                  htmlFor="password"
                  className="mt-4 mb-1 block text-sm font-medium text-gray-700"
                >
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
                    placeholder="Admin password"
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
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {capsOn && (
                  <p
                    id="caps-hint"
                    className="mt-1 text-xs text-amber-600"
                    aria-live="assertive"
                  >
                    Caps Lock is ON
                  </p>
                )}
                <FieldError id="password-error" message={errors.password} />

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
                    "Sign in as Admin"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
