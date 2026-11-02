import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MenuIcon, SearchIcon, ShoppingBagIcon } from "@heroicons/react/outline";
import { canAccess } from "../../utils/adminPermissions";
import { ROLE_LABELS } from "../../constants/adminRoles";
import DesktopSearch from "./header/DesktopSearch";
import MobileSearchOverlay from "./header/MobileSearchOverlay";
import NotificationMenu from "./header/NotificationMenu";
import ProfileMenu from "./header/ProfileMenu";

export default function AdminHeader({
  setMobileOpen,
  onLogout,
  adminProfile,
  adminRole,
  permissions,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const adminName = adminProfile?.name || "Admin User";
  const adminEmail = adminProfile?.email || "admin@vkart.com";
  const roleLabel = ROLE_LABELS[adminRole] || "Team Member";
  const canReachSettings = canAccess(adminRole, permissions, "settings", "read");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`
          premium-admin-header
          sticky top-0 w-full
          transition-all duration-300 ease-in-out
          border-b
          z-30
          ${
            isScrolled
              ? "bg-[#fffdf8]/95 backdrop-blur-xl border-black/[0.08]"
              : "bg-[#fffdf8]/90 backdrop-blur-md border-black/[0.07]"
          }
        `}
      >
        <div className="flex h-14 sm:h-[4.5rem] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5 lg:px-7">
          {" "}
          {/* LEFT: Mobile Toggle & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-[#1d1c19] text-white">
                <ShoppingBagIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
              <span className="text-sm font-extrabold tracking-[-0.04em] text-[#1d1c19] sm:text-lg">
                VKart Ops
              </span>
            </Link>
          </div>
          <DesktopSearch />
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="lg:hidden p-1.5 sm:p-2.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Open search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            <NotificationMenu />

            <div className="h-6 sm:h-8 w-px bg-slate-200 hidden sm:block" />

            <ProfileMenu
              adminName={adminName}
              adminEmail={adminEmail}
              adminAvatar={adminProfile?.profileImage}
              roleLabel={roleLabel}
              canReachSettings={canReachSettings}
              onLogout={onLogout}
            />
          </div>
        </div>
      </header>

      {mobileSearchOpen && <MobileSearchOverlay onClose={() => setMobileSearchOpen(false)} />}
    </>
  );
}
