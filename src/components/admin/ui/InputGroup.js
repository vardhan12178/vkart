import React from "react";

// Shared labeled input used across admin forms. Previously duplicated
// (identically) in AdminSettings.js and AdminProfile.js.
export default function InputGroup({ label, icon, className = "", ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-400
            focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-white
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${icon ? "pl-10 pr-4" : "px-4"}
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}
