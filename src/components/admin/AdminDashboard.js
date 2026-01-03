import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUpIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  RefreshIcon,
  StatusOnlineIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
  ClockIcon,
  PhotographIcon,
  CalendarIcon,
  ExternalLinkIcon
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
  Cell,
} from "recharts";

// --- CSS for Hiding Scrollbars ---
const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// --- Utilities ---
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

const STAGES = [
  "PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
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
  PLACED: "bg-slate-100 text-slate-600 border-slate-200",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-200",
  PROCESSING: "bg-amber-50 text-amber-600 border-amber-200",
  PACKED: "bg-purple-50 text-purple-600 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-600 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");

  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      // Cookie-based auth - no token needed

      const [ordersRes, usersRes] = await Promise.all([
        fetch("/api/admin/orders", { credentials: 'include' }).then(r => r.json()),
        fetch("/api/admin/users", { credentials: 'include' }).then(r => r.json()),
      ]);

      const rawOrders = ordersRes ?? [];
      const rawUsers = usersRes ?? [];

      const ordersArr = Array.isArray(rawOrders) ? rawOrders : rawOrders.items || rawOrders.orders || [];
      const usersArr = Array.isArray(rawUsers) ? rawUsers : rawUsers.items || rawUsers.users || [];

      setOrders(ordersArr || []);
      setUsers(usersArr || []);
      setRefreshedAt(new Date());
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Could not sync dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filter Logic ---
  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.setDate(now.getDate() - days));

    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange]);


  /* ---------------------------- Metrics Logic --------------------------- */
  const stats = useMemo(() => {
    const sourceData = orders;

    if (!sourceData.length) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, activeCustomers: 0, thisMonthOrders: 0 };

    let totalRevenue = 0;
    const customerSet = new Set();
    const now = new Date();
    const thisMonth = now.getMonth();
    let thisMonthOrders = 0;

    for (const o of sourceData) {
      const total = Number(o.totalPrice || 0);
      totalRevenue += total;
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (created && created.getMonth() === thisMonth && created.getFullYear() === now.getFullYear()) {
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
  }, [orders]);

  const stageData = useMemo(() => {
    const counts = {};
    STAGES.forEach((s) => (counts[s] = 0));
    filteredOrders.forEach((o) => {
      const s = (o.stage || "").toUpperCase();
      if (counts[s] != null) counts[s] += 1;
    });

    const colors = ["#cbd5e1", "#93c5fd", "#fcd34d", "#c084fc", "#818cf8", "#fb923c", "#34d399", "#f87171"];
    return STAGES.map((s, idx) => ({ stage: stageLabels[s], key: s, count: counts[s] || 0, color: colors[idx] }));
  }, [filteredOrders]);

  const revenueSeries = useMemo(() => {
    const map = new Map();
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

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
  }, [filteredOrders, timeRange]);

  const topProducts = useMemo(() => {
    const agg = new Map();
    for (const o of filteredOrders) {
      (o.products || []).forEach((p) => {
        const name = p.name || "Unknown";
        const prev = agg.get(name) || { name, qty: 0, revenue: 0, image: p.image || "" };
        prev.qty += Number(p.quantity || 0);
        prev.revenue += p.lineTotal != null ? Number(p.lineTotal) : Number(p.price || 0) * Number(p.quantity || 0);
        if ((!prev.image || prev.image.includes('fakestore')) && p.image && !p.image.includes('fakestore')) {
          prev.image = p.image;
        }
        agg.set(name, prev);
      });
    }
    return Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredOrders]);

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10);
  }, [orders]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const fadeInClass = (delay) => `animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-${delay}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-10">
      <style>{noScrollbarStyle}</style>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {greeting}, Admin <span className="text-2xl animate-pulse">👋</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">
              Overview Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Date Filter - Segmented Control */}
            <div className="bg-slate-200/50 p-1 rounded-xl flex items-center">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range
                      ? "bg-white text-slate-900 shadow-sm scale-105"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
                </button>
              ))}
            </div>

            <button
              onClick={loadAll}
              disabled={loading}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm active:scale-95"
              title="Sync Data"
            >
              <RefreshIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8 px-4 sm:px-8 mt-8">

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-center gap-2 animate-in fade-in shadow-sm">
            <StatusOnlineIcon className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Skeleton Loading State */}
        {loading && !orders.length ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className={fadeInClass(0)}>
                <StatCard
                  title="Total Revenue"
                  value={INR(stats.totalRevenue)}
                  subtitle="Gross Income"
                  icon={<CurrencyRupeeIcon className="h-6 w-6 text-white" />}
                  gradient="from-orange-500 to-amber-500"
                  trend="+12.5%"
                  trendUp={true}
                />
              </div>
              <div className={fadeInClass(100)}>
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  subtitle="All time"
                  icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
                  gradient="from-blue-500 to-indigo-500"
                  trend={`+${stats.thisMonthOrders} this month`}
                  trendUp={true}
                />
              </div>
              <div className={fadeInClass(200)}>
                <StatCard
                  title="Avg. Order Value"
                  value={INR(stats.avgOrderValue)}
                  subtitle="Revenue per Order"
                  icon={<TrendingUpIcon className="h-6 w-6 text-white" />}
                  gradient="from-emerald-500 to-teal-500"
                  trend="+2.4%"
                  trendUp={true}
                />
              </div>
              <div className={fadeInClass(300)}>
                <StatCard
                  title="Active Customers"
                  value={stats.activeCustomers || users.length}
                  subtitle="Total User Base"
                  icon={<UsersIcon className="h-6 w-6 text-white" />}
                  gradient="from-pink-500 to-rose-500"
                  trend={`+${users.length} total`}
                  trendUp={true}
                />
              </div>
            </div>

            {/* Main Charts Section */}
            <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 ${fadeInClass(400)}`}>

              {/* Revenue Chart */}
              <div className="xl:col-span-2 bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-slate-400" />
                      Revenue Analytics
                    </h2>
                    <p className="text-xs font-medium text-slate-400 mt-1 ml-7">
                      Income trend for the selected period
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <TrendingUpIcon className="h-3 w-3" />
                    <span>Growth Stable</span>
                  </div>
                </div>

                <div className="h-[320px] w-full">
                  {revenueSeries.length > 0 && revenueSeries.some(d => d.revenue > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                          tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px 12px', fontSize: '12px' }}
                          cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#f97316"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState message="No revenue data available" />
                  )}
                </div>
              </div>

              {/* Order Stages Bar Chart */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Pipeline</h2>
                <p className="text-xs font-medium text-slate-400 mb-6">Order status distribution</p>

                <div className="flex-1 min-h-[220px]">
                  {stageData.some(s => s.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="stage"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          width={80}
                          tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} animationDuration={1500}>
                          {stageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState message="No active orders" />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section - Lists with Premium "Invisible" Scroll */}
            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${fadeInClass(500)}`}>

              {/* Recent Orders List */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm h-[450px] flex flex-col relative group">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-[1.5rem]">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Orders</h2>
                  <button onClick={() => navigate("/admin/orders")} className="text-slate-400 hover:text-orange-600 transition-colors">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto no-scrollbar flex-1 p-2">
                  {recentOrders.length > 0 ? recentOrders.map((order) => (
                    <div key={order._id} className="p-3 hover:bg-slate-50/80 rounded-2xl transition-colors flex items-center gap-4 group/item cursor-pointer mb-1" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-orange-100 group-hover/item:text-orange-600 transition-colors">
                        <ShoppingBagIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-slate-900 truncate">#{order.orderId || order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm font-black text-slate-900">{INR(order.totalPrice)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500 truncate">{order.customer?.name || "Guest"}</p>
                          <span className={`text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold border ${stageColors[order.stage]}`}>
                            {stageLabels[order.stage]}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <EmptyState message="No recent orders found" />
                  )}
                  {/* Spacer for bottom scroll */}
                  <div className="h-12"></div>
                </div>

                {/* Premium Fade Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-[1.5rem]" />
              </div>

              {/* Top Products List */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm h-[450px] flex flex-col relative group">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-[1.5rem]">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Top Products</h2>
                  <button onClick={() => navigate("/admin/products")} className="text-slate-400 hover:text-orange-600 transition-colors">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-y-auto no-scrollbar flex-1 p-4 space-y-3">
                  {topProducts.length > 0 ? topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all bg-white group/item">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 relative">
                        <ImageWithFallback src={p.image} alt={p.name} className="h-full w-full object-contain p-1 group-hover/item:scale-110 transition-transform duration-500 mix-blend-multiply" />
                        <div className="absolute top-0 left-0 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg">#{idx + 1}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover/item:text-orange-600 transition-colors">{p.name}</h4>
                        <p className="text-xs font-medium text-slate-500">{p.qty} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{INR(p.revenue)}</p>
                      </div>
                    </div>
                  )) : (
                    <EmptyState message={`No sales in this period`} />
                  )}
                  <div className="h-12"></div>
                </div>

                {/* Premium Fade Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-[1.5rem]" />
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------- Components ---------------------- */

function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <PhotographIcon className="h-6 w-6 text-slate-300" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

function StatCard({ title, value, subtitle, icon, gradient, trend, trendUp }) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-sm border border-slate-200/60 group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
      {/* Subtle Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-[0.08] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700`}></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md text-white transform group-hover:rotate-6 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium relative z-10">
        <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
          {trendUp ? <ArrowSmUpIcon className="h-3 w-3" /> : <ArrowSmDownIcon className="h-3 w-3" />}
          {trend}
        </span>
        <span className="text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
        <ClockIcon className="h-6 w-6 text-slate-300" />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 relative overflow-hidden">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-slate-100 rounded mb-3"></div>
              <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="h-8 w-28 bg-slate-100 rounded mb-3"></div>
            <div className="h-3 w-full bg-slate-50 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-80 bg-white rounded-[1.5rem] border border-slate-100 p-6">
          <div className="h-5 w-40 bg-slate-100 rounded mb-8"></div>
          <div className="h-56 bg-slate-50 rounded-xl"></div>
        </div>
        <div className="h-80 bg-white rounded-[1.5rem] border border-slate-100 p-6">
          <div className="h-5 w-24 bg-slate-100 rounded mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(j => <div key={j} className="h-10 bg-slate-50 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}