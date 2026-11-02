import React from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/outline";

export default function AdminToast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      role="status"
      className={`fixed z-50 top-5 right-5 px-4 py-3 rounded-xl shadow-xl border bg-white flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${
        isError ? "border-red-100 text-red-800" : "border-emerald-100 text-emerald-800"
      }`}
    >
      {isError ? (
        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      ) : (
        <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
