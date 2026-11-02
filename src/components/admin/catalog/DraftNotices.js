import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DraftNotices({ canWrite, counts, publishing, onPublishAll }) {
  return (
    <>
      {!canWrite && counts.draft > 0 && (
        <div
          role="note"
          className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <span>
            {counts.draft} products are drafts, but this account has read-only access to products,
            so it can't publish them. Sign in with an admin that has write access (the demo admin is
            read-only).
          </span>
        </div>
      )}

      {canWrite && counts.draft > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
            <span>
              {counts.draft === counts.all
                ? `All ${counts.draft} products are drafts.`
                : `${counts.draft} of ${counts.all} products are drafts.`}{" "}
              The shop shows drafts for now; publish them so it can switch to active products only.
            </span>
          </p>
          <button
            type="button"
            disabled={publishing}
            onClick={() =>
              window.confirm(
                `Publish all ${counts.draft} draft products? You can move them back to draft any time.`
              ) && onPublishAll()
            }
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
          >
            Publish all {counts.draft} drafts
          </button>
        </div>
      )}
    </>
  );
}
