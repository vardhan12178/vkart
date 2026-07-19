import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BellIcon, ShoppingBagIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "./axiosInstance";
import { setNotifications, markAsRead } from "../redux/notificationSlice";
import { normalizeNotification, normalizeNotificationTitle } from "../utils/notificationHelpers";

const NotificationBell = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Fetch notifications on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Use __skipAuthRedirect to prevent 401 from triggering logout
            // (endpoint may not exist on backend yet)
            const response = await axiosInstance.get("/api/user/notifications", {
                __skipAuthRedirect: true
            });
            if (response.data?.success) {
                const notifications = (response.data.notifications || []).map(normalizeNotification);
                dispatch(setNotifications({
                    notifications,
                    unreadCount: response.data.unreadCount,
                }));
            }
        } catch (error) {
            // Silently fail if endpoint doesn't exist yet
            // Don't log 401/404 errors to avoid console spam
            if (error.response?.status !== 401 && error.response?.status !== 404) {
                console.error("Failed to fetch notifications:", error);
            }
        }
    };

    const handleMarkAsRead = async (ids = [], all = false) => {
        try {
            // Optimistic update
            dispatch(markAsRead({ ids, all }));

            const payload = all ? { all: true } : { ids };
            await axiosInstance.put("/api/user/notifications/read", payload, {
                __skipAuthRedirect: true
            });
        } catch (error) {
            // Silently fail if endpoint doesn't exist
            if (error.response?.status !== 401 && error.response?.status !== 404) {
                console.error("Failed to mark notifications as read:", error);
                fetchNotifications();
            }
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            await handleMarkAsRead([notification._id]);
        }

        setIsOpen(false);

        // Navigate based on notification type
        if (notification.type === "order" && notification.orderId) {
            navigate(`/orders?order=${notification.orderId}`);
        } else if (notification.link) {
            navigate(notification.link);
        } else {
            navigate("/orders");
        }
    };

    const getNotificationIcon = (type, status, title = "") => {
        const textStart = (status || "").toUpperCase();
        const titleUpper = (title || "").toUpperCase();

        if (textStart === "CONFIRMED" || titleUpper.includes("CONFIRMED"))
            return <CheckCircleIcon className="h-5 w-5 text-[#59634f]" />;

        if (textStart === "SHIPPED" || titleUpper.includes("SHIPPED"))
            return <TruckIcon className="h-5 w-5 text-[#776c5b]" />;

        if (textStart === "OUT_FOR_DELIVERY" || titleUpper.includes("OUT FOR DELIVERY"))
            return <TruckIcon className="h-5 w-5 text-[#a85d37]" />;

        if (textStart === "DELIVERED" || titleUpper.includes("DELIVERED"))
            return <CheckCircleIcon className="h-5 w-5 text-[#59634f]" />;

        if (textStart === "CANCELLED" || titleUpper.includes("CANCELLED"))
            return <XCircleIcon className="h-5 w-5 text-[#75483b]" />;

        if (type === "order" || titleUpper.includes("ORDER"))
            return <ShoppingBagIcon className="h-5 w-5 text-[#a85d37]" />;

        return <BellIcon className="h-5 w-5 text-[#8b867d]" />;
    };

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

    // Don't render if not authenticated
    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative grid h-10 w-10 place-items-center rounded-full transition-colors group
          ${isOpen
                        ? "bg-[#e9e1d7] text-[#1d1c19]"
                        : "text-[#656159] hover:bg-black/[0.05] hover:text-[#1d1c19]"
                    }
        `}
                aria-label="Notifications"
            >
                <BellIcon className="h-[1.35rem] w-[1.35rem] stroke-[1.6]" />

                {/* Unread Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute right-0.5 top-0.5 flex h-2.5 w-2.5"
                        >
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#a85d37] ring-2 ring-[#fffdf8]" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-50 mt-3 w-[min(23rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-[1.25rem] border border-black/[0.08] bg-[#fffdf8] shadow-[0_24px_70px_rgba(29,28,25,.16)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4">
                            <div>
                                <h3 className="text-sm font-bold text-[#1d1c19]">Updates</h3>
                                <p className="mt-0.5 text-xs text-[#7b766d]">
                                    {unreadCount > 0
                                        ? `You have ${unreadCount} new updates`
                                        : "Recent updates & alerts"
                                    }
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => handleMarkAsRead([], true)}
                                    className="rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-3 py-1.5 text-[10px] font-bold text-[#75462f] transition-colors hover:bg-[#e9dace]"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List with Custom Scrollbar */}
                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((item) => (
                                    <div
                                        key={item._id || item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`
                      flex cursor-pointer gap-4 border-b border-black/[0.055] px-5 py-3.5 transition-colors last:border-0 hover:bg-black/[0.025]
                      ${!item.isRead ? "bg-[#f2ebe2]" : ""}
                    `}
                                    >
                                        {/* Icon */}
                                        <div className={`
                      mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                      ${!item.isRead ? "bg-[#fffdf8] ring-1 ring-black/[0.06]" : "bg-[#eeeae2]"}
                    `}>
                                            {getNotificationIcon(item.type, item.status, item.title)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${!item.isRead ? "font-bold text-[#1d1c19]" : "font-medium text-[#5f5a52]"}`}>
                                                    {normalizeNotificationTitle(item.title)}
                                                </p>
                                                <span className="ml-2 whitespace-nowrap text-[10px] text-[#969086]">
                                                    {getTimeAgo(item.createdAt || Date.now())}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-[#7b766d]">{item.message}</p>
                                        </div>

                                        {/* Unread Dot */}
                                        {!item.isRead && (
                                            <div className="flex-shrink-0 self-center">
                                                <div className="h-2 w-2 rounded-full bg-[#a85d37]" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-[#7b766d]">
                                    <BellIcon className="mx-auto mb-3 h-10 w-10 text-[#bbb4aa]" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                    <p className="mt-1 text-xs text-[#969086]">We'll let you know when something arrives</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-black/[0.07] p-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate("/orders");
                                    }}
                                    className="w-full rounded-full py-2.5 text-xs font-bold text-[#5f5a52] transition-colors hover:bg-black/[0.04]"
                                >
                                    View All Orders
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
