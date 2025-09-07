import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCartIcon, LogoutIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    } catch {}
    setIsLoggedIn(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (!isLoggedIn || authPaths.includes(location.pathname)) return null;

  const nav = [
    { label: "Products", to: "/products" },
    { label: "Profile", to: "/profile" },
    { label: "Cart", to: "/cart", icon: ShoppingCartIcon },
  ];

  return (
    <header
      ref={hdrRef}
      role="banner"
      className={[
        "sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/75 bg-white/95",
        scrolled ? "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]" : "shadow-sm",
        "ring-1 ring-inset ring-gray-200",
        "transition-all duration-300",
      ].join(" ")}
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md transition group-hover:scale-95">
              <ShoppingCartIcon className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">VKart</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "text-white shadow-sm bg-gradient-to-r from-orange-500 to-amber-400"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.label}
                  {item.to === "/cart" && cartCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                  {active && <span className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogoutIcon className="h-5 w-5" />
              Logout
            </button>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <Link to="/cart" className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.15rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            >
              {isMobileMenuOpen ? <XIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      <div className={["md:hidden", isMobileMenuOpen ? "block" : "hidden"].join(" ")}>
        <div className="fixed inset-x-0 z-40 bg-white shadow-xl ring-1 ring-gray-200" style={{ top: menuTop }}>
          <ul className="px-4 py-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={["flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", active ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"].join(" ")}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {item.label}
                    {item.to === "/cart" && cartCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{cartCount}</span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="pt-1">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
              >
                <LogoutIcon className="h-5 w-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
