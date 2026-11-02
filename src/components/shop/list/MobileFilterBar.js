import React from "react";
import { FiFilter } from "react-icons/fi";
import BrandSelect from "../BrandSelect";
import { ACCENT } from "./theme";

export default function MobileFilterBar({ sort, setSort, sortOptions, chipCount, onOpen }) {
  return (
    <div className="has-bottom-bar fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-2 border-t border-line bg-paper lg:hidden">
      <div className="border-r border-line p-1.5">
        <BrandSelect
          label="Sort by"
          prefix="Sort:"
          value={sort}
          onChange={setSort}
          options={sortOptions}
          up
          buttonClassName="justify-center border-transparent bg-transparent hover:border-transparent"
        />
      </div>
      <button
        type="button"
        onClick={() => onOpen()}
        className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-ink"
      >
        <FiFilter /> Filter
        {chipCount > 0 && (
          <span className="rounded-full px-1.5 text-xs text-white" style={{ background: ACCENT }}>
            {chipCount}
          </span>
        )}
      </button>
    </div>
  );
}
