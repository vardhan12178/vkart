import React from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function ReplyBar({ value, onChange, onSend }) {
  return (
    <div className="p-2.5 sm:p-3 bg-white border-t border-slate-100 shrink-0">
      <div className="flex items-center gap-2 bg-slate-100/90 rounded-full pl-4 pr-1.5 py-1.5 border border-slate-200/60 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-400/20 transition-all">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none"
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black transition-all shrink-0 shadow-xs"
        >
          <FaPaperPlane size={11} className="-ml-0.5" />
        </button>
      </div>
    </div>
  );
}
