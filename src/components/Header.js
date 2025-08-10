import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ShoppingCartIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/outline";
import Cookies from "js-cookie";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Header opacity/shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    try {
      Cookies.remove("jwt_token");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
      alert("Failed to log out. Please try again.");
    }
  };

  // Active if current path starts with the nav path (so /products/123 is active)
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  if (!isLoggedIn) return null;

  const nav = [
    { label: "Products", to: "/products" },
    { label: "Profile", to: "/profile" },
    { label: "Cart", to: "/cart", icon: ShoppingCartIcon },
  ];

  return (
    <header
      role="banner"
      className={[
        "sticky top-0 z-50 transition-all",
        // glass background, slightly stronger when scrolled
        scrolled
          ? "bg-white/80 backdrop-blur-md"
          : "bg-white/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur",
        "ring-1 ring-inset ring-gray-200",
        scrolled ? "shadow-[0_8px_20px_-12px_rgba(0,0,0,0.25)]" : "shadow-sm",
      ].join(" ")}
    >
      {/* gradient hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2">
            <span className="relative">
              <ShoppingCartIcon className="h-7 w-7 text-orange-500 transition-transform duration-300 group-hover:-rotate-6" />
              <span className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40 bg-orange-400/30" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                Vkart
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "group relative inline-flex items-center gap-1.5 text-sm font-medium outline-none transition-colors",
                    active
                      ? "text-slate-900"
                      : "text-slate-600 hover:text-slate-900",
                    "focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:rounded-md",
                  ].join(" ")}
                >
                  {Icon ? (
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {item.to === "/cart" && cartCount > 0 && (
                        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow ring-2 ring-white transition-transform motion-safe:group-hover:scale-105">
                          {cartCount}
                        </span>
                      )}
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                  {/* animated underline */}
                  <span
                    className={[
                      "pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full",
                      "bg-gradient-to-r from-orange-500 to-amber-400 transition-transform duration-300",
                      active ? "scale-x-100" : "group-hover:scale-x-100",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              aria-label="Logout"
            >
              <LogoutIcon className="h-5 w-5" />
              Logout
            </button>
          </nav>

          {/* Mobile toggler */}
          <button
            className="relative rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-7 w-7" />
            ) : (
              <>
                <MenuIcon className="h-7 w-7" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/20 transition-opacity md:hidden",
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile sheet */}
      <div
        className={[
          "md:hidden fixed left-0 right-0 top-[66px] z-50 origin-top rounded-b-2xl bg-white shadow-xl ring-1 ring-gray-200 transition-all",
          isMobileMenuOpen
            ? "scale-y-100 opacity-100"
            : "pointer-events-none scale-y-95 opacity-0",
        ].join(" ")}
        style={{ transformOrigin: "top" }}
      >
        <ul className="divide-y divide-gray-100 py-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={[
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium",
                    active
                      ? "bg-orange-50/70 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {Icon ? (
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {item.to === "/cart" && cartCount > 0 && (
                        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow ring-2 ring-white">
                          {cartCount}
                        </span>
                      )}
                    </span>
                  ) : null}
                  <span>{item.label}</span>
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
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogoutIcon className="h-5 w-5" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
