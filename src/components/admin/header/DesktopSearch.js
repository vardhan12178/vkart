import React from "react";
import { SearchIcon } from "@heroicons/react/outline";

export default function DesktopSearch() {
  return (
    <div className="mr-auto hidden max-w-lg flex-1 lg:flex">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-[#8b867d] transition-colors group-focus-within:text-[#a85d37]" />
        </div>
        <input
          type="text"
          className="
                    block w-full pl-11 pr-20 py-2.5 
                    rounded-full border-0 
                    bg-[#f1ede5] hover:bg-[#eee9e0] focus:bg-[#fffdf8]
                    text-[#1d1c19] placeholder-[#99948a]
                    ring-1 ring-black/[0.07] focus:ring-[#a85d37]/20
                    transition-all duration-200
                    text-sm font-medium outline-none
                  "
          placeholder="Search the operation"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="hidden h-6 items-center rounded-full border border-black/10 bg-[#fffdf8] px-2 text-[10px] font-bold text-[#777269] sm:inline-flex">
            /
          </kbd>
        </div>
      </div>
    </div>
  );
}
