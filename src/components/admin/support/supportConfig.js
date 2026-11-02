export const TABS = [
  {
    id: "unassigned",
    label: "Unassigned",
    mobileLabel: "New",
    filter: { status: "AWAITING_AGENT" },
  },
  { id: "mine", label: "My Conversations", mobileLabel: "Mine", filter: { mine: "true" } },
  { id: "resolved", label: "Resolved", mobileLabel: "Resolved", filter: { status: "RESOLVED" } },
  { id: "all", label: "All", mobileLabel: "All", filter: {} },
];

export const STATUS_CONFIG = {
  AWAITING_AGENT: {
    label: "Awaiting Agent",
    color: "bg-amber-500",
    text: "text-amber-700 bg-amber-50 border-amber-200/60",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-500",
    text: "text-blue-700 bg-blue-50 border-blue-200/60",
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-500",
    text: "text-emerald-700 bg-emerald-50 border-emerald-200/60",
  },
  CLOSED: {
    label: "Closed",
    color: "bg-slate-400",
    text: "text-slate-600 bg-slate-100 border-slate-200/60",
  },
};
