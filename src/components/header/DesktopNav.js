import React from "react";
import { Link } from "react-router-dom";
import CategoriesMenu from "./CategoriesMenu";

export default function DesktopNav({ navLinks, isActive }) {
  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
      <CategoriesMenu />
      {navLinks.map((item) => {
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className="relative px-3 xl:px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#5f5b52] hover:text-[#1d1c19] transition-colors group"
          >
            {item.label}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[#1d1c19] transition-all duration-300 group-hover:w-1/2 ${active ? "w-1/2" : ""}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
