import {
  ArchiveIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  RefreshIcon,
  ShieldCheckIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/outline";

export const STAGES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export const TERMINAL_STAGES = ["DELIVERED", "CANCELLED"];

export const stageStyles = {
  PLACED: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: ClipboardCheckIcon,
  },
  CONFIRMED: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    icon: ShieldCheckIcon,
  },
  PROCESSING: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    icon: RefreshIcon,
  },
  PACKED: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: ArchiveIcon,
  },
  SHIPPED: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    icon: TruckIcon,
  },
  OUT_FOR_DELIVERY: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    icon: TruckIcon,
  },
  DELIVERED: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    icon: CheckCircleIcon,
  },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: XCircleIcon },
};

export const stageLabel = (stage) => String(stage || "").replace(/_/g, " ");

export function formatDateTime(isoStr) {
  if (!isoStr) return "-";
  return new Date(isoStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// The stage that normally follows this one, or null at the end of the line.
export function nextStageAfter(stage) {
  const index = STAGES.indexOf(stage);
  if (index === -1 || index === STAGES.length - 1 || stage === "CANCELLED") return null;
  return STAGES[index + 1];
}

// Status history, newest first. Orders without history show their current stage as the start.
export function buildTimeline(order) {
  if (!order) return [];
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  if (history.length === 0 && order.stage) {
    return [
      {
        stage: order.stage,
        date: order.updatedAt || order.createdAt || new Date().toISOString(),
        note: "Initial Status",
      },
    ];
  }
  return history
    .filter((h) => h && h.stage)
    .map((h) => ({ stage: h.stage, date: h.date || order.createdAt, note: h.note || "" }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
