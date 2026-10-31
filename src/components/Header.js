import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Home as HomeIcon, Zap as LightningBoltIcon } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import axios from "./axiosInstance";
import { logout } from "../redux/authSlice";
import { clearCart } from "../redux/cartSlice";
import { clearWishlist } from "../redux/wishlistSlice";
import { toggleChat } from "../redux/uiSlice";
import AnnouncementBar from "./AnnouncementBar";
import NotificationBell from "./NotificationBell";
import { qk } from "../query/queryKeys";
import HeaderSearch from "./header/HeaderSearch";
import CategoriesMenu, { CATEGORY_GROUPS, useCategoryCounts } from "./header/CategoriesMenu";
import { CATEGORIES } from "./shop/catalogData";
import { iconFor } from "./shop/categoryIcons";

const Header = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Use Redux state
  const cartItems = useSelector((state) => state.cart);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isChatOpen = useSelector((state) => state.ui.isChatOpen);

  const user = useSelector((state) => state.auth.user);
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const isPrime = !!user?.isPrime;
  const wishlistItems = useSelector((state) => state.wishlist);
  const wishlistCount = wishlistItems.length;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [hasActiveSale, setHasActiveSale] = useState(false);
  const categoryCounts = useCategoryCounts(isMobileMenuOpen);

  // --- Effects ---

  // 0. Check if there's an active sale (lightweight, cached in Redis)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/sales/active");
        if (!cancelled) setHasActiveSale(!!res.data?.sale);
      } catch { if (!cancelled) setHasActiveSale(false); }
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  // 1. Handle Scroll styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2. Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      queryClient.setQueryData(qk.auth.session, { authenticated: false, user: null });
      [
        qk.profile.root,
        qk.profile.orders,
        qk.profile.addresses,
        qk.profile.wallet,
        qk.profile.cart,
        qk.profile.wishlist,
        qk.membership.status,
      ].forEach((queryKey) => {
        queryClient.removeQueries({ queryKey });
      });
      dispatch(clearCart());
      dispatch(clearWishlist());
      dispatch(logout());
      navigate("/", { replace: true });
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path.includes("?")) {
      const [pathname, query] = path.split("?");
      return location.pathname === pathname && location.search.includes(query);
    }
    return location.pathname.startsWith(path);
  };

  const handleChatToggle = () => {
    setIsMobileMenuOpen(false);
    dispatch(toggleChat());
  };

  // Hide header on auth pages
  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (authPaths.includes(location.pathname)) return null;

  const navLinks = [
    { label: "Home", to: "/", icon: HomeIcon },
    ...(hasActiveSale ? [{ label: "Sale", to: "/products?sort=discount", icon: LightningBoltIcon }] : []),
  ];

  return (
    <>
      <AnnouncementBar />
      <header
        role="banner"
        data-scrolled={scrolled ? "true" : "false"}
        className={`vkart-site-header sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "backdrop-blur-xl"
          : ""
          }`}
      >
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-[4.75rem] items-center justify-between gap-4">

            {/* --- LEFT: BRAND & NAV --- */}
            <div className="flex items-center gap-5 xl:gap-8">
              <Link to="/" className="group flex items-center gap-2.5 shrink-0" aria-label="VKart home">
                <div className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#1d1c19] text-white transition-transform group-hover:-rotate-3 group-hover:scale-95">
                  <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#b66a3c] border-2 border-[#fffdf8]" />
                </div>
                <span className="hidden sm:block text-xl font-extrabold tracking-[-0.05em] text-[#1d1c19]">
                  VKart
                </span>
              </Link>

              {/* Desktop Nav Links */}
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
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[#1d1c19] transition-all duration-300 group-hover:w-1/2 ${active ? "w-1/2" : ""}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* --- CENTER: SEARCH (Desktop) --- */}
            <div className="hidden lg:flex flex-1 max-w-md mx-2 xl:mx-4">
              <HeaderSearch variant="desktop" />
            </div>


            {/* --- RIGHT: ACTIONS --- */}
            <div className="flex items-center gap-1.5 xl:gap-3 shrink-0">

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-[#6f6b62] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]"
                aria-label={showSearch ? "Close search" : "Open search"}
              >
                <Search className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
              </button>

              {/* Prime Badge — membership-aware */}
              <Link
                to="/prime"
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#79462f] transition-colors hover:border-[#a85d37]/30 hover:bg-[#e9dace]"
                aria-label={isPrime ? "View Prime membership" : "Explore Prime membership"}
              >
                {isPrime ? (
                  <><BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.8} /> Prime</>
                ) : (
                  <><Crown className="h-3.5 w-3.5" strokeWidth={1.8} /> Prime</>
                )}
              </Link>

              {/* Product concierge: home uses the contextual floating launcher. */}
              {location.pathname !== "/" && (
                <button
                  onClick={() => dispatch(toggleChat())}
                  className={`hidden sm:flex h-9 items-center gap-2 border-l border-black/10 pl-3 pr-1 text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors ${isChatOpen
                    ? "text-[#a85d37]"
                    : "text-[#4f4b44] hover:text-[#a85d37]"
                    }`}
                  aria-pressed={isChatOpen}
                  aria-label={isChatOpen ? "Close VKart concierge" : "Open VKart concierge"}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${isChatOpen ? "bg-[#1d1c19] text-white" : "bg-black/[0.045]"}`}>
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
                  <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full text-[#656159] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19]" aria-label="Account profile">
                    <UserRound className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />
                  </Link>
                  <button
                    onClick={handleLogout}
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
                {isMobileMenuOpen ? <X className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} /> : <Menu className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.7} />}
              </button>
            </div>
          </div>

          {/* --- MOBILE SEARCH BAR (Expandable) --- */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden pb-4 pt-1"
              >
                <HeaderSearch variant="mobile" autoFocus onDone={() => setShowSearch(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- MOBILE DRAWER --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
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
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors ${active
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
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors ${isActive("/profile")
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
                      <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-light">{g.title}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {g.keys.map((key) => {
                          const Icon = iconFor(key);
                          return (
                            <Link
                              key={key}
                              to={`/products?cat=${key}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-black/[0.04] hover:text-ink"
                            >
                              <Icon size={14} className="shrink-0 text-muted" />
                              <span className="min-w-0 flex-1 truncate">{CATEGORIES[key]}</span>
                              {categoryCounts[key] > 0 && <span className="text-[10px] text-muted-faint">{categoryCounts[key]}</span>}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-[#a85d37]/15 bg-[#efe4d9] px-3 py-2 text-xs font-bold text-[#79462f] transition-colors hover:bg-[#e9dace]"
                >
                  {isPrime ? <BadgeCheck className="h-4 w-4" strokeWidth={1.8} /> : <Crown className="h-4 w-4" strokeWidth={1.8} />}
                  {isPrime ? "Prime Member" : "Get Prime"}
                </Link>

                {/* Mobile Actions */}
                <div className="grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-2.5">
                  <button
                    onClick={handleChatToggle}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#1d1c19] px-3 text-xs font-bold text-white transition-colors hover:bg-black active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} /> Ask VKart
                  </button>

                  {isAuthenticated ? (
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-[#eee8df] px-3 text-xs font-bold text-[#75483b] transition-colors hover:bg-[#e6ddd2] active:scale-95"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} /> Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
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
      </header>
    </>
  );
};

export default Header;
