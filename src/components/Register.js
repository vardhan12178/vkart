// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockClosedIcon,
  UserIcon,
  MailIcon,
  IdentificationIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";

const cx = (...c) => c.filter(Boolean).join(" ");
const currentYear = new Date().getFullYear();

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// --- CSS for Hiding Scrollbar ---
const scrollbarStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// --- Helper Components ---

const FieldError = ({ id, message }) =>
  !message ? null : (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      id={id}
      className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-500"
    >
      <ExclamationCircleIcon className="h-3 w-3 shrink-0" /> {message}
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
        "mb-4 flex items-start gap-3 rounded-xl p-3 text-xs shadow-sm backdrop-blur-md border",
        isSuccess
          ? "bg-emerald-50/80 border-emerald-100 text-emerald-800"
          : "bg-red-50/80 border-red-100 text-red-800"
      )}
      role="status"
    >
      {isSuccess ? (
        <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-red-600" />
      )}
      <div className="pt-0.5 font-medium">{children}</div>
    </motion.div>
  );
};

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;

  const checks = [
    { label: "8+ chars", test: password.length >= 8 },
    { label: "Uppercase", test: /[A-Z]/.test(password) },
    { label: "Lowercase", test: /[a-z]/.test(password) },
    { label: "Number", test: /[0-9]/.test(password) },
    { label: "Special", test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const passed = checks.filter((c) => c.test).length;
  const strengthColor =
    passed === 5 ? "bg-emerald-500" : passed >= 3 ? "bg-amber-500" : "bg-red-500";

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 space-y-1.5">
      <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full transition-all duration-500 ${strengthColor}`}
          style={{ width: `${(passed / 5) * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map((check, i) => (
          <div
            key={i}
            className={cx(
              "flex items-center gap-1 text-[9px] font-medium border px-1 py-0.5 rounded",
              check.test
                ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                : "text-gray-400 border-gray-100 bg-gray-50"
            )}
          >
            {check.test && <CheckCircleIcon className="h-2.5 w-2.5" />}
            {check.label}
          </div>
        ))}
      </div>
    </motion.div>
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
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [toast, setToast] = useState({ show: false, kind: "error", msg: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const setField = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    // Validate field as user types if it's already been touched
    if (touched[k]) {
      validateField(k, v);
    }
  };

  const validateField = (field, value) => {
    if (!touched[field]) return;

    const newErrors = { ...errors };

    switch (field) {
      case "name":
        newErrors.name = !value.trim() ? "Name is required." : "";
        break;
      case "username":
        if (!value.trim()) {
          newErrors.username = "Username is required.";
        } else if (!/^[a-z0-9._-]{3,64}$/i.test(value.trim())) {
          newErrors.username = "3-64 chars, alphanumeric, dot, underscore.";
        } else {
          newErrors.username = "";
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = "Enter a valid email.";
        } else {
          newErrors.email = "";
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "Password is required.";
        } else if (value.length < 8) {
          newErrors.password = "Min 8 characters required.";
        } else {
          newErrors.password = "";
        }
        // Also revalidate confirmPassword if it's been touched
        if (touched.confirmPassword && form.confirmPassword) {
          if (value !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
          } else {
            newErrors.confirmPassword = "";
          }
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Confirm your password.";
        } else if (form.password !== value) {
          newErrors.confirmPassword = "Passwords do not match.";
        } else {
          newErrors.confirmPassword = "";
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";

    if (!form.username.trim()) {
      e.username = "Username is required.";
    } else if (!/^[a-z0-9._-]{3,64}$/i.test(form.username.trim())) {
      e.username = "3-64 chars, alphanumeric, dot, underscore.";
    }

    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email.";
    }

    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Min 8 characters required.";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setToast({ show: false, kind: "error", msg: "" });

    // Mark all fields as touched on submit
    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim()));

      await axios.post("/api/register", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({
        show: true,
        kind: "success",
        msg: "Account created! Redirecting...",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
      setToast({ show: true, kind: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setToast({ show: false, kind: "error", msg: "" });
    setGoogleLoading(true);
    try {
      await axios.post(
        "/api/auth/google",
        { idToken: cred?.credential, remember: true },
        { withCredentials: true }
      );
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Google sign-in failed.";
      setToast({ show: true, kind: "error", msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () =>
    setToast({ show: true, kind: "error", msg: "Google sign-in failed." });

  return (
    <>
      <Helmet>
        <title>Join VKart — Create Account</title>
        <meta name="description" content="Create your VKart account today." />
      </Helmet>
      <style>{scrollbarStyles}</style>

      {/* BACKGROUND */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F8F9FA] relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 sm:w-96 sm:h-96 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 sm:w-96 sm:h-96 bg-amber-100/40 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative w-full max-w-[1050px] min-h-[680px] sm:min-h-[700px] lg:min-h-[720px] bg-white rounded-2xl sm:rounded-[32px] shadow-2xl flex overflow-hidden border border-white/50"
        >
          {/* --- LEFT PANEL (Visual) --- */}
          <div className="hidden lg:flex w-5/12 relative flex-col justify-between bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 xl:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                  <ShoppingCartIcon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">VKart.</span>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl xl:text-4xl font-extrabold text-gray-900 leading-[1.15]"
              >
                Join the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                  shopping revolution.
                </span>
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative z-10 flex-1 flex items-center justify-center py-8"
            >
              <img
                src="/login.webp"
                alt="Shopping Illustration"
                className="max-h-[280px] xl:max-h-[350px] w-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>

          {/* --- RIGHT PANEL (Form) --- */}
          <div className="w-full lg:w-7/12 bg-white flex flex-col relative">
            {/* Scrollable Form Area - Added 'no-scrollbar' class */}
            <div className="absolute inset-0 overflow-y-auto no-scrollbar">
              <div className="min-h-full flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-10">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg text-white">
                    <ShoppingCartIcon className="h-6 w-6" />
                  </div>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="w-full max-w-md mx-auto"
                >
                  <motion.div variants={fadeInUp} className="text-center mb-5 sm:mb-6">
                    <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Start your journey with VKart today.</p>
                  </motion.div>

                  <AnimatePresence>
                    {toast.show && <Toast show={toast.show} kind={toast.kind}>{toast.msg}</Toast>}
                  </AnimatePresence>

                  {/* Google Button */}
                  <motion.div variants={fadeInUp} className="mb-4 sm:mb-5 flex justify-center">
                    <div className="w-full max-w-[400px] flex justify-center transform transition-transform hover:scale-[1.01] relative">
                      {googleLoading && (
                        <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[2px] rounded-lg">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                        </div>
                      )}
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        ux_mode="popup"
                        theme="outline"
                        size="large"
                        width="100%"
                        shape="rectangular"
                        text="signup_with"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="relative flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      or register with email
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </motion.div>

                  {/* Form inputs */}
                  <form onSubmit={submit} className="space-y-3" noValidate>
                    {/* Full Name */}
                    <motion.div variants={fadeInUp}>
                      <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <UserIcon className={cx("h-4 w-4 transition-colors", errors.name && touched.name ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                        </div>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, name: true }));
                            validateField("name", form.name);
                          }}
                          placeholder="Enter your name"
                          className={cx(
                            "block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 sm:pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                            errors.name && touched.name
                              ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                          )}
                        />
                      </div>
                      {touched.name && <FieldError id="name-error" message={errors.name} />}
                    </motion.div>

                    {/* Username */}
                    <motion.div variants={fadeInUp}>
                      <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Username</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <IdentificationIcon className={cx("h-4 w-4 transition-colors", errors.username && touched.username ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                        </div>
                        <input
                          type="text"
                          value={form.username}
                          onChange={(e) => setField("username", e.target.value)}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, username: true }));
                            validateField("username", form.username);
                          }}
                          placeholder="your.username"
                          className={cx(
                            "block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 sm:pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                            errors.username && touched.username
                              ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                          )}
                        />
                      </div>
                      {touched.username && <FieldError id="username-error" message={errors.username} />}
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={fadeInUp}>
                      <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <MailIcon className={cx("h-4 w-4 transition-colors", errors.email && touched.email ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                        </div>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, email: true }));
                            validateField("email", form.email);
                          }}
                          placeholder="you@example.com"
                          className={cx(
                            "block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 sm:pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                            errors.email && touched.email
                              ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                          )}
                        />
                      </div>
                      {touched.email && <FieldError id="email-error" message={errors.email} />}
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={fadeInUp}>
                      <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className={cx("h-4 w-4 transition-colors", errors.password && touched.password ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                        </div>
                        <input
                          type={showPw ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => setField("password", e.target.value)}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, password: true }));
                            validateField("password", form.password);
                          }}
                          placeholder="Create password"
                          className={cx(
                            "block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 sm:pl-10 pr-10 sm:pr-12 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                            errors.password && touched.password
                              ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none min-w-[44px] min-h-[44px]"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      <PasswordStrengthIndicator password={form.password} />
                      {touched.password && <FieldError id="password-error" message={errors.password} />}
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div variants={fadeInUp}>
                      <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className={cx("h-4 w-4 transition-colors", errors.confirmPassword && touched.confirmPassword ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                        </div>
                        <input
                          type={showPw2 ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(e) => setField("confirmPassword", e.target.value)}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, confirmPassword: true }));
                            validateField("confirmPassword", form.confirmPassword);
                          }}
                          placeholder="Repeat password"
                          className={cx(
                            "block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 sm:pl-10 pr-10 sm:pr-12 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                            errors.confirmPassword && touched.confirmPassword
                              ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw2(!showPw2)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none min-w-[44px] min-h-[44px]"
                          aria-label={showPw2 ? "Hide password" : "Show password"}
                        >
                          {showPw2 ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {touched.confirmPassword && <FieldError id="confirm-error" message={errors.confirmPassword} />}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      variants={fadeInUp}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                        {loading ? "Creating Account..." : "Create Account"}
                      </span>
                    </motion.button>
                  </form>

                  <motion.div variants={fadeInUp} className="mt-5 sm:mt-6 text-center">
                    <p className="text-xs text-gray-600">
                      Already have an account?{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                    <p className="mt-3 sm:mt-4 text-[10px] text-gray-400 max-w-xs mx-auto">
                      By registering, you agree to our{" "}
                      <a href="/terms" className="hover:text-gray-600 underline">Terms</a> &{" "}
                      <a href="/privacy" className="hover:text-gray-600 underline">Privacy Policy</a>.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}