import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { showToast } from "../../utils/toast";
import axiosInstance from "../axiosInstance";
import { getSocketBaseUrl, normalizeNotification, normalizeNotificationTitle } from "../../utils/notificationHelpers";
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
  ExclamationCircleIcon,
  UserAddIcon,
} from "@heroicons/react/outline";
import { qk } from "../../query/queryKeys";

export default function AdminHeader({ setMobileOpen, onLogout, adminProfile }) {
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const navigate = useNavigate();

  // Default Values
  const adminName = adminProfile?.name || "Admin User";
  const adminEmail = adminProfile?.email || "admin@vkart.com";
  const adminAvatar = adminProfile?.profileImage;
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "AD";

  // --- Notification Logic ---

  const notificationsQuery = useQuery({
    queryKey: qk.admin.notifications,
    queryFn: async () => {
      const response = await axiosInstance.get("/api/admin/notifications");
      const notifications = (response.data?.notifications || []).map(normalizeNotification);
      return {
        notifications,
        unreadCount: response.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length,
      };
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (payload) => axiosInstance.put("/api/admin/notifications/read", payload),
    onError: () => {
      notificationsQuery.refetch();
    },
  });

  const notifications = notificationsQuery.data?.notifications || [];
  const unreadCount = notificationsQuery.data?.unreadCount || 0;

  const markAsRead = async (ids = [], markAll = false) => {
    try {
      queryClient.setQueryData(qk.admin.notifications, (prev) => {
        const current = prev || { notifications: [], unreadCount: 0 };
        const updated = current.notifications.map((n) =>
          markAll || ids.includes(n._id) ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });

      const payload = markAll ? { all: true } : { ids };
      await markReadMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Failed to mark notifications read", error);
      notificationsQuery.refetch();
    }
  };

  const handleNotificationClick = async (notification) => {
    // 1. Mark as read
    if (!notification.isRead) {
      await markAsRead([notification._id]);
    }

    // 2. Navigate based on type
    setNotificationsOpen(false);
    if (notification.link) {
      navigate(notification.link);
      return;
    }

    switch (notification.type) {
      case "order":
        navigate("/admin/orders");
        break;
      case "user":
        navigate("/admin/users");
        break;
      case "alert":
        navigate("/admin/products");
        break;
      case "return":
      case "refund":
        navigate("/admin/orders");
        break;
      case "system":
        navigate("/admin/settings");
        break;
      default:
        // Do nothing or go to a generic notifications page
        break;
    }
  };

  // Socket.io
  useEffect(() => {
    const socket = io(getSocketBaseUrl(), {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join_admin");
    });

    socket.on("new_notification", (notification) => {
      const nextNotification = normalizeNotification(notification);
      queryClient.setQueryData(qk.admin.notifications, (prev) => {
        const current = prev || { notifications: [], unreadCount: 0 };
        const nextNotifications = [nextNotification, ...current.notifications];
        return {
          notifications: nextNotifications,
          unreadCount: nextNotifications.filter((n) => !n.isRead).length,
        };
      });

      const msg = nextNotification.message || "New activity detected";
      showToast(`Notification: ${msg}`, "success");
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
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
    onLogout?.();
  };

  // Helper to get icon for notification
  // Helper to get icon for notification
  const getNotificationIcon = (type, title = "") => {
    const titleUpper = (title || "").toUpperCase();

    if (titleUpper.includes("ORDER") || type === "order") return <ShoppingBagIcon className="h-5 w-5 text-[#59634f]" />;
    if (titleUpper.includes("ALERT") || type === "alert") return <ExclamationCircleIcon className="h-5 w-5 text-[#75483b]" />;
    if (titleUpper.includes("USER") || type === "user") return <UserAddIcon className="h-5 w-5 text-[#b56a3f]" />;

    // More specific checks
    if (titleUpper.includes("STOCK")) return <ExclamationCircleIcon className="h-5 w-5 text-[#b56a3f]" />;
    if (titleUpper.includes("PAYMENT")) return <ShoppingBagIcon className="h-5 w-5 text-[#776c5b]" />;

    return <BellIcon className="h-5 w-5 text-slate-400" />;
  };

  // Helper to get friendly time (simple implementation or use library)
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <header
        className={`
          premium-admin-header
          sticky top-0 w-full
          transition-all duration-300 ease-in-out
          border-b
          z-30
          ${isScrolled
            ? "bg-[#fffdf8]/95 backdrop-blur-xl border-black/[0.08]"
            : "bg-[#fffdf8]/90 backdrop-blur-md border-black/[0.07]"
          }
        `}
      >
        <div className="flex h-[4.5rem] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5 lg:px-7">

          {/* --- LEFT: Mobile Toggle & Brand --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1d1c19] text-white">
                <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-base font-extrabold tracking-[-0.04em] text-[#1d1c19] sm:text-lg">VKart Ops</span>
            </Link>
          </div>

          {/* --- CENTER: Desktop Search --- */}
          <div className="mr-auto hidden max-w-lg flex-1 lg:flex">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-[#8b867d] transition-colors group-focus-within:text-[#a85d37]" />
              </div>
              <input
                type="text"
                className="
                    block w-full pl-11 pr-20 py-2.5 
                    rounded-full border-0 
                    bg-[#f1ede5] hover:bg-[#eee9e0] focus:bg-[#fffdf8]
                    text-[#1d1c19] placeholder-[#99948a]
                    ring-1 ring-black/[0.07] focus:ring-[#a85d37]/20
                    transition-all duration-200
                    text-sm font-medium outline-none
                  "
                placeholder="Search the operation"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <kbd className="hidden h-6 items-center rounded-full border border-black/10 bg-[#fffdf8] px-2 text-[10px] font-bold text-[#777269] sm:inline-flex">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* --- RIGHT: Actions & Profile --- */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">

            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="lg:hidden p-2 sm:p-2.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open search"
            >
              <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) notificationsQuery.refetch();
                }}
                className={`
                  relative p-2 sm:p-2.5 rounded-full transition-all group min-w-[44px] min-h-[44px] flex items-center justify-center
                  ${notificationsOpen ? "bg-[#e9e1d7] text-[#1d1c19]" : "text-[#656159] hover:bg-black/[0.05] hover:text-[#1d1c19]"}
                `}
                aria-label="Notifications"
              >
                <BellIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${notificationsOpen ? "fill-current" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 sm:top-2.5 sm:right-3 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a85d37] ring-2 ring-[#fffdf8] sm:h-2.5 sm:w-2.5"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 z-50 mt-3 w-80 origin-top-right overflow-hidden rounded-[1.25rem] border border-black/[0.08] bg-[#fffdf8] shadow-[0_24px_70px_rgba(29,28,25,.16)] animate-in fade-in zoom-in-95 duration-150 sm:w-96">
                  <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {unreadCount > 0
                          ? `You have ${unreadCount} new alerts`
                          : "Recent activity & updates"
                        }
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAsRead([], true)}
                        className="rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-3 py-1.5 text-[10px] font-bold text-[#75462f] transition-colors hover:bg-[#e9dace]"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div
                          key={item._id || item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`
                            px-5 py-3 hover:bg-slate-50 transition-colors flex gap-4 border-b border-slate-50 last:border-0 cursor-pointer
                            ${!item.isRead ? "bg-slate-50/50" : ""}
                          `}
                        >
                          <div className={`mt-1 h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${!item.isRead ? "bg-white shadow-sm ring-1 ring-slate-100" : "bg-slate-100"}`}>
                            {getNotificationIcon(item.type, item.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${!item.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                                {normalizeNotificationTitle(item.title)}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{getTimeAgo(item.createdAt || Date.now())}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.message}</p>
                          </div>
                          {!item.isRead && (
                            <div className="flex-shrink-0 self-center">
                              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <BellIcon className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-medium">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-50 pt-2 pb-1 px-2">
                    <button className="w-full py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 sm:h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`
                  flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-full border transition-all duration-200
                  ${profileOpen
                    ? "bg-[#fffdf8] border-[#a85d37]/25 ring-2 ring-[#a85d37]/8"
                    : "bg-[#fffdf8] border-black/10 hover:border-black/20"
                  }
                `}
                aria-label="Profile menu"
              >
                {adminAvatar ? (
                  <img
                    src={adminAvatar}
                    alt={adminName}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-md ring-2 ring-white"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a85d37] text-white sm:h-9 sm:w-9">
                    <span className="text-xs font-bold">{adminInitials}</span>
                  </div>
                )}

                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-slate-800 leading-none max-w-[100px] truncate">{adminName}</span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">Super Admin</span>
                </div>

                <ChevronDownIcon
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 z-50 mt-3 w-56 origin-top-right overflow-hidden rounded-[1.15rem] border border-black/[0.08] bg-[#fffdf8] py-2 shadow-[0_24px_70px_rgba(29,28,25,.16)] animate-in fade-in zoom-in-95 duration-150 sm:w-64">
                  <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl sm:rounded-t-2xl">
                    <p className="text-sm font-bold text-slate-900">{adminName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{adminEmail}</p>
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
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#75483b] transition-colors hover:bg-[#eee2dc]"
                      aria-label="Sign out of admin"
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
                placeholder="Search the operation"
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
