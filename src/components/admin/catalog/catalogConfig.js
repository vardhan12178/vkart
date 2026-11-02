export const API = "/api/admin/v2/products";
export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-800 border-amber-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};
export const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active", status: "active" },
  { key: "draft", label: "Draft", status: "draft" },
  { key: "archived", label: "Archived", status: "archived" },
  { key: "low", label: "Low stock", stock: "low" },
  { key: "out", label: "Out of stock", stock: "out" },
];

export const errorText = (err) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || "Something went wrong";
