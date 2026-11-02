import React from "react";
import { motion } from "framer-motion";
import { Dots } from "../ui/Skeleton";
import { fadeInUp } from "./authMotion";

export default function AuthSubmitButton({ loading, label, loadingLabel, compact = false }) {
  return (
    <motion.button
      variants={fadeInUp}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={loading}
      className={`w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 font-bold text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all ${
        compact ? "py-3 text-sm mt-2" : "py-3 sm:py-3.5 text-sm sm:text-base"
      }`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Dots />}
        {loading ? loadingLabel : label}
      </span>
    </motion.button>
  );
}
