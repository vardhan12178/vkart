const TITLE_REPLACEMENTS = new Map([
  ["Order Confirmed!", "Order Confirmed"],
  ["Order Shipped!", "Order Shipped"],
  ["Out for Delivery!", "Out for Delivery"],
  ["Order Delivered!", "Order Delivered"],
  ["Order Cancelled!", "Order Cancelled"],
]);

export const normalizeNotificationTitle = (title) => {
  const value = String(title || "").trim();
  if (!value) return "";

  const withoutEmojiSuffix = value.replace(/\s+[^\x00-\x7F]+$/u, "").trim();
  if (TITLE_REPLACEMENTS.has(withoutEmojiSuffix)) {
    return TITLE_REPLACEMENTS.get(withoutEmojiSuffix);
  }

  return withoutEmojiSuffix;
};

export const normalizeNotification = (notification) => {
  if (!notification || typeof notification !== "object") return notification;
  return {
    ...notification,
    title: normalizeNotificationTitle(notification.title),
  };
};

export const getSocketBaseUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return window.location.origin;
    }

    return process.env.REACT_APP_API_BASE_URL || window.location.origin;
  }

  return process.env.REACT_APP_API_BASE_URL || "";
};
