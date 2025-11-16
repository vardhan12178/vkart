import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ShoppingCartIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  HomeIcon,
  SparklesIcon,
} from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "./axiosInstance";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hdrRef = useRef(null);
  const [menuTop, setMenuTop] = useState(66);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  // Scroll glow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dynamic height for mobile dropdown
  useEffect(() => {
    const updateTop = () => {
      if (hdrRef.current) {
        const rect = hdrRef.current.getBoundingClientRect();
        setMenuTop(rect.height);
      }
    };
    updateTop();
    window.addEventListener("resize", updateTop);
    return () => window.removeEventListener("resize", updateTop);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
  try {
    await axios.post("/api/logout", {}, { withCredentials: true });
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    navigate("/", { replace: true }); // send to Home
  }
};


  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
if (authPaths.includes(location.pathname)) return null;

  const nav = [
    { label: "Home", to: "/", icon: HomeIcon },
    { label: "Products", to: "/products" },
    { label: "Profile", to: "/profile", icon: UserIcon },
    { label: "Cart", to: "/cart", icon: ShoppingCartIcon },
  ];

  return (
    <header
      ref={hdrRef}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-gradient-to-r from-[#0a0a0a]/95 via-[#111]/90 to-[#0a0a0a]/95 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
          : "bg-gradient-to-r from-[#0a0a0a]/80 via-[#111]/75 to-[#0a0a0a]/80 ring-1 ring-white/5"
      }`}
    >
      {/* top brand line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2">
            <motion.span
              whileHover={{ scale: 0.93 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg"
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </motion.span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              VKart
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md"
                      : "text-zinc-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.label}
                  {item.to === "/cart" && cartCount > 0 && (
                    <motion.span
                      layout
                      className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              );
            })}

            {/* Ask AI dropdown */}
            <div className="relative">
              <button
                onClick={() => setAiMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-orange-400 transition hover:text-white hover:bg-white/10"
              >
                <SparklesIcon className="h-5 w-5" />
                Ask AI
              </button>

              <AnimatePresence>
                {aiMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900/95 ring-1 ring-white/10 shadow-lg backdrop-blur-md p-3 space-y-1"
                  >
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10">
                      🧠 Smart Product Recommender
                    </button>
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10">
                      💰 Cart Value Insights
                    </button>
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10">
                      🔍 Find Similar Items
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogoutIcon className="h-5 w-5" />
              Logout
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              to="/cart"
              className="relative rounded-lg p-2 text-white hover:bg-white/10"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.15rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow ring-2 ring-zinc-900">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="rounded-lg p-2 text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-7 w-7" />
              ) : (
                <MenuIcon className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 z-40 bg-zinc-950/95 ring-1 ring-white/10 backdrop-blur-md"
            style={{ top: menuTop }}
          >
            <ul className="px-4 py-4 space-y-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                        active
                          ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white"
                          : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      {item.label}
                      {item.to === "/cart" && cartCount > 0 && (
                        <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogoutIcon className="h-5 w-5" />
                  Logout
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
