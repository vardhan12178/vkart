// src/pages/AdminLogin.jsx
/* global google */
import React, { useRef, useState, useEffect } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
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

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ----------------- Helpers -----------------
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
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500"
    >
      <ExclamationCircleIcon className="h-4 w-4 shrink-0" /> {message}
    </motion.p>
  );

const Toast = ({ show, kind = "error", children }) => {
  if (!show) return null;
  const isSuccess = kind === "success";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cx(
        "mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm shadow-sm backdrop-blur-md border",
        isSuccess
          ? "bg-emerald-50/80 border-emerald-100 text-emerald-800"
          : "bg-red-50/80 border-red-100 text-red-800"
      )}
      role="status"
    >
      {isSuccess ? (
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-600" />
      )}
      <div className="pt-0.5 font-medium">{children}</div>
    </motion.div>
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
          // FIX: Dynamic width calculation to fit mobile screens (iPhone SE is ~375px)
          // We check the container width, or default to 300px for mobile safety.
          const containerWidth = btn.clientWidth || 300;
          // Google button max-width is usually good around 300-400px.
          // If screen < 420px (mobile), use "300", else "380".
          const widthStr = window.innerWidth < 420 ? "300" : "380";

          google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "large",
            width: widthStr,
            shape: "rectangular",
            text: "continue_with",
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

  return (
    <>
      <Helmet>
        <title>Admin Portal — VKart</title>
        <meta
          name="description"
          content="Admin panel login for VKart — manage products, orders, and more."
        />
      </Helmet>

      {/* BACKGROUND: Subtle Premium Gradient */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8F9FA] relative overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative w-full max-w-[1100px] h-[650px] lg:h-[750px] bg-white rounded-[32px] shadow-2xl flex overflow-hidden border border-white/50"
        >
          {/* --- LEFT PANEL (Visual) --- */}
          <div className="hidden lg:flex w-1/2 relative flex-col justify-between bg-gradient-to-br from-orange-50 via-white to-amber-50 p-12 overflow-hidden">
            {/* Decorative Patterns */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                {/* Admin Icon variant */}
                <div className="h-10 w-10 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/20 text-white">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">VKart Admin.</span>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-extrabold text-gray-900 leading-[1.15]"
              >
                Manage the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                  future of shopping.
                </span>
              </motion.h2>
            </div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="relative z-10 flex-1 flex items-center justify-center"
            >
              <img
                src="/login.webp"
                alt="Admin Dashboard Illustration"
                className="max-h-[350px] w-auto object-contain drop-shadow-2xl grayscale-[20%]"
              />
            </motion.div>

            <div className="relative z-10 text-xs text-gray-400 font-medium">
                © {currentYear} VKart Inc. Authorized personnel only.
            </div>
          </div>

          {/* --- RIGHT PANEL (Form) --- */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 relative">
             {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
                <div className="h-10 w-10 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="w-full max-w-sm mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
                <p className="mt-2 text-gray-500">Secure entry for store management.</p>
              </motion.div>

              {/* Toast / Error Area */}
              <AnimatePresence>
                {formError && <Toast show={!!formError}>{formError}</Toast>}
              </AnimatePresence>

              {/* Google Button */}
              <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
                 <div className="w-full flex justify-center transform transition-transform hover:scale-[1.01]">
                   <div 
                     id="adminGoogleBtn"
                     className="w-full flex justify-center"
                   />
                 </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative flex items-center gap-4 mb-6">
                 <div className="h-px bg-gray-200 flex-1" />
                 <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or login with ID</span>
                 <div className="h-px bg-gray-200 flex-1" />
              </motion.div>

              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Admin ID Field */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Admin ID</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className={cx("h-5 w-5 transition-colors", errors.adminId ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                    </div>
                    <input
                      id="adminId"
                      type="email"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      onBlur={validate}
                      placeholder="admin@vkart.com"
                      autoComplete="username"
                      className={cx(
                        "block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                        errors.adminId
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                          : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                      )}
                    />
                  </div>
                  <FieldError id="adminId-error" message={errors.adminId} />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={fadeInUp}>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon className={cx("h-5 w-5 transition-colors", errors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={onKeyEventCheckCaps}
                      onKeyDown={onKeyEventCheckCaps}
                      onBlur={validate}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className={cx(
                        "block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                        errors.password
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                          : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {capsOn && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:"auto"}} className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                        ⚠️ Caps Lock is ON
                      </motion.div>
                  )}
                  <FieldError id="password-error" message={errors.password} />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                      {loading ? "Authenticating..." : "Access Dashboard"}
                  </span>
                </motion.button>
              </form>

              <motion.div variants={fadeInUp} className="mt-8 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] text-gray-400">
                    <ShieldCheckIcon className="h-3 w-3" />
                    <span>Secure Admin Environment</span>
                 </div>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}