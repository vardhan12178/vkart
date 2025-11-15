import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axiosInstance";
import {
  SearchIcon,
  RefreshIcon,
} from "@heroicons/react/outline";

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      setOrders(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) return setFiltered(orders);

    const out = orders.filter((o) => {
      return (
        o._id.toLowerCase().includes(q) ||
        (o.customer?.name || "").toLowerCase().includes(q) ||
        (o.customer?.email || "").toLowerCase().includes(q)
      );
    });

    setFiltered(out);
  }, [search, orders]);

  // Status Styles
  const stageStyle = {
    PLACED: "bg-gray-100 text-gray-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>

        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:bg-gray-100 border"
        >
          <RefreshIcon className="h-5 w-5 text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-xl border shadow px-4 py-2 gap-3">
        <SearchIcon className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          className="flex-1 outline-none text-sm"
          placeholder="Search orders by Order ID, Customer Name or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">

        {/* Loading */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Stage</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium"></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((o) => (
                  <tr
                    key={o._id}
                    className="hover:bg-orange-50/60 transition cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${o._id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {o._id}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      <div>{o.customer?.name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">
                        {o.customer?.email}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-800">
                      ₹{o.totalPrice}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          stageStyle[o.stage] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {o.stage}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="text-orange-500 font-medium">View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
