import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Users,
  Zap,
} from "lucide-react";

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
}) {
  const navigate = useNavigate();

  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Products", icon: Package, path: "/admin/products" },
    { name: "Orders", icon: ClipboardList, path: "/admin/orders" },
    { name: "Reviews", icon: Star, path: "/admin/reviews" },
    { name: "Coupons", icon: Tag, path: "/admin/coupons" },
    { name: "Sales", icon: Zap, path: "/admin/sales" },
    { name: "Membership", icon: Sparkles, path: "/admin/membership" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-40 bg-[#1d1c19]/30 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMobileOpen(false)}
        aria-label="Close admin navigation"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside
        className={`premium-admin-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-black/[0.08] bg-[#fffdf8] transition-all duration-300 lg:static ${collapsed ? "w-[4.75rem]" : "w-72"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`relative flex h-[4.5rem] items-center border-b border-black/[0.07] ${collapsed ? "justify-center px-0" : "px-5"}`}>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-3 overflow-hidden whitespace-nowrap text-left"
            aria-label="VKart operations dashboard"
          >
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1d1c19] text-white">
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#fffdf8] bg-[#b56a3f]" />
            </span>
            {!collapsed && (
              <span className="text-lg font-extrabold tracking-[-0.045em] text-[#1d1c19]">
                VKart <span className="font-medium text-[#8b867d]">Ops</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 z-50 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-[#fffdf8] text-[#6f6b62] transition-colors hover:text-[#1d1c19] lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-5" aria-label="Admin navigation">
          {navLinks.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `group relative flex min-h-11 items-center gap-3 rounded-xl text-sm font-bold transition-colors ${collapsed ? "mx-auto w-11 justify-center px-0" : "px-3.5"} ${isActive ? "bg-[#eee8df] text-[#1d1c19]" : "text-[#777269] hover:bg-black/[0.035] hover:text-[#1d1c19]"}`}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[1.15rem] w-[1.15rem] shrink-0 ${isActive ? "text-[#a85d37]" : "text-[#817c73]"}`} strokeWidth={1.7} />
                  {!collapsed && <span className="whitespace-nowrap">{name}</span>}
                  {isActive && !collapsed && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#a85d37]" />}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-full bg-[#1d1c19] px-3 py-1.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-black/[0.07] p-3">
          <button
            type="button"
            onClick={onLogout}
            className={`group flex min-h-11 w-full items-center gap-3 rounded-xl text-sm font-bold text-[#75483b] transition-colors hover:bg-[#eee2dc] ${collapsed ? "justify-center px-0" : "px-3.5"}`}
            aria-label="Sign out of admin"
          >
            <LogOut className="h-[1.15rem] w-[1.15rem] shrink-0" strokeWidth={1.7} />
            {!collapsed && (
              <span className="text-left">
                <span className="block">Sign out</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-[#9a7667]">Admin session</span>
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
