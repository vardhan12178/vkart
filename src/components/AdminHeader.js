import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  LogoutIcon,
  CogIcon,
  UserIcon,
  ShoppingBagIcon,
  XIcon,
} from "@heroicons/react/outline";

export default function AdminHeader({ setMobileOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <>
      <header
        className={`
          sticky top-0 w-full
          transition-all duration-300 ease-in-out
          border-b
          z-30
          ${isScrolled 
            ? "bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm" 
            : "bg-white/50 backdrop-blur-sm border-transparent"
          }
        `}
      >
        <div className="px-3 sm:px-4 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* --- LEFT: Mobile Toggle & Brand --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="font-bold text-base sm:text-lg text-slate-900">VKart</span>
            </Link>
          </div>

          {/* --- CENTER: Desktop Search --- */}
          <div className="hidden lg:flex flex-1 max-w-xl mr-auto">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                className="
                  block w-full pl-11 pr-20 py-2.5 
                  rounded-full border-0 
                  bg-slate-100 text-slate-900 placeholder-slate-500
                  ring-1 ring-transparent
                  focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:shadow-lg
                  transition-all duration-200 text-sm font-medium outline-none
                "
                placeholder="Search orders, products, or customers..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center h-6 px-2 border border-slate-300 rounded text-[10px] font-bold text-slate-500 bg-white">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* --- RIGHT: Actions & Profile --- */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
            
            {/* Mobile Search Button */}
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="lg:hidden p-2 sm:p-2.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open search"
            >
              <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Notification Bell */}
            <button 
              className="relative p-2 sm:p-2.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-2 right-2.5 sm:top-2.5 sm:right-3 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-orange-500 ring-2 ring-white"></span>
              </span>
            </button>

            {/* Divider */}
            <div className="h-6 sm:h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`
                  flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-full border transition-all duration-200
                  ${profileOpen 
                    ? "bg-white border-orange-200 ring-2 sm:ring-4 ring-orange-50" 
                    : "bg-white border-slate-200 hover:border-orange-200 hover:shadow-sm"
                  }
                `}
                aria-label="Profile menu"
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <span className="text-xs font-bold">AD</span>
                </div>
                
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-slate-800 leading-none">Admin User</span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">Super Admin</span>
                </div>
                
                <ChevronDownIcon 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block ${profileOpen ? "rotate-180" : ""}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 sm:mt-3 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl sm:rounded-t-2xl">
                    <p className="text-sm font-bold text-slate-900">Admin Account</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">admin@vkart.com</p>
                  </div>

                  <div className="py-2 px-2">
                    <Link 
                      to="/admin/settings" 
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon className="w-5 h-5 text-slate-400" />
                      My Profile
                    </Link>
                    <Link 
                      to="/admin/settings" 
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <CogIcon className="w-5 h-5 text-slate-400" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 my-1 px-2 pb-1 pt-1">
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogoutIcon className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            ref={mobileSearchRef}
            className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top duration-300"
          >
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  autoFocus
                  type="text"
                  className="
                    block w-full pl-11 pr-4 py-3
                    rounded-xl border border-slate-200
                    bg-slate-50 text-slate-900 placeholder-slate-500
                    focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10
                    transition-all duration-200 text-sm font-medium outline-none
                  "
                  placeholder="Search orders, products, or customers..."
                />
              </div>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close search"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Quick Search</p>
              <button className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Recent orders
              </button>
              <button className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Popular products
              </button>
              <button className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Customer list
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}