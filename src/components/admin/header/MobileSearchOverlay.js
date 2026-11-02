import React, { useRef } from "react";
import { SearchIcon, XIcon } from "@heroicons/react/outline";
import useClickOutside from "./useClickOutside";

export default function MobileSearchOverlay({ onClose }) {
  const mobileSearchRef = useRef(null);
  useClickOutside(mobileSearchRef, onClose);

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={mobileSearchRef}
        className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top duration-300"
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              autoFocus
              type="text"
              className="
                    block w-full pl-11 pr-4 py-3
                    rounded-xl border border-slate-200
                    bg-slate-50 text-slate-900 placeholder-slate-500
                    focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10
                    transition-all duration-200 text-sm font-medium outline-none
                  "
              placeholder="Search the operation"
            />
          </div>
          <button
            onClick={() => onClose()}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close search"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
