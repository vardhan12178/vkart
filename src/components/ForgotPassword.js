import React, { useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  MailIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline";

const cx = (...c) => c.filter(Boolean).join(" ");

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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setOkMsg("");
    setErrMsg("");
    const v = value.trim();
    if (!v) {
      setErrMsg("Please enter your email or username.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/forgot", { emailOrUsername: v });
      setOkMsg(data?.message || "If an account exists, a reset link was sent.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Try again.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-500"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sign in
        </button>

        <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your email or username. We’ll send a reset link if an account exists.</p>
          </div>

          <div className="space-y-3">
            <Toast show={!!okMsg} kind="success">{okMsg}</Toast>
            <Toast show={!!errMsg}>{errMsg}</Toast>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <label htmlFor="emailOrUsername" className="mb-1 block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="emailOrUsername"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="you@example.com or yourusername"
                className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                autoComplete="username email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t need a reset?{" "}
            <button onClick={() => navigate("/register")} className="font-semibold text-orange-600 hover:text-orange-500">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
