import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Crown, LogOut, Sparkles, UserRound } from "lucide-react";
import { CATEGORIES } from "../shop/catalogData";
import { iconFor } from "../shop/categoryIcons";
import { CATEGORY_GROUPS } from "./CategoriesMenu";

export default function MobileDrawer({
  open,
  navLinks,
  isActive,
  isAuthenticated,
  isPrime,
  categoryCounts,
  onClose,
  onToggleChat,
  onLogout,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="lg:hidden overflow-hidden border-t border-black/[0.07] bg-[#fffdf8]/98 backdrop-blur-xl shadow-lg"
        >
          <div className="px-4 py-3 space-y-2.5">
            {/* Mobile Nav Links */}
            <div className="space-y-0.5">
              {navLinks.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors ${
                      active
                        ? "bg-[#1d1c19] text-white"
                        : "text-[#6f6b62] hover:bg-black/[0.04] hover:text-[#1d1c19]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => onClose()}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors ${
                    isActive("/profile")
                      ? "bg-[#1d1c19] text-white"
                      : "text-[#6f6b62] hover:bg-black/[0.04] hover:text-[#1d1c19]"
                  }`}
                >
                  <UserRound className="h-4 w-4" strokeWidth={1.8} />
                  Profile
                </Link>
              )}
            </div>

            {/* Mobile categories */}
            <div className="border-t border-black/[0.06] pt-2.5">
              {CATEGORY_GROUPS.map((g) => (
                <div key={g.title} className="mb-2 last:mb-0">
                  <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-light">
                    {g.title}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {g.keys.map((key) => {
                      const Icon = iconFor(key);
                      return (
                        <Link
                          key={key}
                          to={`/products?cat=${key}`}
                          onClick={() => onClose()}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-black/[0.04] hover:text-ink"
                        >
                          <Icon size={14} className="shrink-0 text-muted" />
                          <span className="min-w-0 flex-1 truncate">{CATEGORIES[key]}</span>
                          {categoryCounts[key] > 0 && (
                            <span className="text-[10px] text-muted-faint">
                              {categoryCounts[key]}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Prime Banner */}
            <Link
              to="/prime"
              onClick={() => onClose()}
              className="flex items-center gap-2.5 rounded-xl border border-[#a85d37]/15 bg-[#efe4d9] px-3 py-2 text-xs font-bold text-[#79462f] transition-colors hover:bg-[#e9dace]"
            >
              {isPrime ? (
                <BadgeCheck className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Crown className="h-4 w-4" strokeWidth={1.8} />
              )}
              {isPrime ? "Prime Member" : "Get Prime"}
            </Link>

            {/* Mobile Actions */}
            <div className="grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-2.5">
              <button
                onClick={onToggleChat}
                className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#1d1c19] px-3 text-xs font-bold text-white transition-colors hover:bg-black active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} /> Ask VKart
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-[#eee8df] px-3 text-xs font-bold text-[#75483b] transition-colors hover:bg-[#e6ddd2] active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => onClose()}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#1d1c19] px-3 text-xs font-bold text-white transition-colors hover:bg-black active:scale-95"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
