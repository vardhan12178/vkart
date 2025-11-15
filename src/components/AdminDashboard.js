// src/components/AdminDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axiosInstance";
import {
  TrendingUpIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  RefreshIcon,
  StatusOnlineIcon,
} from "@heroicons/react/outline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

const STAGES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const stageLabels = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const stageColors = {
  PLACED: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  PACKED: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const stageBarColors = {
  PLACED: "#9CA3AF",
  CONFIRMED: "#60A5FA",
  PROCESSING: "#F59E0B",
  PACKED: "#A855F7",
  SHIPPED: "#6366F1",
  OUT_FOR_DELIVERY: "#FB923C",
  DELIVERED: "#10B981",
  CANCELLED: "#EF4444",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("admin_token") || "";
      const authHeader = { Authorization: `Bearer ${token}` };

      const [ordersRes, usersRes] = await Promise.all([
        axios.get("/api/admin/orders", { headers: authHeader }),
        axios.get("/api/admin/users", { headers: authHeader }),
      ]);

      const rawOrders = ordersRes.data ?? [];
      const rawUsers = usersRes.data ?? [];

      const ordersArr = Array.isArray(rawOrders)
        ? rawOrders
        : rawOrders.items || rawOrders.orders || [];
      const usersArr = Array.isArray(rawUsers)
        ? rawUsers
        : rawUsers.items || rawUsers.users || [];

      setOrders(ordersArr || []);
      setUsers(usersArr || []);
      setRefreshedAt(new Date());
    } catch (e) {
      console.error("Dashboard load error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------- computed metrics --------------------------- */

  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        activeCustomers: 0,
        thisMonthRevenue: 0,
        thisMonthOrders: 0,
      };
    }

    let totalRevenue = 0;
    const customerSet = new Set();

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let thisMonthRevenue = 0;
    let thisMonthOrders = 0;

    for (const o of orders) {
      const total = Number(o.totalPrice || 0);
      totalRevenue += total;

      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (created && created.getMonth() === thisMonth && created.getFullYear() === thisYear) {
        thisMonthRevenue += total;
        thisMonthOrders += 1;
      }

      if (o.userId) {
        customerSet.add(String(o.userId));
      } else if (o.customer?.email) {
        customerSet.add(o.customer.email.toLowerCase());
      }
    }

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const activeCustomers = customerSet.size;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      activeCustomers,
      thisMonthRevenue,
      thisMonthOrders,
    };
  }, [orders]);

  const stageData = useMemo(() => {
    if (!orders.length) return [];
    const counts = {};
    STAGES.forEach((s) => (counts[s] = 0));
    orders.forEach((o) => {
      const s = (o.stage || "").toUpperCase();
      if (counts[s] != null) counts[s] += 1;
    });
    return STAGES.map((s) => ({
      stage: stageLabels[s],
      key: s,
      count: counts[s] || 0,
      color: stageBarColors[s],
    }));
  }, [orders]);

  const revenueSeries = useMemo(() => {
    if (!orders.length) return [];
    const map = new Map();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, {
        dateKey: key,
        label: d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        revenue: 0,
      });
    }

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = d.toISOString().slice(0, 10);
      if (map.has(key)) {
        const item = map.get(key);
        item.revenue += Number(o.totalPrice || 0);
      }
    });

    return Array.from(map.values());
  }, [orders]);

  const topProducts = useMemo(() => {
    if (!orders.length) return [];
    const agg = new Map();
    for (const o of orders) {
      (o.products || []).forEach((p) => {
        const name = p.name || "Unknown Item";
        const prev = agg.get(name) || { name, qty: 0, revenue: 0, image: p.image || "" };
        prev.qty += Number(p.quantity || 0);
        const lineTotal =
          p.lineTotal != null
            ? Number(p.lineTotal)
            : Number(p.price || 0) * Number(p.quantity || 0);
        prev.revenue += lineTotal;
        if (!prev.image && p.image) prev.image = p.image;
        agg.set(name, prev);
      });
    }

    return Array.from(agg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(() => {
    if (!orders.length) return [];
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  }, [orders]);

  const totalUsers = users.length;
  const newUsers30 = useMemo(() => {
    if (!users.length) return 0;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return users.filter((u) => new Date(u.createdAt || 0).getTime() >= cutoff).length;
  }, [users]);

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            High-level overview of VKart performance and activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {refreshedAt && (
            <span className="text-xs text-gray-500">
              Updated{" "}
              {refreshedAt.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={INR(stats.totalRevenue)}
          subtitle="All time"
          icon={<CurrencyRupeeIcon className="h-6 w-6 text-white" />}
          gradient="from-orange-500 to-amber-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.thisMonthOrders} this month`}
          icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          title="Avg. Order Value"
          value={INR(stats.avgOrderValue)}
          subtitle="Revenue / order"
          icon={<TrendingUpIcon className="h-6 w-6 text-white" />}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Customers"
          value={stats.activeCustomers || totalUsers}
          subtitle={`${newUsers30} joined last 30 days`}
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          gradient="from-sky-500 to-cyan-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Revenue (Last 7 Days)
              </h2>
              <p className="text-xs text-gray-500">
                Includes all completed orders by created date.
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-flex items-center gap-1">
              <StatusOnlineIcon className="h-4 w-4" />
              Live
            </span>
          </div>

          {revenueSeries.length ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#fed7aa" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                  />
                  <Tooltip
                    formatter={(value) => INR(value)}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: "#F97316",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#fb923c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartPlaceholder />
          )}
        </div>

        {/* Stage distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">
            Orders by Stage
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Current distribution across the full order lifecycle.
          </p>

          {stageData.some((s) => s.count > 0) ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    interval={0}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: "#9CA3AF",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                  >
                    {stageData.map((entry, index) => (
                      <cell
                        // eslint-disable-next-line react/no-array-index-key
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartPlaceholder />
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {stageData.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5"
              >
                <span className="truncate text-gray-600">{s.stage}</span>
                <span className="font-semibold text-gray-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: recent orders + top products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="text-xs font-medium text-orange-600 hover:text-orange-700"
            >
              View all →
            </button>
          </div>

          {recentOrders.length ? (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  className="py-3 flex items-center gap-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {o.orderId || o._id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {o.customer?.name || "Unknown Customer"} •{" "}
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                    {INR(o.totalPrice || 0)}
                  </span>
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
                      stageColors[o.stage] || "bg-gray-100 text-gray-700",
                    ].join(" ")}
                  >
                    {stageLabels[o.stage] || o.stage || "Unknown"}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/orders/${o._id}`)}
                    className="ml-2 text-xs text-orange-600 hover:text-orange-700"
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No orders yet.</p>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Top Products</h2>
            <span className="text-xs text-gray-500">
              Based on revenue across all orders.
            </span>
          </div>

          {topProducts.length ? (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 hover:bg-gray-50"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="object-contain h-full w-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.qty} sold • {INR(p.revenue)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    TOP {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No product data yet.</p>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-full bg-gray-900 text-white text-xs px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Updating metrics…
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------- small helper components ------------------------- */

function StatCard({ title, value, subtitle, icon, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>
          )}
        </div>
        <div
          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>
      </div>

  
    </div>
  );
}


function EmptyChartPlaceholder() {
  return (
    <div className="h-40 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/60">
      Not enough data yet. Place a few orders to see charts here.
    </div>
  );
}
