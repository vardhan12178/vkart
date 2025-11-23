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
  CubeIcon,
  SearchIcon
} from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "./axiosInstance";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const loggedIn = isLoggedIn || !!localStorage.getItem("auth_token");
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const aiRef = useRef(null);

  // --- Effects ---

  // 1. Handle Scroll styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2. Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setAiMenuOpen(false);
  }, [location.pathname]);

  // 3. Close AI menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiRef.current && !aiRef.current.contains(event.target)) {
        setAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_token");
      setIsLoggedIn(false);
      navigate("/", { replace: true });
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Hide header on auth pages
  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (authPaths.includes(location.pathname)) return null;

  const navLinks = [
    { label: "Home", to: "/", icon: HomeIcon },
    { label: "Collection", to: "/products", icon: CubeIcon },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Premium Gradient Top Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* --- LEFT: BRAND --- */}
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg shadow-gray-900/20 transition-transform group-hover:scale-95">
                <ShoppingCartIcon className="h-5 w-5" />
                {/* Decorative dot */}
                <div className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 rounded-full bg-orange-500 border-2 border-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                VKart
              </span>
            </Link>

            {/* Desktop Nav Links (Left Aligned) */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      active
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* 1. Ask AI Dropdown */}
            {/* <div className="relative hidden sm:block" ref={aiRef}>
              <button
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  aiMenuOpen 
                    ? "bg-orange-50 border-orange-200 text-orange-600" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                <SparklesIcon className={`h-4 w-4 ${aiMenuOpen ? "animate-pulse" : ""}`} />
                <span className="text-sm font-bold">Ask AI</span>
              </button>

              <AnimatePresence>
                {aiMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 rounded-2xl bg-white shadow-xl shadow-orange-500/10 ring-1 ring-black/5 p-2 z-50"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl mb-2">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">AI Assistant</p>
                        <p className="text-[10px] text-orange-600 mt-0.5">What can I help you find?</p>
                    </div>
                    <div className="space-y-1">
                        {['Gift Ideas', 'Trending Tech', 'Under ₹5000'].map((txt) => (
                            <button key={txt} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors flex items-center gap-2">
                                <SearchIcon className="w-3.5 h-3.5 text-gray-400" /> {txt}
                            </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div> */}

            {/* 2. Cart Icon */}
            <Link
              to="/cart"
              className="relative group p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* 3. Profile / Auth */}
            {loggedIn ? (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200">
                 <Link to="/profile" className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
                    <UserIcon className="h-6 w-6" />
                 </Link>
                 <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Logout"
                 >
                    <LogoutIcon className="h-6 w-6" />
                 </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-900/20 transition-all hover:bg-black hover:shadow-gray-900/30 hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}

            {/* 4. Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-6 space-y-4">
              
              {/* Mobile Nav Links */}
              <div className="space-y-1">
                {navLinks.map((item) => {
                    const active = isActive(item.to);
                    const Icon = item.icon;
                    return (
                        <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            active 
                            ? "bg-gray-100 text-gray-900" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        >
                        <Icon className="h-5 w-5" />
                        {item.label}
                        </Link>
                    );
                })}
                <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive("/profile") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                    <UserIcon className="h-5 w-5" />
                    Profile
                </Link>
              </div>

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => { setIsMobileMenuOpen(false); setAiMenuOpen(true); }} // Note: In real mobile app, better to navigate to a dedicated AI page or modal
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-50 text-orange-700 text-sm font-bold border border-orange-100"
                 >
                    <SparklesIcon className="h-4 w-4" /> Ask AI
                 </button>
                 
                 {loggedIn ? (
                    <button
                        onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100"
                    >
                        <LogoutIcon className="h-4 w-4" /> Logout
                    </button>
                 ) : (
                    <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg"
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
  );
};

export default Header;