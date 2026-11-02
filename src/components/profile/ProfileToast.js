import React from "react";
import { CircleCheckIcon, CircleXIcon } from "../ui/icons";

export default function ProfileToast({ kind = "success", message }) {
  if (!message) return null;
  const ok = kind === "success";
  return (
    <div className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 animate-fade-in-down">
      <div
        className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border ${
          ok ? "bg-ok/10 border-ok/30 text-ok" : "bg-alert/10 border-alert/30 text-alert"
        }`}
      >
        <div className={`p-1 rounded-full ${ok ? "bg-ok/20" : "bg-alert/20"}`}>
          {ok ? <CircleCheckIcon size={14} /> : <CircleXIcon size={14} />}
        </div>
        <span className="text-sm font-semibold tracking-wide">{message}</span>
      </div>
    </div>
  );
}
