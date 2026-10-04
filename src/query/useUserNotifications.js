import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../components/axiosInstance";
import { normalizeNotification } from "../utils/notificationHelpers";
import { qk } from "./queryKeys";

const EMPTY = { notifications: [], unreadCount: 0 };
const KEY = qk.profile.notifications;

const withUnread = (notifications) => ({
  notifications,
  unreadCount: notifications.filter((n) => !n.isRead).length,
});

/** The signed-in shopper's notifications (server state, cached by React Query). */
export function useUserNotifications(enabled) {
  return useQuery({
    queryKey: KEY,
    enabled: !!enabled,
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        // __skipAuthRedirect: a 401 here shouldn't bounce the user to /login.
        const res = await axiosInstance.get("/api/user/notifications", { __skipAuthRedirect: true });
        if (!res?.data?.success) return EMPTY;
        const notifications = (res.data.notifications || []).map(normalizeNotification);
        return {
          notifications,
          unreadCount: res.data.unreadCount ?? notifications.filter((n) => !n.isRead).length,
        };
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 401 && status !== 404) console.error("Failed to fetch notifications:", error);
        return EMPTY;
      }
    },
  });
}

/** Mark some (ids) or all notifications read — optimistic, rolled back by refetch on failure. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids = [], all = false }) =>
      axiosInstance.put("/api/user/notifications/read", all ? { all: true } : { ids }, { __skipAuthRedirect: true }),
    onMutate: ({ ids = [], all = false }) => {
      queryClient.setQueryData(KEY, (prev = EMPTY) =>
        withUnread(prev.notifications.map((n) => (all || ids.includes(n._id) ? { ...n, isRead: true } : n)))
      );
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status !== 401 && status !== 404) {
        console.error("Failed to mark notifications as read:", error);
        queryClient.invalidateQueries({ queryKey: KEY });
      }
    },
  });
}

/** Push a live (socket) notification to the top of the cached list. */
export function addLiveNotification(queryClient, notification) {
  queryClient.setQueryData(KEY, (prev = EMPTY) => ({
    notifications: [notification, ...prev.notifications],
    unreadCount: (prev.unreadCount || 0) + (notification.isRead ? 0 : 1),
  }));
}

export function clearNotifications(queryClient) {
  queryClient.removeQueries({ queryKey: KEY });
}
