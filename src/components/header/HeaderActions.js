import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Crown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import NotificationBell from "../NotificationBell";

export default function HeaderActions({
  isPrime,
  isAuthenticated,
  isChatOpen,
  pathname,
  wishlistCount,
  cartCount,
  showSearch,
  setShowSearch,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onToggleChat,
  onLogout,
}) {
  return (
    <>
      {/* Mobile Search Toggle */}
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-[#6f6b62] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]"
        aria-label={showSearch ? "Close search" : "Open search"}
      >
        <Search className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
      </button>

      {/* Prime Badge: membership-aware */}
      <Link
        to="/prime"
        className="hidden sm:flex h-9 items-center gap-1.5 rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#79462f] transition-colors hover:border-[#a85d37]/30 hover:bg-[#e9dace]"
        aria-label={isPrime ? "View Prime membership" : "Explore Prime membership"}
      >
        {isPrime ? (
          <>
            <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.8} /> Prime
          </>
        ) : (
          <>
            <Crown className="h-3.5 w-3.5" strokeWidth={1.8} /> Prime
          </>
        )}
      </Link>

      {/* Product concierge: home uses the contextual floating launcher. */}
      {pathname !== "/" && (
        <button
          onClick={onToggleChat}
          className={`hidden sm:flex h-9 items-center gap-2 border-l border-black/10 pl-3 pr-1 text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors ${
            isChatOpen ? "text-[#a85d37]" : "text-[#4f4b44] hover:text-[#a85d37]"
          }`}
          aria-pressed={isChatOpen}
          aria-label={isChatOpen ? "Close Ask VKart" : "Ask VKart"}
        >
          <span
            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${isChatOpen ? "bg-[#1d1c19] text-white" : "bg-black/[0.045]"}`}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide">Ask VKart</span>
        </button>
      )}

      {/* Wishlist Icon */}
      <Link
        to="/wishlist"
        className="relative group grid h-10 w-10 place-items-center rounded-full text-[#656159] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]"
        aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
      >
        <Heart className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
        <AnimatePresence>
          {wishlistCount > 0 && (
            <motion.span
              key="wish-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 top-0 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[#1d1c19] px-1 text-[9px] font-bold text-white ring-2 ring-[#fffdf8]"
            >
              {wishlistCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Cart Icon */}
      <Link
        to="/cart"
        className="relative group grid h-10 w-10 place-items-center rounded-full text-[#656159] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]"
        aria-label={`Shopping bag${cartCount ? `, ${cartCount} items` : ""}`}
      >
        <ShoppingBag className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span
              key="cart-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 top-0 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[#a85d37] px-1 text-[9px] font-bold text-white ring-2 ring-[#fffdf8]"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Notification Bell - Only for authenticated users */}
      {isAuthenticated && <NotificationBell />}

      {/* Profile / Auth */}
      {isAuthenticated ? (
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 pl-2 border-l border-black/15">
          <Link
            to="/profile"
            className="grid h-10 w-10 place-items-center rounded-full text-[#656159] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]"
            aria-label="Account profile"
          >
            <UserRound className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
          </Link>
          <button
            onClick={onLogout}
            className="grid h-10 w-10 place-items-center rounded-full text-[#656159] transition-colors hover:bg-[#e9e1d7] hover:text-[#75483b]"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="hidden lg:inline-flex items-center justify-center rounded-full bg-[#1d1c19] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          Sign In
        </Link>
      )}

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-[#656159] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
        ) : (
          <Menu className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
        )}
      </button>
    </>
  );
}
