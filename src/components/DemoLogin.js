import React, { useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import axios from "./axiosInstance";
import { Dots } from "./ui/Skeleton";

const COPY = {
  shopper: {
    icon: Sparkles,
    title: "Try the demo shopper",
    hint: "One click, no sign-up. Browse, add to bag and check out in Razorpay test mode.",
    endpoint: "/api/auth/demo/shopper",
  },
  admin: {
    icon: ShieldCheck,
    title: "Explore the admin demo",
    hint: "Read-only: products, orders, coupons, sales and membership. Customer data stays private.",
    endpoint: "/api/auth/demo/admin",
  },
};

// One-click recruiter-friendly sign in. The server owns the demo accounts; nothing here knows a password.
export default function DemoLogin({ kind = "shopper", onSignedIn, className = "" }) {
  const copy = COPY[kind];
  const Icon = copy.icon;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await axios.post(copy.endpoint, {}, { withCredentials: true });
      await onSignedIn?.(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "The demo is unavailable right now. Please try again in a moment.");
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-2xl border border-dashed border-accent/40 bg-tint/60 p-3.5 ${className}`}>
      <button
        type="button"
        onClick={start}
        disabled={busy}
        data-testid={`demo-${kind}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-70"
      >
        {busy ? <><span>Signing you in</span><Dots /></> : <><Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />{copy.title}</>}
      </button>
      <p className="mt-2 text-center text-xs text-muted">{copy.hint}</p>
      {error && <p role="alert" className="mt-2 text-center text-xs font-semibold text-alert">{error}</p>}
    </div>
  );
}
