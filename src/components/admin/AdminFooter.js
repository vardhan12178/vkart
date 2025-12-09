import React from "react";
import { HeartIcon } from "@heroicons/react/solid";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-6 md:px-8 mt-auto bg-white border-t border-slate-200/60">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <div className="text-sm text-slate-500 font-medium text-center md:text-left">
          &copy; {currentYear} <span className="font-bold text-slate-700">VKart Admin</span>. All rights reserved.
        </div>

        {/* Dev Credit */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <span>Made with</span>
          <HeartIcon className="h-3.5 w-3.5 text-red-500 animate-pulse" />
          <span>by Bala Vardhan</span>
        </div>

      </div>
    </footer>
  );
}