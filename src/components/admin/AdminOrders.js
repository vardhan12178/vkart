// src/pages/admin/AdminOrders.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  RefreshIcon,
  FilterIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ShoppingBagIcon,
  InboxIcon,
  ChevronDownIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  CheckIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

const STAGES = [
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

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [filterStage, setFilterStage] = useState("ALL");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filterMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      // Ensure this endpoint exists in your backend
      const response = await fetch("/api/admin/orders", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- derived stats for the top cards ---
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.stage)).length;
    const completedOrders = orders.filter(o => o.stage === 'DELIVERED').length;
    return { totalRevenue, activeOrders, completedOrders };
  }, [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((o) => 
        o._id.toLowerCase().includes(q) ||
        (o.customer?.name || "").toLowerCase().includes(q) ||
        (o.customer?.email || "").toLowerCase().includes(q)
      );
    }

    if (filterStage !== "ALL") {
      result = result.filter((o) => o.stage === filterStage);
    }

    result.sort((a, b) => {
      let va = a[sortConfig.key];
      let vb = b[sortConfig.key];

      if (sortConfig.key === "customer") {
        va = (a.customer?.name || "").toLowerCase();
        vb = (b.customer?.name || "").toLowerCase();
      } else if (sortConfig.key === "totalPrice") {
        va = Number(a.totalPrice);
        vb = Number(b.totalPrice);
      } else if (sortConfig.key === "createdAt") {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      } else if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }

      if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
      if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, search, filterStage, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStage]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getStatusBadge = (stage) => {
    const configs = {
      PLACED: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
      CONFIRMED: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
      PROCESSING: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500" },
      PACKED: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
      SHIPPED: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
      OUT_FOR_DELIVERY: { bg: "bg-yellow-50", text: "text-yellow-600", dot: "bg-yellow-500" },
      DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
      CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
    };

    const config = configs[stage] || configs.PLACED;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-transparent ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`}></span>
        {stage.replace(/_/g, " ")}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Overview of all customer orders and status.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium">Sync</span>
            </button>
          </div>
        </div>

        {/* Stats Overview Cards (Premium Touch) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} 
            icon={CurrencyRupeeIcon} 
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard 
            title="Active Orders" 
            value={stats.activeOrders} 
            icon={ClockIcon} 
            color="text-orange-600"
            bg="bg-orange-50"
          />
           <StatCard 
            title="Completed" 
            value={stats.completedOrders} 
            icon={CheckCircleIcon} 
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>

        {/* Controls Toolbar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-sm"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-px bg-slate-100 my-1 hidden sm:block"></div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all w-full sm:w-48
                ${isFilterMenuOpen || filterStage !== 'ALL' 
                  ? "bg-slate-100 text-slate-900" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span className="truncate">{filterStage === "ALL" ? "Filter Status" : filterStage.replace(/_/g, " ")}</span>
              </div>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isFilterMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                 <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   Select Status
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                   {STAGES.map((stage) => (
                     <button
                       key={stage}
                       onClick={() => {
                         setFilterStage(stage);
                         setIsFilterMenuOpen(false);
                       }}
                       className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between group"
                     >
                       <span className={filterStage === stage ? "font-medium text-slate-900" : ""}>
                         {stage.replace(/_/g, " ")}
                       </span>
                       {filterStage === stage && <CheckIcon className="h-4 w-4 text-slate-900" />}
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Table Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl w-full"></div>
              ))}
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <InboxIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No orders found</h3>
              <p className="text-slate-500 text-sm mt-1">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button 
                onClick={() => { setSearch(''); setFilterStage('ALL'); }}
                className="mt-4 text-orange-600 font-medium text-sm hover:text-orange-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <SortableHeader label="Order ID" sortKey="_id" currentSort={sortConfig} onSort={handleSort} />
                      <SortableHeader label="Customer" sortKey="customer" currentSort={sortConfig} onSort={handleSort} />
                      <SortableHeader label="Total" sortKey="totalPrice" currentSort={sortConfig} onSort={handleSort} />
                      <SortableHeader label="Status" sortKey="stage" currentSort={sortConfig} onSort={handleSort} />
                      <SortableHeader label="Date" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} />
                      <th className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {currentOrders.map((o) => (
                      <tr
                        key={o._id}
                        onClick={() => navigate(`/admin/orders/${o._id}`)}
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        {/* Order ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                              <ShoppingBagIcon className="h-5 w-5" />
                            </div>
                            <div className="font-mono text-sm font-medium text-slate-700">
                              #{o._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 ring-2 ring-white">
                              {getInitials(o.customer?.name)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">
                                {o.customer?.name || "Guest"}
                              </div>
                              <div className="text-xs text-slate-400">{o.customer?.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900 tabular-nums">
                            ₹{o.totalPrice?.toLocaleString('en-IN')}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(o.stage)}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500 tabular-nums">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short"
                            })}
                          </div>
                           <div className="text-xs text-slate-400 tabular-nums">
                             {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute:'2-digit'})}
                           </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ChevronRightIcon className="h-5 w-5 text-slate-300 group-hover:text-orange-500 transition-colors ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(endIndex, filteredAndSortedOrders.length)}</span> of <span className="font-medium text-slate-900">{filteredAndSortedOrders.length}</span>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                     className="p-1 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  )
}

// Sortable Header Helper
function SortableHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;
  return (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1 group-hover:text-slate-800 transition-colors">
        {label}
        {isActive && (
          currentSort.direction === 'asc' 
            ? <SortAscendingIcon className="h-3 w-3 text-orange-500" />
            : <SortDescendingIcon className="h-3 w-3 text-orange-500" />
        )}
      </div>
    </th>
  );
}