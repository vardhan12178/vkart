import React from "react";

export const inputClass =
  "w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 bg-slate-50/50 focus:bg-white outline-none";

export function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

export function CheckField({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
      />
      {children}
    </label>
  );
}

// Dialog shell for create/edit forms: title bar, form body and Cancel / submit footer.
export default function FormModal({
  title,
  size = "max-w-lg",
  saving,
  submitLabel,
  onClose,
  onSubmit,
  children,
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-2xl shadow-2xl w-full ${size} max-h-[94vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="p-4 sm:p-6 space-y-3 sm:space-y-4"
        >
          {children}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
            >
              {saving ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
