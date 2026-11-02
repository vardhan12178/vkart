import React from "react";
import { CircleCheckIcon, LockIcon, QrCodeIcon, ShieldCheckIcon } from "../ui/icons";

// Two-factor authentication status with enable/disable.
export default function SecurityCard({ enabled, twoFA }) {
  const { state, start, disable } = twoFA;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-line shadow-xs relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${enabled ? "bg-ok" : "bg-line"}`} />
      <div className="flex flex-row justify-between items-center gap-3">
        <div className="flex gap-2.5 sm:gap-4 items-center">
          <div
            className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-xs sm:text-lg shrink-0 ${
              enabled ? "bg-ok/10 text-ok" : "bg-tint text-muted-light"
            }`}
          >
            <ShieldCheckIcon />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-bold text-ink flex items-center gap-1.5">
              Two-Factor Auth
              {enabled && <CircleCheckIcon className="text-ok text-xs" />}
            </h3>
            <p className="text-muted text-[11px] sm:text-xs">Enhanced account protection</p>
          </div>
        </div>

        {enabled ? (
          <button
            onClick={disable}
            disabled={state.disabling}
            className="flex items-center gap-1 rounded-xl border border-line-strong px-3 py-1.5 text-xs font-bold text-ink-soft hover:bg-sand transition shadow-2xs shrink-0"
          >
            <LockIcon size={10} /> {state.disabling ? "..." : "Disable"}
          </button>
        ) : (
          <button
            onClick={start}
            disabled={state.loading}
            className="px-3 py-1.5 rounded-xl bg-ink text-white font-bold shadow-2xs hover:bg-black transition text-xs flex items-center gap-1 shrink-0"
          >
            <QrCodeIcon size={11} /> {state.loading ? "..." : "Enable"}
          </button>
        )}
      </div>
    </div>
  );
}
