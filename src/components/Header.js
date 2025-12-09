import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ShoppingCartIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  SparklesIcon,
  SearchIcon,
  CubeIcon,
  HomeIcon,
} from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "./axiosInstance";
import { logout } from "../redux/authSlice";
import { toggleChat } from "../redux/uiSlice";
import AnnouncementBar from "./AnnouncementBar";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Use Redux state
  const cartItems = useSelector((state) => state.cart);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isChatOpen = useSelector((state) => state.ui.isChatOpen);

  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // --- Effects ---

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
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logout());
      navigate("/", { replace: true });
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleChatToggle = () => {
    setIsMobileMenuOpen(false);
    dispatch(toggleChat());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchInput)}`);
      setShowSearch(false);
    }
  };

  // Hide header on auth pages
  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (authPaths.includes(location.pathname)) return null;

  const navLinks = [
    { label: "Home", to: "/", icon: HomeIcon },
    { label: "Collection", to: "/products", icon: CubeIcon },
  ];

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50"
          : "bg-white/50 backdrop-blur-md border-b border-white/20"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">

            {/* --- LEFT: BRAND & NAV --- */}
            <div className="flex items-center gap-8">
              <Link to="/" className="group flex items-center gap-2.5 shrink-0">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg shadow-gray-900/20 transition-transform group-hover:scale-95">
                  <ShoppingCartIcon className="h-5 w-5" />
                  {/* Decorative dot */}
                  <div className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 rounded-full bg-orange-500 border-2 border-white" />
                </div>
                <span className="hidden sm:block text-xl font-black tracking-tight text-gray-900">
                  VKart
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="relative px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                      {item.label}
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-1/2 ${active ? "w-1/2" : ""}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* --- CENTER: SEARCH (Desktop) --- */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-100 pl-10 pr-4 py-2.5 text-sm font-medium focus:border-gray-900 focus:bg-white focus:ring-0 transition-all placeholder:text-gray-400"
                />
              </form>
            </div>


            {/* --- RIGHT: ACTIONS --- */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SearchIcon className="h-6 w-6" />
              </button>

              {/* Ask AI Button */}
              <button
                onClick={() => dispatch(toggleChat())}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${isChatOpen
                  ? "bg-gray-900 border-gray-900 text-white shadow-md"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:shadow-sm"
                  }`}
              >
                <SparklesIcon className={`h-4 w-4 ${isChatOpen ? "text-amber-400" : ""}`} />
                <span className="text-xs font-bold uppercase tracking-wide">Ask AI</span>
              </button>

              {/* Cart Icon */}
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
                      className="absolute top-1 right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Profile / Auth */}
              {isAuthenticated ? (
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

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
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
                className="md:hidden overflow-hidden pb-4"
              >
                <form onSubmit={handleSearch} className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm font-medium focus:border-gray-900 focus:bg-white focus:ring-0"
                  />
                </form>
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive("/profile")
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <UserIcon className="h-5 w-5" />
                      Profile
                    </Link>
                  )}
                </div>

                {/* Mobile Actions */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleChatToggle}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg"
                  >
                    <SparklesIcon className="h-4 w-4 text-amber-400" /> Ask AI
                  </button>

                  {isAuthenticated ? (
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
    </>
  );
};

export default Header;