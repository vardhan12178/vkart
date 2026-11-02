export const STAGES = [
  "ALL",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export const PAGE_SIZE = 10;

export const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const orderLabel = (o) => `#${o.orderId || o._id.slice(-6).toUpperCase()}`;

export function sortOrders(list, { key, direction }) {
  return [...list].sort((a, b) => {
    let va = a[key];
    let vb = b[key];

    if (key === "customer") {
      va = (a.customer?.name || "").toLowerCase();
      vb = (b.customer?.name || "").toLowerCase();
    } else if (key === "totalPrice") {
      va = Number(a.totalPrice);
      vb = Number(b.totalPrice);
    } else if (key === "createdAt") {
      va = new Date(a.createdAt).getTime();
      vb = new Date(b.createdAt).getTime();
    } else if (typeof va === "string") {
      va = va.toLowerCase();
      vb = vb.toLowerCase();
    }

    // Pending return requests float to the top
    const aReturn = a.returnStatus === "REQUESTED" ? 1 : 0;
    const bReturn = b.returnStatus === "REQUESTED" ? 1 : 0;
    if (aReturn !== bReturn) return bReturn - aReturn;

    if (va < vb) return direction === "asc" ? -1 : 1;
    if (va > vb) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
