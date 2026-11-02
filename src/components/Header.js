import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Home as HomeIcon, Zap as LightningBoltIcon, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toggleChat } from "../redux/uiSlice";
import AnnouncementBar from "./AnnouncementBar";
import HeaderSearch from "./header/HeaderSearch";
import { OPEN_SEARCH_EVENT } from "../utils/uiEvents";
import { useCategoryCounts } from "./header/CategoriesMenu";
import DesktopNav from "./header/DesktopNav";
import HeaderActions from "./header/HeaderActions";
import MobileDrawer from "./header/MobileDrawer";
import useActiveSale from "./header/useActiveSale";
import useHeaderLogout from "./header/useHeaderLogout";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const cartItems = useSelector((state) => state.cart);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isChatOpen = useSelector((state) => state.ui.isChatOpen);
  const user = useSelector((state) => state.auth.user);
  const wishlistCount = useSelector((state) => state.wishlist).length;
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const isPrime = !!user?.isPrime;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const categoryCounts = useCategoryCounts(isMobileMenuOpen);
  const hasActiveSale = useActiveSale(location.pathname);
  const handleLogout = useHeaderLogout();

  // 1. Handle Scroll styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The mobile tab bar's Search tab asks for the search box to open
  useEffect(() => {
    const open = () => {
      setIsMobileMenuOpen(false);
      setShowSearch(true);
    };
    window.addEventListener(OPEN_SEARCH_EVENT, open);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, open);
  }, []);

  // 2. Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname, location.search]);
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
  if (AUTH_PATHS.includes(location.pathname)) return null;

  const navLinks = [
    { label: "Home", to: "/", icon: HomeIcon },
    ...(hasActiveSale
      ? [{ label: "Sale", to: "/products?sort=discount", icon: LightningBoltIcon }]
      : []),
  ];
  return (
    <>
      <AnnouncementBar />
      <header
        role="banner"
        data-scrolled={scrolled ? "true" : "false"}
        className={`vkart-site-header sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl" : ""
        }`}
      >
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-[4.75rem] items-center justify-between gap-4">
            {/* Left: brand & nav */}
            <div className="flex items-center gap-5 xl:gap-8">
              <Link
                to="/"
                className="group flex items-center gap-2.5 shrink-0"
                aria-label="VKart home"
              >
                <div className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#1d1c19] text-white transition-transform group-hover:-rotate-3 group-hover:scale-95">
                  <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#b66a3c] border-2 border-[#fffdf8]" />
                </div>
                <span className="hidden sm:block text-xl font-extrabold tracking-[-0.05em] text-[#1d1c19]">
                  VKart
                </span>
              </Link>
              <DesktopNav navLinks={navLinks} isActive={isActive} />
            </div>

            <div className="hidden lg:flex flex-1 max-w-md mx-2 xl:mx-4">
              <HeaderSearch variant="desktop" />
            </div>

            <div className="flex items-center gap-1.5 xl:gap-3 shrink-0">
              <HeaderActions
                isPrime={isPrime}
                isAuthenticated={isAuthenticated}
                isChatOpen={isChatOpen}
                pathname={location.pathname}
                wishlistCount={wishlistCount}
                cartCount={cartCount}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                onToggleChat={() => dispatch(toggleChat())}
                onLogout={handleLogout}
              />
            </div>
          </div>

          {/* MOBILE SEARCH BAR (Expandable) */}
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
        <MobileDrawer
          open={isMobileMenuOpen}
          navLinks={navLinks}
          isActive={isActive}
          isAuthenticated={isAuthenticated}
          isPrime={isPrime}
          categoryCounts={categoryCounts}
          onClose={() => setIsMobileMenuOpen(false)}
          onToggleChat={handleChatToggle}
          onLogout={handleLogout}
        />
      </header>
    </>
  );
};

export default Header;
