import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { showToast } from "../../../utils/toast";
import axiosInstance from "../../axiosInstance";
import { getSocketBaseUrl, normalizeNotification } from "../../../utils/notificationHelpers";
import { qk } from "../../../query/queryKeys";

const ROUTES = {
  order: "/admin/orders",
  user: "/admin/users",
  alert: "/admin/catalog",
  return: "/admin/orders",
  refund: "/admin/orders",
  system: "/admin/settings",
};

export default function useAdminNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  // Marks as read, closes the menu (via onDone) and opens the related page
  const openNotification = async (notification, onDone) => {
    if (!notification.isRead) await markAsRead([notification._id]);
    onDone?.();
    if (notification.link) {
      navigate(notification.link);
      return;
    }
    const route = ROUTES[notification.type];
    if (route) navigate(route);
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

  return {
    notifications,
    unreadCount,
    refetch: () => notificationsQuery.refetch(),
    markAsRead,
    openNotification,
  };
}
