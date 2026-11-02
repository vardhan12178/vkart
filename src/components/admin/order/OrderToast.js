import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";

export default function OrderToast({ toast }) {
  if (!toast.message) return null;
  const ok = toast.type === "success";
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
        ok ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-red-100 text-red-800"
      }`}
    >
      {ok ? (
        <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-red-500" />
      )}
      <span className="text-sm font-semibold">{toast.message}</span>
    </div>
  );
}
