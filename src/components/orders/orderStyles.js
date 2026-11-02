// Stage badge colours
export const stageStyles = {
  PLACED: { bg: "bg-tint", text: "text-ink-soft", dot: "bg-muted", border: "border-line-strong" },
  CONFIRMED: { bg: "bg-tint", text: "text-ink-soft", dot: "bg-ink", border: "border-line-strong" },
  PROCESSING: {
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
    border: "border-accent/30",
  },
  PACKED: { bg: "bg-tint", text: "text-ink-soft", dot: "bg-ink", border: "border-line-strong" },
  SHIPPED: { bg: "bg-tint", text: "text-ink-soft", dot: "bg-ink", border: "border-line-strong" },
  OUT_FOR_DELIVERY: {
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
    border: "border-accent/30",
  },
  DELIVERED: { bg: "bg-ok/10", text: "text-ok", dot: "bg-ok", border: "border-ok/30" },
  CANCELLED: { bg: "bg-alert/10", text: "text-alert", dot: "bg-alert", border: "border-alert/30" },
};

export const apiBase =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : process.env.REACT_APP_API_BASE_URL || "";
