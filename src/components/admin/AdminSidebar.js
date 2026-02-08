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
    ShoppingCartIcon,
    StarIcon,
    TagIcon,
    LightningBoltIcon,
    SparklesIcon
} from "@heroicons/react/outline";

export default function AdminSidebar({
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    onLogout,
}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout?.();
    };

    const navLinks = [
        { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
        { name: "Products", icon: ShoppingBagIcon, path: "/admin/products" },
        { name: "Orders", icon: ClipboardListIcon, path: "/admin/orders" },
        { name: "Reviews", icon: StarIcon, path: "/admin/reviews" },
        { name: "Coupons", icon: TagIcon, path: "/admin/coupons" },
        { name: "Sales", icon: LightningBoltIcon, path: "/admin/sales" },
        { name: "Membership", icon: SparklesIcon, path: "/admin/membership" },
        { name: "Users", icon: UsersIcon, path: "/admin/users" },
        { name: "Settings", icon: CogIcon, path: "/admin/settings" },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-slate-200 shadow-2xl lg:shadow-none
          flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          ${collapsed ? "w-20" : "w-72"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* --- HEADER --- */}
                <div className={`h-20 flex items-center border-b border-slate-100/80 relative transition-all duration-300 ${collapsed ? "justify-center px-0" : "px-6"}`}>

                    {/* Logo Area */}
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap pt-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-transform hover:scale-95 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                            <ShoppingCartIcon className="h-5 w-5" />
                            {/* Accent Dot */}
                            <div className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
                        </div>

                        <span
                            className={`font-bold text-xl text-slate-900 tracking-tight transition-all duration-300 ${collapsed ? "opacity-0 w-0 hidden" : "opacity-100 delay-100"
                                }`}
                        >
                            VKart<span className="text-slate-400 font-normal">.Admin</span>
                        </span>
                    </div>

                    {/* Collapse Toggle (Desktop) */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 shadow-sm transition-all hidden lg:flex z-50 hover:scale-110"
                    >
                        {collapsed ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronLeftIcon className="h-3.5 w-3.5" />}
                    </button>
                </div>

                {/* --- NAVIGATION --- */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
                    {navLinks.map(({ name, icon: Icon, path }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `
                relative flex items-center gap-3 py-3 rounded-xl transition-all duration-300 group font-medium
                ${collapsed ? "justify-center px-0 w-12 mx-auto" : "px-4"}
                ${isActive
                                    ? collapsed
                                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30" // Collapsed Active
                                        : "bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 shadow-sm ring-1 ring-orange-100/50" // Open Active
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }
              `
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        className={`shrink-0 transition-colors duration-200 ${collapsed ? "h-7 w-7" : "h-6 w-6"} ${isActive
                                            ? collapsed ? "text-white" : "text-orange-600"
                                            : "text-slate-500 group-hover:text-slate-800"
                                            }`}
                                    />

                                    {/* Label (Only visible when open) */}
                                    <span
                                        className={`whitespace-nowrap text-sm transition-all duration-300 ${collapsed ? "opacity-0 w-0 hidden" : "opacity-100 delay-75"
                                            }`}
                                    >
                                        {name}
                                    </span>

                                    {/* Open State: Right Indicator Strip */}
                                    {isActive && !collapsed && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-orange-500" />
                                    )}

                                    {/* Collapsed State: Hover Tooltip */}
                                    {collapsed && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                                            {name}
                                            {/* Tiny Arrow pointing left */}
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* --- USER / LOGOUT --- */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={handleLogout}
                        className={`
              flex items-center gap-3 w-full p-2 rounded-xl transition-all duration-200
              hover:bg-white hover:shadow-md hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 group
              ${collapsed ? "justify-center" : ""}
            `}
                    >
                        <div className={`
                shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 
                group-hover:text-red-600 group-hover:border-red-200 transition-colors shadow-sm
                ${collapsed ? "w-10 h-10" : "w-9 h-9"}
            `}>
                            <LogoutIcon className={`${collapsed ? "h-6 w-6" : "h-5 w-5"} transition-all`} />
                        </div>

                        {!collapsed && (
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900">Sign Out</p>
                                <p className="text-[10px] text-slate-400 truncate">Admin Session</p>
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
