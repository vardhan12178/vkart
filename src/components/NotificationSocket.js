import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { addLiveNotification, clearNotifications } from "../query/useUserNotifications";
import { showToast } from "../utils/toast";
import { getSocketBaseUrl, normalizeNotification } from "../utils/notificationHelpers";

const NotificationSocket = () => {
    const queryClient = useQueryClient();
    const socketRef = useRef(null);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated || !user?._id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                clearNotifications(queryClient);
            }
            return;
        }

        const socket = io(getSocketBaseUrl(), {
            path: "/socket.io",
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join_user", String(user._id));
        });

        socket.on("user_notification", (notification) => {
            const nextNotification = normalizeNotification(notification);
            addLiveNotification(queryClient, nextNotification);

            const label = getNotificationLabel(nextNotification.status || nextNotification.type);
            showToast(`${label} ${nextNotification.message || nextNotification.title}`, "success");
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient, isAuthenticated, user?._id]);

    return null;
};

const getNotificationLabel = (statusOrType) => {
    switch (statusOrType) {
        case "CONFIRMED":
            return "[Confirmed]";
        case "SHIPPED":
            return "[Shipped]";
        case "OUT_FOR_DELIVERY":
            return "[Out for delivery]";
        case "DELIVERED":
            return "[Delivered]";
        case "CANCELLED":
            return "[Cancelled]";
        case "order":
            return "[Order]";
        default:
            return "[Alert]";
    }
};

export default NotificationSocket;
