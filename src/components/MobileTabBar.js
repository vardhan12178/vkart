import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, LayoutGrid, Search, ShoppingBag, UserRound } from "lucide-react";
import { OPEN_SEARCH_EVENT } from "../utils/uiEvents";

// Pages where a tab bar would get in the way: the product page and cart have their own sticky buy bars,
// sign-in and order confirmation are focused flows, and admin has its own navigation.
const HIDDEN_ON = [/^\/admin/, /^\/products\/[^/]+/, /^\/cart/, /^\/order-success/, /^\/(login|register|forgot-password|reset-password|verify-email)/];
export const showsTabBar = (pathname) => !HIDDEN_ON.some((re) => re.test(pathname));

const itemClass = ({ isActive }) =>
  `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${isActive ? "text-ink" : "text-muted-light"}`;

// Bottom navigation on phones. A spacer of the same height keeps the footer from sitting underneath it.
export default function MobileTabBar() {
  const { pathname } = useLocation();
  const cartCount = useSelector((s) => s.cart.reduce((n, it) => n + it.quantity, 0));
  const signedIn = useSelector((s) => s.auth.isAuthenticated);
  if (!showsTabBar(pathname)) return null;

  const openSearch = () => {
    window.scrollTo({ top: 0 });
    window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
  };

  return (
    <>
      <div aria-hidden="true" className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden" />
      <nav aria-label="Mobile navigation"
        className="mobile-tabbar fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <NavLink to="/" end className={itemClass}>
          {({ isActive }) => <><Home className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} />Home</>}
        </NavLink>
        <NavLink to="/products" end className={itemClass}>
          {({ isActive }) => <><LayoutGrid className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} />Shop</>}
        </NavLink>
        <button type="button" onClick={openSearch} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-muted-light">
          <Search className="h-5 w-5" strokeWidth={1.7} />Search
        </button>
        <NavLink to="/cart" aria-label={`Bag${cartCount ? `, ${cartCount} items` : ""}`} className={itemClass}>
          {({ isActive }) => (
            <>
              <span className="relative">
                <ShoppingBag className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">{cartCount}</span>
                )}
              </span>
              Bag
            </>
          )}
        </NavLink>
        <NavLink to={signedIn ? "/profile" : "/login"} className={itemClass}>
          {({ isActive }) => <><UserRound className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} />{signedIn ? "Account" : "Sign in"}</>}
        </NavLink>
      </nav>
    </>
  );
}
