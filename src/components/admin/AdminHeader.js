import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { showToast } from "../../utils/toast";
import axiosInstance from "../axiosInstance";
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

export default function AdminHeader({ setMobileOpen, onLogout, adminProfile }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/notifications");
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
        // If unreadCount is provided by API use it, otherwise calculate it
        setUnreadCount(response.data.unreadCount ?? response.data.notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (ids = [], markAll = false) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => {
        if (markAll || ids.includes(n._id)) {
          return { ...n, isRead: true };
        }
        return n;
      }));

      // Update unread count immediately for better UX
      if (markAll) {
        setUnreadCount(0);
      } else {
        const markedCount = ids.length;
        setUnreadCount(prev => Math.max(0, prev - markedCount));
      }

      const payload = markAll ? { all: true } : { ids };
      await axiosInstance.put("/api/admin/notifications/read", payload);

      // Optionally refetch to ensure sync, but optimistic update is usually enough
      // fetchNotifications(); 

    } catch (error) {
      console.error("Failed to mark notifications read", error);
      // Revert if needed, but for notifications it's usually low risk
    }
  };

  const handleNotificationClick = async (notification) => {
    // 1. Mark as read
    if (!notification.isRead) {
      await markAsRead([notification._id]);
    }

    // 2. Navigate based on type
    setNotificationsOpen(false);
    switch (notification.type) {
      case "order":
        navigate("/admin/orders");
        break;
      case "user":
        navigate("/admin/customers");
        break;
      case "alert":
        navigate("/admin/products");
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
    fetchNotifications();

    const socketUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      socket.emit("join_admin");
    });

    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const msg = notification.message || "New activity detected";
      showToast(`🔔 ${msg}`, "success");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

    if (titleUpper.includes("ORDER") || type === "order") return <ShoppingBagIcon className="h-5 w-5 text-emerald-500" />;
    if (titleUpper.includes("ALERT") || type === "alert") return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    if (titleUpper.includes("USER") || type === "user") return <UserAddIcon className="h-5 w-5 text-blue-500" />;

    // More specific checks
    if (titleUpper.includes("STOCK")) return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
    if (titleUpper.includes("PAYMENT")) return <ShoppingBagIcon className="h-5 w-5 text-purple-500" />;

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
          sticky top-0 w-full
          transition-all duration-300 ease-in-out
          border-b
          z-30
          ${isScrolled
            ? "bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm"
            : "bg-white/80 backdrop-blur-md border-slate-100"
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
                    bg-slate-100 hover:bg-slate-50 focus:bg-white
                    text-slate-900 placeholder-slate-400
                    ring-1 ring-slate-200/50 focus:ring-2 focus:ring-orange-500/20
                    shadow-sm focus:shadow-lg transition-all duration-200 
                    text-sm font-medium outline-none
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
              className="lg:hidden p-2 sm:p-2.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open search"
            >
              <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`
                  relative p-2 sm:p-2.5 rounded-full transition-all group min-w-[44px] min-h-[44px] flex items-center justify-center
                  ${notificationsOpen ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
                `}
                aria-label="Notifications"
              >
                <BellIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${notificationsOpen ? "fill-current" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 sm:top-2.5 sm:right-3 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-orange-500 ring-2 ring-white"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 sm:mt-3 w-80 sm:w-96 bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
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
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors"
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
                                {item.title}
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
                    ? "bg-white border-orange-200 ring-2 sm:ring-4 ring-orange-50"
                    : "bg-white border-slate-200 hover:border-orange-200 hover:shadow-sm"
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
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
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
                <div className="absolute right-0 mt-2 sm:mt-3 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
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