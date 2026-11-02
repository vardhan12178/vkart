import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/outline";

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
      <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
