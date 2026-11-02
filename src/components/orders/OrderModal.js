import React from "react";
import { XIcon } from "../ui/icons";

export default function OrderModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted-light hover:text-muted">
            <XIcon size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const reasonInputClass =
  "w-full p-2.5 rounded-xl border border-line-strong text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30";
