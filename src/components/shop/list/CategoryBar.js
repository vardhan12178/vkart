import React from "react";
import { FiGrid } from "react-icons/fi";
import { CATEGORIES } from "../catalogData";
import { iconFor } from "../categoryIcons";

export default function CategoryBar({ category, onPick }) {
  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
        {[[null, "All"], ...Object.entries(CATEGORIES)].map(([k, name]) => {
          const Icon = k ? iconFor(k) : FiGrid;
          const active = k === category;
          return (
            <button
              key={k || "all"}
              type="button"
              onClick={() => onPick(k)}
              aria-pressed={active}
              ref={
                active
                  ? (el) => el?.scrollIntoView({ block: "nearest", inline: "center" })
                  : undefined
              }
              className="group flex w-[76px] flex-none flex-col items-center gap-1.5 rounded-xl px-1 py-1.5 sm:w-[86px]"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition ${active ? "bg-ink text-white" : "bg-tint text-[#5f5b52] group-hover:bg-[#e8e1d4]"}`}
              >
                <Icon />
              </span>
              <span
                className={`text-center text-[11px] leading-tight ${active ? "font-bold text-ink" : "text-muted"}`}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
