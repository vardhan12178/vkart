import React from "react";
import { X } from "lucide-react";

export default function BulkBar({ count, pending, onSetStatus, onClear }) {
  return (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
      <span className="font-bold">{count} selected</span>
      <span className="mx-1 h-4 w-px bg-white/20" />
      {[
        ["active", "Publish"],
        ["draft", "Move to draft"],
        ["archived", "Archive"],
      ].map(([status, label]) => (
        <button
          key={status}
          type="button"
          disabled={pending}
          onClick={() => onSetStatus(status)}
          className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold hover:bg-white/20 disabled:opacity-50"
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onClear()}
        aria-label="Clear selection"
        className="ml-auto rounded-full p-1 hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
