import React from "react";
import { FiX } from "react-icons/fi";

export default function ActiveChips({ chips }) {
  if (!chips.length) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.clear}
          className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white"
        >
          {c.label}
          <FiX />
        </button>
      ))}
    </div>
  );
}
