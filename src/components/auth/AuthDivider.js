import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "./authMotion";

export default function AuthDivider({ children, compact = false }) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`relative flex items-center gap-3 sm:gap-4 ${compact ? "mb-4 sm:mb-5" : "mb-5 sm:mb-6"}`}
    >
      <div className="h-px bg-gray-200 flex-1" />
      <span
        className={`text-[10px] text-gray-500 uppercase tracking-wider ${
          compact ? "font-bold" : "sm:text-xs font-medium"
        }`}
      >
        {children}
      </span>
      <div className="h-px bg-gray-200 flex-1" />
    </motion.div>
  );
}
