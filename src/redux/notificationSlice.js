import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload.notifications || [];
            state.unreadCount =
                action.payload.unreadCount ??
                state.notifications.filter((n) => !n.isRead).length;
            state.isLoading = false;
        },
        addNotification: (state, action) => {
            // Add new notification at the beginning
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        markAsRead: (state, action) => {
            const { ids, all } = action.payload;
            if (all) {
                state.notifications = state.notifications.map((n) => ({
                    ...n,
                    isRead: true,
                }));
                state.unreadCount = 0;
            } else if (ids?.length) {
                state.notifications = state.notifications.map((n) =>
                    ids.includes(n._id) ? { ...n, isRead: true } : n
                );
                state.unreadCount = Math.max(0, state.unreadCount - ids.length);
            }
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setNotifications,
    addNotification,
    markAsRead,
    clearNotifications,
    setLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;
