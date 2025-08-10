import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "./axiosInstance";
import {
  EyeIcon,
  EyeOffIcon,
  ShoppingCartIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

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
    <div className={cx("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", palette)}>
      <Icon className="h-4 w-4" />
      <div>{children}</div>
    </div>
  );
};

// simple strength calc
function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
}

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);

  const match = confirmPassword.length > 0 && password === confirmPassword;
  const strength = useMemo(() => passwordStrength(password), [password]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!userId.trim()) e.userId = "User ID is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Use at least 8 characters.";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!agree) e.agree = "Please agree to the terms.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    // live-validate match field
    setErrors((prev) => ({
      ...prev,
      confirmPassword:
        confirmPassword.length === 0
          ? prev.confirmPassword
          : password === confirmPassword
          ? ""
          : "Passwords do not match.",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, confirmPassword]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "https://vkart-t64z.onrender.com/api/register",
        {
          name: name.trim(),
          username: userId.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setFormSuccess(res?.data?.message || "Account created successfully!");
      setTimeout(() => navigate("/login"), 2000);

      setName("");
      setUserId("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* premium bg: blobs + grain + vignette */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-6rem] h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08]"
        style={{ backgroundImage: "url('/login.png')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 [background:radial-gradient(1200px_600px_at_50%_50%,rgba(0,0,0,0),rgba(0,0,0,0.06))]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full">
          <div className="mx-auto overflow-hidden rounded-3xl bg-gradient-to-tr from-neutral-200/60 via-white to-white p-[1px] shadow-[0_20px_70px_-30px_rgba(0,0,0,0.35)]">
            <div className="grid gap-0 lg:grid-cols-2">
              {/* Brand side (optional blurb) */}
              <div className="relative hidden min-h-[640px] flex-col justify-between bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 p-10 text-white lg:flex">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-8 w-8" />
                  <span className="text-2xl font-extrabold tracking-tight">VKart</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-bold leading-tight">Create your account.</h3>
                  <p className="max-w-sm text-white/90">
                    Get personalized picks, save your cart, and track your orders effortlessly.
                  </p>
                </div>

                <div className="text-xs text-white/70">© {new Date().getFullYear()} VKart. All rights reserved.</div>
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
              </div>

              {/* Form */}
              <div className="bg-white/85 p-6 backdrop-blur-sm sm:p-10">
                <div className="mx-auto max-w-md space-y-7">
                  {/* mobile brand */}
                  <div className="flex items-center justify-center gap-2 lg:hidden">
                    <ShoppingCartIcon className="h-8 w-8 text-orange-600" />
                    <span className="text-2xl font-extrabold text-orange-600">VKart</span>
                  </div>

                  <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an Account</h1>
                    <p className="mt-2 text-sm text-gray-600">Join us and start exploring!</p>
                  </div>

                  <Toast show={!!formError}>{formError}</Toast>
                  <Toast show={!!formSuccess} kind="success">
                    {formSuccess}
                  </Toast>

                  <form onSubmit={onSubmit} noValidate className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-800">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={validate}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-err" : undefined}
                        placeholder="Enter your name"
                        className={cx(
                          "w-full rounded-xl border bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition",
                          errors.name
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        )}
                      />
                      <FieldError id="name-err" message={errors.name} />
                    </div>

                    {/* User ID */}
                    <div>
                      <label htmlFor="userId" className="mb-1 block text-sm font-medium text-gray-800">
                        User ID
                      </label>
                      <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onBlur={validate}
                        aria-invalid={!!errors.userId}
                        aria-describedby={errors.userId ? "userid-err" : undefined}
                        placeholder="Choose a unique ID"
                        className={cx(
                          "w-full rounded-xl border bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition",
                          errors.userId
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        )}
                      />
                      <FieldError id="userid-err" message={errors.userId} />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-800">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={validate}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-err" : undefined}
                        placeholder="name@example.com"
                        className={cx(
                          "w-full rounded-xl border bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition",
                          errors.email
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        )}
                      />
                      <FieldError id="email-err" message={errors.email} />
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-800">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={validate}
                          aria-invalid={!!errors.password}
                          aria-describedby={errors.password ? "pw-err" : undefined}
                          placeholder="At least 8 characters"
                          className={cx(
                            "w-full rounded-xl border bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm outline-none transition",
                            errors.password
                              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute inset-y-0 right-0 mr-2 flex items-center text-gray-500 hover:text-orange-600"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      <FieldError id="pw-err" message={errors.password} />

                      {/* strength bar */}
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                        <div
                          className={cx(
                            "h-2 rounded-full transition-all",
                            strength <= 2 && "bg-red-400",
                            strength === 3 && "bg-yellow-400",
                            strength >= 4 && "bg-emerald-500"
                          )}
                          style={{ width: `${(strength / 5) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Use 8+ chars with a mix of upper/lowercase, numbers, and symbols.
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-800">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={validate}
                          aria-invalid={!!errors.confirmPassword}
                          aria-describedby={errors.confirmPassword ? "cpw-err" : undefined}
                          placeholder="Re-enter your password"
                          className={cx(
                            "w-full rounded-xl border bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm outline-none transition",
                            errors.confirmPassword
                              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          className="absolute inset-y-0 right-0 mr-2 flex items-center text-gray-500 hover:text-orange-600"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      <FieldError id="cpw-err" message={errors.confirmPassword} />
                      {confirmPassword.length > 0 && (
                        <p className={cx("mt-1 text-xs", match ? "text-emerald-600" : "text-red-600")}>
                          {match ? "Passwords match." : "Passwords do not match."}
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                      I agree to the <span className="font-medium text-orange-600">Terms</span> and{" "}
                      <span className="font-medium text-orange-600">Privacy Policy</span>.
                    </label>
                    {errors.agree && <p className="text-xs text-red-600">{errors.agree}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Creating account…
                        </>
                      ) : (
                        "Register"
                      )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">
                        Login here
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
              {/* /Form */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
