import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/outline";

// Edit / delete buttons for a list row. `compact` is the labelled phone variant.
export default function RowActions({ label, onEdit, onDelete, compact }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
        >
          <PencilIcon className="h-3 w-3" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 transition"
        >
          <TrashIcon className="h-3 w-3" />
          <span>Delete</span>
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <PencilIcon className="h-4 w-4 text-slate-500" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="p-2 rounded-lg hover:bg-red-50 transition"
      >
        <TrashIcon className="h-4 w-4 text-red-400" />
      </button>
    </div>
  );
}
