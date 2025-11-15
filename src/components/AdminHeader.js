import React from "react";
import { Link } from "react-router-dom";
import { MenuIcon, ShoppingCartIcon } from "@heroicons/react/outline";
import { motion } from "framer-motion";

export default function AdminHeader({ setMobileOpen }) {
  return (
    <header
      className="
        h-16 
        bg-white/80 
        backdrop-blur-md 
        border-b border-gray-200 
        flex items-center justify-between 
        px-4 lg:px-6
        shadow-sm
      "
    >
      {/* Mobile Menu */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <MenuIcon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Brand */}
      <Link to="/admin/dashboard" className="flex items-center gap-3 group">
        <motion.span
          whileHover={{ scale: 0.93 }}
          className="
            grid h-9 w-9 place-items-center 
            rounded-xl 
            bg-gradient-to-br from-orange-500 to-amber-400 
            text-white 
            shadow-md 
            transition-all
          "
        >
          <ShoppingCartIcon className="h-5 w-5" />
        </motion.span>

        <span
          className="
            text-[20px] font-extrabold 
            tracking-tight text-gray-900
            group-hover:text-orange-600 
            transition-colors
          "
        >
          VKart Admin
        </span>
      </Link>

      {/* Right Section (Avatar placeholder) */}
      <div className="flex items-center">
        <div
       
        >
          
        </div>
      </div>
    </header>
  );
}
