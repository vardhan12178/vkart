import React from "react";
import { Send } from "lucide-react";
import { Dots } from "../ui/Skeleton";

export default function ChatComposer({ value, onChange, onSend, isLoading, cooldown }) {
  const blocked = isLoading || cooldown > 0;
  return (
    <div className="premium-assistant-input p-3 sm:p-4 bg-[#fffdf8] border-t border-black/[0.08] relative z-20">
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Ask anything about products..."}
          className="w-full bg-[#f5f1e9] text-xs sm:text-sm h-10 sm:h-12 pl-4 pr-11 rounded-full border border-black/[0.07] focus:bg-white focus:border-[#a85d37]/40 focus:ring-2 focus:ring-[#a85d37]/10 transition-all outline-none font-medium placeholder:text-[#969086]"
          disabled={blocked}
        />
        <button
          onClick={onSend}
          disabled={blocked || !value.trim()}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center transition-all
            ${
              !value.trim() || isLoading
                ? "cursor-not-allowed bg-transparent text-[#c4beb4]"
                : "bg-[#1d1c19] text-white hover:bg-black active:scale-95"
            }`}
          aria-label="Send message"
        >
          {isLoading ? <Dots /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
