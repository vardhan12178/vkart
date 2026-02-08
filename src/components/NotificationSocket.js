import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { addNotification, clearNotifications } from "../redux/notificationSlice";
import { showToast } from "../utils/toast";

/**
 * NotificationSocket - Invisible component that handles real-time socket connection
 * for user notifications. Mounts once globally in App.js.
 */
const NotificationSocket = () => {
    const dispatch = useDispatch();
    const socketRef = useRef(null);

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Only connect if authenticated and we have a user ID
        if (!isAuthenticated || !user?._id) {
            // Disconnect if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                dispatch(clearNotifications());
            }
            return;
        }

        // Connect to socket server
        const socketUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            // Join user-specific notification room
            socket.emit("join_user", user._id);
        });

        // Listen for user notifications
        socket.on("user_notification", (notification) => {
            // Add to Redux store
            dispatch(addNotification(notification));

            // Show toast notification
            const emoji = getNotificationEmoji(notification.status || notification.type);
            showToast(`${emoji} ${notification.message || notification.title}`, "success");
        });

        socket.on("disconnect", () => {
            console.log("Notification socket disconnected");
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });

        // Cleanup on unmount or auth change
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isAuthenticated, user?._id, dispatch]);

    return null; // Invisible component
};

/**
 * Get emoji for notification based on status/type
 */
const getNotificationEmoji = (statusOrType) => {
    switch (statusOrType) {
        case "CONFIRMED":
            return "✅";
        case "SHIPPED":
            return "📦";
        case "OUT_FOR_DELIVERY":
            return "🚚";
        case "DELIVERED":
            return "🎉";
        case "CANCELLED":
            return "❌";
        case "order":
            return "🛒";
        default:
            return "🔔";
    }
};

export default NotificationSocket;
