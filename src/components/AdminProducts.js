import React, { useEffect, useMemo, useState } from "react";
import axios from "./axiosInstance";
import {
  PlusIcon,
  PencilAltIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline";
import AdminProductForm from "./AdminProductForm";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | price_low | price_high | stock_low

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Toast
  const [toast, setToast] = useState({ type: "", message: "" });
  const [showToast, setShowToastState] = useState(false);

  const showToastMsg = (type, message, ms = 2000) => {
    setToast({ type, message });
    setShowToastState(true);
    setTimeout(() => setShowToastState(false), ms);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Load products:", err);
      showToastMsg("error", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAdd = () => {
    setEditData(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setShowModal(true);
  };



  const submitProduct = async (payload) => {
    try {
      if (editData) {
        await axios.put(`/api/admin/products/${editData._id}`, payload);
        showToastMsg("success", "Product updated.");
      } else {
        await axios.post("/api/admin/products", payload);
        showToastMsg("success", "Product created.");
      }
      setShowModal(false);
      setEditData(null);
      await loadProducts();
    } catch (err) {
      console.error("Save error:", err);
      showToastMsg("error", "Failed to save product.");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...products];

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        return (
          title.includes(q) ||
          category.includes(q) ||
          brand.includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
        );
      });
    }

    // status filter
    if (statusFilter === "active") {
      list = list.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      list = list.filter((p) => !p.isActive);
    }

    // sort
    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b._id?.toString().substring(0, 8)) -
          new Date(a.createdAt || a._id?.toString().substring(0, 8))
      );
    } else if (sortBy === "price_low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "stock_low") {
      list.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    }

    return list;
  }, [products, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) > 0 && p.stock <= 5).length;

  return (
    <div className="p-6 space-y-6">

      {/* Toast */}
      {showToast && toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage catalog, pricing, inventory and visibility from a single view.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500">Total Products</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-gray-900">{totalCount}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500">Active</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-emerald-700">
              {activeCount}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500">Low Stock (≤5)</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-amber-700">
              {lowStockCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, category, brand, SKU..."
              className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700">
            <FilterIcon className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
            <option value="stock_low">Stock: Low → High</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading products...</div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No products found for the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pageItems.map((p, idx) => {
                  const lowStock =
                    (p.stock ?? 0) > 0 && p.stock <= 5;
                  return (
                    <tr key={p._id} className="hover:bg-orange-50/40">
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.thumbnail && (
                            <img
                              src={p.thumbnail}
                              alt=""
                              className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {p.title}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-500">
                              {p.brand && <span>{p.brand}</span>}
                              {p.category && (
                                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                                  {p.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-800">
                        ₹{p.price?.toLocaleString?.("en-IN") ?? p.price}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            p.stock === 0
                              ? "bg-red-50 text-red-700"
                              : lowStock
                              ? "bg-amber-50 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {p.stock ?? 0}
                          {p.stock === 0
                            ? " (Out)"
                            : lowStock
                            ? " (Low)"
                            : ""}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center p-1.5 text-gray-600 hover:text-orange-600"
                        >
                          <PencilAltIcon className="h-5 w-5" />
                        </button>
                        {/* <button
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex items-center p-1.5 text-gray-600 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredAndSorted.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <div>
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredAndSorted.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {filteredAndSorted.length}
              </span>{" "}
              products
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`inline-flex items-center rounded-full border px-2 py-1 ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span>
                Page{" "}
                <span className="font-semibold text-gray-800">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {totalPages}
                </span>
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className={`inline-flex items-center rounded-full border px-2 py-1 ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

     {showModal && (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {editData ? "Edit Product" : "Create Product"}
          </h2>
          <p className="text-xs text-gray-500">
            Upload images, set pricing and control visibility.
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(false);
            setEditData(null);
          }}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Scrollable form */}
      <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(90vh - 70px)" }}>
        <AdminProductForm
          initialData={editData}
          onSubmit={submitProduct}
          onCancel={() => {
            setShowModal(false);
            setEditData(null);
          }}
        />
      </div>

    </div>
  </div>
)}

    </div>
  );
}
