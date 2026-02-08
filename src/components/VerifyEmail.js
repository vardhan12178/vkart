import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "./axiosInstance";

export default function VerifyEmail() {
  const { search } = useLocation();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`/api/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage(res?.data?.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Verification</h1>
        <p className="text-sm text-gray-600 mb-6">
          {status === "verifying" ? "Verifying your email..." : message}
        </p>
        {status !== "verifying" && (
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-md hover:bg-black transition"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
}
