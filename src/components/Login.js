import React, { useState, useEffect } from "react";
import axios from "./axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { loginSuccess } from "../redux/authSlice";
import DemoLogin from "./DemoLogin";
import FormAlert from "./ui/FormAlert";
import AuthLayout from "./auth/AuthLayout";
import AuthField, { PasswordField } from "./auth/AuthField";
import AuthDivider from "./auth/AuthDivider";
import AuthSubmitButton from "./auth/AuthSubmitButton";
import GoogleAuthButton from "./auth/GoogleAuthButton";
import TwoFactorModal from "./auth/TwoFactorModal";
import useUserSession from "./auth/useUserSession";
import { fadeInUp } from "./auth/authMotion";

const REQUIRED = {
  userId: "Please enter your email address.",
  password: "Please enter your password.",
};

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { requireUserSession } = useUserSession();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({ userId: "", password: "" });
  const [touched, setTouched] = useState({ userId: false, password: false });

  const [show2fa, setShow2fa] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaError, setTwofaError] = useState("");
  const [verifying2fa, setVerifying2fa] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const finishLogin = (data) => {
    dispatch(loginSuccess(requireUserSession(data)));
    navigate(redirect);
  };

  const validate = () => {
    const next = {
      userId: userId.trim() ? "" : REQUIRED.userId,
      password: password ? "" : REQUIRED.password,
    };
    setErrors(next);
    return !next.userId && !next.password;
  };

  // Re-check a single field as the shopper edits it, once they have touched it
  const validateField = (field, value) => {
    if (!touched[field]) return;
    const empty = field === "userId" ? !value.trim() : !value;
    setErrors((prev) => ({ ...prev, [field]: empty ? REQUIRED[field] : "" }));
  };

  const touch = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const checkCaps = (ev) => {
    if (typeof ev.getModifierState === "function") setCapsOn(!!ev.getModifierState("CapsLock"));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setTouched({ userId: true, password: true });
    if (!validate()) return;

    setLoading(true);
    const start = performance.now();
    try {
      const payload = { username: userId.trim(), password, remember };
      const res = await axios.post("/api/login", payload, { withCredentials: true });

      if (res.data?.require2FA) {
        setPendingLogin(payload);
        setShow2fa(true);
        setTwofaCode("");
        setTwofaError("");
        return;
      }
      finishLogin(res.data);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Invalid credentials. Please try again.");
      if (performance.now() - start > 15000 && !apiMsg) {
        setFormError("Server is waking up. Please try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submit2FA = async () => {
    if (!pendingLogin) return;
    const code = twofaCode.trim();
    if (code.length < 6) {
      setTwofaError("Enter the 6-digit code");
      return;
    }
    setVerifying2fa(true);
    setTwofaError("");
    try {
      const verify = await axios.post(
        "/api/login",
        { ...pendingLogin, token2fa: code },
        { withCredentials: true }
      );
      dispatch(loginSuccess(requireUserSession(verify.data)));
      setShow2fa(false);
      setPendingLogin(null);
      navigate(redirect);
    } catch (err) {
      setTwofaError(err?.response?.data?.message || "Invalid or expired code. Try again.");
    } finally {
      setVerifying2fa(false);
    }
  };

  const close2fa = () => {
    setShow2fa(false);
    setTwofaCode("");
    setTwofaError("");
  };

  const handleGoogleSuccess = async (cred) => {
    setFormError("");
    setGoogleLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/google",
        { idToken: cred?.credential, remember },
        { withCredentials: true }
      );
      finishLogin(res.data);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Google sign-in failed. Try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <AuthLayout
        metaTitle="Sign in — VKart"
        metaDescription="Sign in to VKart to shop curated products, track orders, and enjoy fast delivery."
        headline={
          <>
            Welcome back to
            <br />
            better choices.
          </>
        }
        title="Welcome back."
        subtitle="Sign in to continue your shopping journey."
      >
        <AnimatePresence>
          {formError && <FormAlert show={!!formError}>{formError}</FormAlert>}
        </AnimatePresence>

        <motion.div variants={fadeInUp} className="mb-5 sm:mb-6">
          <DemoLogin kind="shopper" onSignedIn={finishLogin} />
        </motion.div>

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={() => setFormError("Google sign-in was cancelled or failed.")}
          loading={googleLoading}
          text="continue_with"
        />

        <AuthDivider>or sign in with email</AuthDivider>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5" noValidate>
          <AuthField
            id="userId"
            label="Email"
            icon={User}
            type="email"
            value={userId}
            placeholder="Enter your email"
            error={errors.userId}
            touched={touched.userId}
            onChange={(e) => {
              setUserId(e.target.value);
              validateField("userId", e.target.value);
            }}
            onBlur={() => touch("userId", userId)}
          />

          <PasswordField
            id="password"
            label="Password"
            icon={Lock}
            value={password}
            placeholder="••••••••"
            error={errors.password}
            touched={touched.password}
            onChange={(e) => {
              setPassword(e.target.value);
              validateField("password", e.target.value);
            }}
            onKeyUp={checkCaps}
            onKeyDown={checkCaps}
            onBlur={() => touch("password", password)}
            below={
              capsOn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block"
                >
                  Caps Lock is on
                </motion.div>
              )
            }
          />

          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                Remember for 30 days
              </span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-500 hover:underline decoration-2 underline-offset-2 transition-all"
            >
              Forgot password?
            </button>
          </motion.div>

          <AuthSubmitButton loading={loading} label="Sign In" loadingLabel="Signing in..." />
        </form>

        <motion.div variants={fadeInUp} className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Create account
            </button>
          </p>
        </motion.div>
      </AuthLayout>

      <TwoFactorModal
        open={show2fa}
        code={twofaCode}
        error={twofaError}
        verifying={verifying2fa}
        onChange={(v) => {
          setTwofaCode(v);
          setTwofaError("");
        }}
        onSubmit={submit2FA}
        onClose={close2fa}
      />
    </>
  );
}
