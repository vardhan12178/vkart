import React from "react";
import { FiX } from "react-icons/fi";
import FilterPanel from "./FilterPanel";
import { ACCENT } from "./theme";

export default function FilterSheet({ data, bands, sel, act, total, clearAll, onClose }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-paper px-5 pb-24">
        <div className="sticky top-0 flex items-center justify-between bg-paper py-4">
          <span className="text-base font-bold text-ink">Filters</span>
          <button type="button" onClick={() => onClose()} aria-label="Close">
            <FiX className="text-xl" />
          </button>
        </div>
        <FilterPanel facets={data?.facets} bands={bands} sel={sel} act={act} />
        <div className="fixed inset-x-0 bottom-0 grid grid-cols-2 gap-3 border-t border-line bg-paper p-3">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-ink py-3 text-sm font-bold"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onClose()}
            className="rounded-full py-3 text-sm font-bold text-white"
            style={{ background: ACCENT }}
          >
            Show {total} products
          </button>
        </div>
      </div>
    </div>
  );
}
