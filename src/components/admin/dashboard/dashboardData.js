export const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
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

export const stageLabels = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const stageColors = {
  PLACED: "bg-slate-100 text-slate-600 border-slate-200",
  CONFIRMED: "bg-[#ece8df] text-[#5f5a52] border-black/10",
  PROCESSING: "bg-[#f0e5db] text-[#8b5437] border-[#b56a3f]/15",
  PACKED: "bg-[#e9e5dd] text-[#665f55] border-black/10",
  SHIPPED: "bg-[#e8e4dc] text-[#655e54] border-black/10",
  OUT_FOR_DELIVERY: "bg-[#efe2d8] text-[#8b5437] border-[#b56a3f]/15",
  DELIVERED: "bg-[#e5e8df] text-[#59634f] border-[#59634f]/15",
  CANCELLED: "bg-[#eee2dc] text-[#75483b] border-[#75483b]/15",
};

export const rangeDays = (timeRange) => (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);

export const fadeInClass = (delay) =>
  `animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-${delay}`;

export function filterByRange(orders, timeRange) {
  if (!orders.length) return [];
  const now = new Date();
  const cutoff = new Date(now.setDate(now.getDate() - rangeDays(timeRange)));
  return orders.filter((o) => new Date(o.createdAt) >= cutoff);
}

export function computeStats(sourceData) {
  if (!sourceData.length)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      activeCustomers: 0,
      thisMonthOrders: 0,
    };

  let totalRevenue = 0;
  const customerSet = new Set();
  const now = new Date();
  const thisMonth = now.getMonth();
  let thisMonthOrders = 0;

  for (const o of sourceData) {
    const total = Number(o.totalPrice || 0);
    totalRevenue += total;
    const created = o.createdAt ? new Date(o.createdAt) : null;
    if (
      created &&
      created.getMonth() === thisMonth &&
      created.getFullYear() === now.getFullYear()
    ) {
      thisMonthOrders += 1;
    }
    if (o.userId) customerSet.add(String(o.userId));
    else if (o.customer?.email) customerSet.add(o.customer.email.toLowerCase());
  }

  return {
    totalRevenue,
    totalOrders: sourceData.length,
    avgOrderValue: sourceData.length ? totalRevenue / sourceData.length : 0,
    activeCustomers: customerSet.size,
    thisMonthOrders,
  };
}

export function stageSeries(filteredOrders) {
  const counts = {};
  STAGES.forEach((s) => (counts[s] = 0));
  filteredOrders.forEach((o) => {
    const s = (o.stage || "").toUpperCase();
    if (counts[s] != null) counts[s] += 1;
  });

  const colors = [
    "#cbd5e1",
    "#93c5fd",
    "#fcd34d",
    "#c084fc",
    "#818cf8",
    "#fb923c",
    "#34d399",
    "#f87171",
  ];
  return STAGES.map((s, idx) => ({
    stage: stageLabels[s],
    key: s,
    count: counts[s] || 0,
    color: colors[idx],
  }));
}

export function revenueByDay(filteredOrders, timeRange) {
  const map = new Map();
  const now = new Date();
  const days = rangeDays(timeRange);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, {
      dateKey: key,
      label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      revenue: 0,
    });
  }

  filteredOrders.forEach((o) => {
    if (!o.createdAt) return;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (map.has(key)) map.get(key).revenue += Number(o.totalPrice || 0);
  });

  return Array.from(map.values());
}

export function topProductsOf(filteredOrders) {
  const agg = new Map();
  for (const o of filteredOrders) {
    (o.products || []).forEach((p) => {
      const name = p.name || "Unknown";
      const prev = agg.get(name) || { name, qty: 0, revenue: 0, image: p.image || "" };
      prev.qty += Number(p.quantity || 0);
      prev.revenue +=
        p.lineTotal != null ? Number(p.lineTotal) : Number(p.price || 0) * Number(p.quantity || 0);
      if (
        (!prev.image || prev.image.includes("fakestore")) &&
        p.image &&
        !p.image.includes("fakestore")
      ) {
        prev.image = p.image;
      }
      agg.set(name, prev);
    });
  }
  return Array.from(agg.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function recentOrdersOf(orders) {
  return [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 10);
}

export function greetingNow() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}
