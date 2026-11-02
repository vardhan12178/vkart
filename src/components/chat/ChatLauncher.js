import React from "react";
import { motion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";

// The floating button that opens the assistant. On the home page it is the larger "Ask VKart" pill.
export default function ChatLauncher({ onOpen, large }) {
  return (
    <motion.button
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpen}
      className={`premium-assistant-toggle pointer-events-auto absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.15rem] border border-black/10 bg-[#f0e8dd] text-[#1d1c19] shadow-[0_16px_42px_rgba(29,28,25,.14)] transition-colors hover:bg-[#fffdf8] ${large ? "md:h-auto md:w-auto md:gap-3 md:p-2 md:pr-5" : "sm:hidden"}`}
      aria-label={large ? "Product concierge Ask VKart" : "Ask VKart assistant"}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.8rem] bg-[#3f493d] text-[#fffdf8]">
        <MessageCircleMore size={18} strokeWidth={1.8} />
      </div>
      {large && (
        <span className="hidden flex-col items-start leading-none md:flex">
          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#625c53]">
            Product concierge
          </span>{" "}
          <span className="mt-1.5 text-sm font-bold tracking-[-0.01em] text-[#1d1c19]">
            Ask VKart
          </span>
        </span>
      )}
    </motion.button>
  );
}
