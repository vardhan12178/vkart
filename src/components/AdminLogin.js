/* global google */

import React, { useRef, useState, useEffect } from "react";
import axios from "./axiosInstance";
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

// ----------------- helpers -----------------
const loadGoogleScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("google-script")) return resolve();

    const s = document.createElement("script");
    s.id = "google-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = resolve;
    document.body.appendChild(s);
  });

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

// ---------------------------------------------------

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

  // ---------------- GOOGLE BUTTON INIT ----------------
  useEffect(() => {
    loadGoogleScript().then(() => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: async (res) => {
            try {
              const r = await axios.post(
                "/api/admin/google",
                { credential: res.credential },
                { withCredentials: true }
              );

              if (r.data?.token) {
                localStorage.setItem("admin_token", r.data.token);
                setIsAdmin?.(true);
                navigate("/admin/dashboard");
              }
            } catch (err) {
              setFormError(
                err?.response?.data?.message || "Google admin login failed."
              );
            }
          },
        });

        const btn = document.getElementById("adminGoogleBtn");
        if (btn) {
          google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "large",
            width: 300,
          });
        }
      }
    });
  }, [navigate, setIsAdmin]);

  // ---------------- LOGIN SUBMIT ----------------
  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { username: adminId.trim(), password };

      const res = await axios.post("/api/admin/login", payload, {
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

  // ---------------- VALIDATION ----------------
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

  // ---------------------------------------------------

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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Manage your store effortlessly
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Securely access product management, orders, and all admin tools.
            </p>
            <p className="mt-8 text-xs text-gray-400">
              © {currentYear} VKart. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative bg-white px-6 py-10 sm:px-12 flex items-center justify-center">
          <div className="w-full max-w-md">

            {/* Heading */}
            <h1 className="text-3xl font-semibold text-gray-900 text-center">
              VKart Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-center text-gray-600">
              Sign in to access your admin panel
            </p>

            {/* Google Button */}
            <div className="mt-8 flex flex-col items-center">
              <div
                id="adminGoogleBtn"
                className="w-full flex justify-center"
              ></div>

              <div className="mt-4 flex items-center w-full">
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-3 text-sm text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>
            </div>

            {/* Toast */}
            <div aria-live="polite" className="mt-4 min-h-0">
              <Toast show={!!formError}>{formError}</Toast>
            </div>

            {/* FORM */}
            <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>

              {/* Email */}
              <div>
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
                    placeholder="admin@vkart.com"
                    autoComplete="username"
                    aria-invalid={!!errors.adminId}
                    className={cx(
                      "block w-full rounded-xl border bg-gray-50 pl-10 pr-3 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 outline-none",
                      errors.adminId
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                        : "border-gray-200 focus:ring-2 focus:ring-orange-500/30"
                    )}
                  />
                </div>
                <FieldError id="adminId-error" message={errors.adminId} />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={onKeyEventCheckCaps}
                    onKeyDown={onKeyEventCheckCaps}
                    onBlur={validate}
                    autoComplete="current-password"
                    placeholder="Admin password"
                    aria-invalid={!!errors.password}
                    className={cx(
                      "block w-full rounded-xl border bg-gray-50 pl-10 pr-12 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 outline-none",
                      errors.password
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                        : "border-gray-200 focus:ring-2 focus:ring-orange-500/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-500"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {capsOn && (
                  <p className="mt-1 text-xs text-amber-600">Caps Lock is ON</p>
                )}

                <FieldError id="password-error" message={errors.password} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 text-base font-semibold text-white shadow-md hover:brightness-110 transition disabled:opacity-80 disabled:cursor-not-allowed"
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
