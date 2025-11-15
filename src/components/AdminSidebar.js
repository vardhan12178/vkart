import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardListIcon,
  UsersIcon,
  CogIcon,
  LogoutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline";

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("admin_token");
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      onLogout?.();
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
    { name: "Products", icon: ShoppingBagIcon, path: "/admin/products" },
    { name: "Orders", icon: ClipboardListIcon, path: "/admin/orders" },
    { name: "Users", icon: UsersIcon, path: "/admin/users" },
    { name: "Settings", icon: CogIcon, path: "/admin/settings" },
  ];

  return (
    <>
      {/* Dark Overlay (Mobile) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static left-0 top-0 z-50 h-full
          bg-white border-r border-gray-200 shadow-sm
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top bar – only used for desktop collapse control */}
        <div className="h-16 flex items-center justify-end px-3 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Section label */}
        {!collapsed && (
          <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Main
          </p>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-5 space-y-1 overflow-y-auto">
          {navLinks.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) => {
                const base =
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 border-l-4";
                const active =
                  "bg-orange-50 text-orange-600 shadow-inner border-orange-500";
                const inactive =
                  "text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-transparent";

                return `${base} ${isActive ? active : inactive}`;
              }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              font-medium text-sm text-gray-700
              hover:text-orange-600 hover:bg-orange-50
              transition-all duration-150 border-l-4 border-transparent
            "
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
