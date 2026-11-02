import React, { useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IdCard, Lock, Mail, User } from "lucide-react";
import FormAlert from "./ui/FormAlert";
import PasswordStrength from "./ui/PasswordStrength";
import AuthLayout from "./auth/AuthLayout";
import AuthField, { PasswordField } from "./auth/AuthField";
import AuthDivider from "./auth/AuthDivider";
import AuthSubmitButton from "./auth/AuthSubmitButton";
import GoogleAuthButton from "./auth/GoogleAuthButton";
import { fadeInUp } from "./auth/authMotion";

const USERNAME_RE = /^[a-z0-9._-]{3,64}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each rule returns an error message, or "" when the value is fine.
const RULES = {
  name: (v) => (v.trim() ? "" : "Name is required."),
  username: (v) => {
    if (!v.trim()) return "Username is required.";
    return USERNAME_RE.test(v.trim()) ? "" : "3-64 chars, alphanumeric, dot, underscore.";
  },
  email: (v) => {
    if (!v.trim()) return "Email is required.";
    return EMAIL_RE.test(v.trim()) ? "" : "Enter a valid email.";
  },
  password: (v) => {
    if (!v) return "Password is required.";
    return v.length < 8 ? "Min 8 characters required." : "";
  },
  confirmPassword: (v, form) => {
    if (!v) return "Confirm your password.";
    return form.password === v ? "" : "Passwords do not match.";
  },
};

const FIELDS = ["name", "username", "email", "password", "confirmPassword"];
const EMPTY_FORM = { name: "", username: "", email: "", password: "", confirmPassword: "" };
const ALL_TOUCHED = Object.fromEntries(FIELDS.map((f) => [f, true]));

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(Object.fromEntries(FIELDS.map((f) => [f, false])));
  const [toast, setToast] = useState({ show: false, kind: "error", msg: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const showError = (msg) => setToast({ show: true, kind: "error", msg });
  const clearToast = () => setToast({ show: false, kind: "error", msg: "" });

  // Re-check a field once the shopper has touched it
  const validateField = (field, value) => {
    if (!touched[field]) return;
    setErrors((prev) => {
      const next = { ...prev, [field]: RULES[field](value, form) };
      if (field === "password" && touched.confirmPassword && form.confirmPassword) {
        next.confirmPassword = value === form.confirmPassword ? "" : "Passwords do not match.";
      }
      return next;
    });
  };

  const setField = (field, value) => {
    setForm((s) => ({ ...s, [field]: value }));
    validateField(field, value);
  };

  const blur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const validate = () => {
    const found = {};
    FIELDS.forEach((f) => {
      const message = RULES[f](form[f], form);
      if (message) found[f] = message;
    });
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    clearToast();
    setTouched(ALL_TOUCHED);
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim()));
      await axios.post("/api/register", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({ show: true, kind: "success", msg: "Account created! Redirecting..." });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    clearToast();
    setGoogleLoading(true);
    try {
      await axios.post(
        "/api/auth/google",
        { idToken: cred?.credential, remember: true },
        { withCredentials: true }
      );
      navigate("/");
    } catch (err) {
      showError(err?.response?.data?.message || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const field = (name, props) => ({
    id: name,
    compact: true,
    value: form[name],
    error: errors[name],
    touched: touched[name],
    onChange: (e) => setField(name, e.target.value),
    onBlur: () => blur(name),
    ...props,
  });

  return (
    <AuthLayout
      compact
      metaTitle="Join VKart — Create Account"
      metaDescription="Create your VKart account today."
      headline={
        <>
          Make room for
          <br />
          better things.
        </>
      }
      title="Create your account."
      subtitle="Save favourites, track orders, and shop your edit."
    >
      <AnimatePresence>
        {toast.show && (
          <FormAlert compact show={toast.show} kind={toast.kind}>
            {toast.msg}
          </FormAlert>
        )}
      </AnimatePresence>

      <GoogleAuthButton
        compact
        onSuccess={handleGoogleSuccess}
        onError={() => showError("Google sign-in failed.")}
        loading={googleLoading}
        text="signup_with"
      />

      <AuthDivider compact>or register with email</AuthDivider>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <AuthField
          {...field("name", {
            label: "Full Name",
            icon: User,
            type: "text",
            placeholder: "Enter your name",
          })}
        />
        <AuthField
          {...field("username", {
            label: "Username",
            icon: IdCard,
            type: "text",
            placeholder: "your.username",
          })}
        />
        <AuthField
          {...field("email", {
            label: "Email",
            icon: Mail,
            type: "email",
            placeholder: "you@example.com",
          })}
        />
        <PasswordField
          {...field("password", {
            label: "Password",
            icon: Lock,
            placeholder: "Create password",
            below: <PasswordStrength compact password={form.password} />,
          })}
        />
        <PasswordField
          {...field("confirmPassword", {
            label: "Confirm Password",
            icon: Lock,
            placeholder: "Repeat password",
            errorId: "confirm-error",
          })}
        />

        <AuthSubmitButton
          compact
          loading={loading}
          label="Create Account"
          loadingLabel="Creating Account..."
        />
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
        <p className="mt-3 sm:mt-4 text-[10px] text-gray-500 max-w-xs mx-auto">
          By registering, you agree to our{" "}
          <a href="/terms" className="hover:text-gray-600 underline">
            Terms
          </a>{" "}
          &{" "}
          <a href="/privacy" className="hover:text-gray-600 underline">
            Privacy Policy
          </a>
          .
        </p>
      </motion.div>
    </AuthLayout>
  );
}
