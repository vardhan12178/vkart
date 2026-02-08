import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BellIcon, ShoppingBagIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "./axiosInstance";
import { setNotifications, markAsRead, addNotification } from "../redux/notificationSlice";
import { showToast } from "../utils/toast";

const NotificationBell = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

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
                dispatch(setNotifications({
                    notifications: response.data.notifications || [],
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
            return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;

        if (textStart === "SHIPPED" || titleUpper.includes("SHIPPED"))
            return <TruckIcon className="h-5 w-5 text-indigo-500" />;

        if (textStart === "OUT_FOR_DELIVERY" || titleUpper.includes("OUT FOR DELIVERY"))
            return <TruckIcon className="h-5 w-5 text-orange-500" />;

        if (textStart === "DELIVERED" || titleUpper.includes("DELIVERED"))
            return <CheckCircleIcon className="h-5 w-5 text-green-600" />;

        if (textStart === "CANCELLED" || titleUpper.includes("CANCELLED"))
            return <XCircleIcon className="h-5 w-5 text-red-500" />;

        if (type === "order" || titleUpper.includes("ORDER"))
            return <ShoppingBagIcon className="h-5 w-5 text-orange-500" />;

        return <BellIcon className="h-5 w-5 text-gray-400" />;
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
          relative p-2.5 rounded-full transition-all group
          ${isOpen
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }
        `}
                aria-label="Notifications"
            >
                <BellIcon className={`h-6 w-6 ${isOpen ? "fill-current" : ""}`} />

                {/* Unread Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5"
                        >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 ring-2 ring-white" />
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
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 py-2 z-50 origin-top-right"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {unreadCount > 0
                                        ? `You have ${unreadCount} new updates`
                                        : "Recent updates & alerts"
                                    }
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => handleMarkAsRead([], true)}
                                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List with Custom Scrollbar */}
                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {notifications.length > 0 ? (
                                notifications.map((item) => (
                                    <div
                                        key={item._id || item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`
                      px-5 py-3 hover:bg-gray-50 transition-colors flex gap-4 border-b border-gray-50 last:border-0 cursor-pointer
                      ${!item.isRead ? "bg-orange-50/30" : ""}
                    `}
                                    >
                                        {/* Icon */}
                                        <div className={`
                      mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                      ${!item.isRead ? "bg-white shadow-sm ring-1 ring-gray-100" : "bg-gray-50"}
                    `}>
                                            {getNotificationIcon(item.type, item.status, item.title)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${!item.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                                    {item.title}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {getTimeAgo(item.createdAt || Date.now())}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                                        </div>

                                        {/* Unread Dot */}
                                        {!item.isRead && (
                                            <div className="flex-shrink-0 self-center">
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    <BellIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                    <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-50 pt-2 pb-1 px-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate("/orders");
                                    }}
                                    className="w-full py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
