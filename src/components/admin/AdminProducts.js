import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProductImageUploader from "../ProductImageUploader";
import {
  PlusIcon,
  PencilAltIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationIcon,
  PhotographIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  XIcon,
  UploadIcon,
  CurrencyRupeeIcon,
  TagIcon,
  ClipboardListIcon,
  SaveIcon,
  TruckIcon,
  ShieldCheckIcon,
  ViewListIcon,
  ArchiveIcon,
  TrashIcon
} from "@heroicons/react/outline";
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";

// --- CSS for Custom Scrollbars ---
const customScrollStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }
`;

// --- Main Component ---
export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("products");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Toast
  const [toast, setToast] = useState({ type: "", message: "" });

  const showToastMsg = (type, message, ms = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), ms);
  };

  const productsQuery = useQuery({
    queryKey: qk.admin.products,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/products");
      return res.data || [];
    },
  });

  const saveProductMutation = useMutation({
    mutationFn: async (payload) => {
      if (editData) {
        return axiosInstance.put(`/api/admin/products/${editData._id}`, payload);
      }
      return axiosInstance.post("/api/admin/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.products });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "filters"] });
      queryClient.invalidateQueries({ queryKey: qk.home.landing });
    },
  });

  useEffect(() => {
    if (productsQuery.isError) {
      showToastMsg("error", "Failed to load products.");
    }
  }, [productsQuery.isError]);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const loading = productsQuery.isLoading;

  // Extract unique categories
  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

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
      await saveProductMutation.mutateAsync(payload);
      showToastMsg("success", editData ? "Product updated successfully." : "Product created successfully.");
      setShowModal(false);
      setEditData(null);
    } catch (err) {
      console.error("Save error:", err);
      showToastMsg("error", "Failed to save product.");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...products];

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

    if (statusFilter === "active") {
      list = list.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      list = list.filter((p) => !p.isActive);
    }

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

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

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
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <style>{customScrollStyle}</style>
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-8">

        {/* Toast Notification - Z-Index 200 to sit above modal (Z-100) */}
        {toast.message && (
          <div
            className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "success" ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-red-100 text-red-800"
              }`}
          >
            {toast.type === "success" ? <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> : <ExclamationIcon className="h-5 w-5 text-red-500" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Inventory
            </h1>
            <p className="text-slate-500 mt-0.5 text-xs sm:text-sm font-medium">
              Manage your product catalog and stock levels.
            </p>
          </div>

          {canWrite && (
            <button
              onClick={openAdd}
              className="group inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white shadow-xs hover:bg-slate-800 active:scale-95 transition-all duration-200 shrink-0"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white/90 transition-colors" />
              <span className="font-bold text-xs sm:text-sm">Add Product</span>
            </button>
          )}
        </div>

        {/* Stats Cards - 3-Column Compact Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          <StatCard
            label="Total"
            value={totalCount}
            icon={CubeIcon}
            color="blue"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={CheckCircleIcon}
            color="emerald"
          />
          <StatCard
            label="Low Stock"
            value={lowStockCount}
            icon={ExclamationIcon}
            color="amber"
          />
        </div>

        {/* Controls Toolbar */}
        <div className="bg-white p-1 sm:p-1.5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="h-px w-full bg-slate-100 sm:h-auto sm:w-px sm:bg-slate-100"></div>

          <div className="flex items-center justify-between sm:justify-start gap-1.5 px-1 pb-1 sm:p-0">
            {/* Status Filter Pills */}
            <div className="flex bg-slate-100/80 p-0.5 sm:p-1 rounded-lg">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all ${statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all ${statusFilter === 'inactive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Drafts
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold rounded-lg pl-2.5 pr-7 py-1.5 sm:py-2 focus:ring-0 focus:border-slate-300 cursor-pointer hover:bg-white transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="stock_low">Stock: Low to High</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                <FilterIcon className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Table / List Section */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden flex flex-col min-h-[350px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
              <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
              <div className="h-3.5 w-40 bg-slate-100 rounded"></div>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
                <ArchiveIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No products found</h3>
              <p className="text-slate-500 max-w-xs mt-0.5 text-xs sm:text-sm">
                Try adjusting your filters or add a new product to your inventory.
              </p>
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="mt-4 text-orange-600 font-bold text-xs sm:text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {pageItems.map((p) => {
                  const isLowStock = (p.stock ?? 0) > 0 && p.stock <= 5;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <div key={p._id} className="p-3 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
                      <div className="h-14 w-14 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shadow-xs">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.title} className="h-full w-full object-contain mix-blend-multiply" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50 rounded-lg">
                            <PhotographIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1 flex-1">{p.title}</h4>
                          <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${p.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                            {p.isActive ? "Active" : "Draft"}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                          {p.category && <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium truncate max-w-[120px]">{p.category}</span>}
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border
                            ${isOutOfStock ? "bg-red-50 text-red-700 border-red-100"
                                : isLowStock ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-slate-50 text-slate-600 border-slate-200"}
                          `}>
                            <span className={`h-1 w-1 rounded-full ${isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                            {isOutOfStock ? "Out of Stock" : `${p.stock} in stock`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-slate-900">₹{p.price?.toLocaleString('en-IN')}</span>
                            {p.discountPercentage > 0 && (
                              <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1 rounded">
                                -{p.discountPercentage}%
                              </span>
                            )}
                          </div>

                          {canWrite && (
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] font-bold flex items-center gap-1"
                              title="Edit Product"
                            >
                              <PencilAltIcon className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      {canWrite && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {pageItems.map((p) => {
                      const isLowStock = (p.stock ?? 0) > 0 && p.stock <= 5;
                      const isOutOfStock = p.stock === 0;

                      return (
                        <tr key={p._id} className="group hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shadow-sm">
                                {p.thumbnail ? (
                                  <img src={p.thumbnail} alt={p.title} className="h-full w-full object-contain mix-blend-multiply" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50 rounded-lg">
                                    <PhotographIcon className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</div>
                                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                                  {p.category && <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">{p.category}</span>}
                                  {p.sku && <span className="font-mono text-slate-400">SKU: {p.sku}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-900">₹{p.price?.toLocaleString('en-IN')}</div>
                            {p.discountPercentage > 0 && (
                              <div className="text-[10px] font-bold text-orange-600 bg-orange-50 inline-block px-1.5 rounded mt-0.5">
                                -{p.discountPercentage}%
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                            ${isOutOfStock ? "bg-red-50 text-red-700 border-red-100"
                                : isLowStock ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-slate-50 text-slate-600 border-slate-200"}
                          `}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                              {isOutOfStock ? "Out of Stock" : `${p.stock} Units`}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${p.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                              {p.isActive ? "Active" : "Draft"}
                            </span>
                          </td>

                          {canWrite && (
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                              title="Edit Product"
                            >
                              <PencilAltIcon className="h-5 w-5" />
                            </button>
                          </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="mt-auto px-3.5 sm:px-6 py-2.5 sm:py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs sm:text-sm text-slate-500">
                  <span className="font-medium text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)}</span> of <span className="font-medium text-slate-900">{filteredAndSorted.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-white hover:shadow-xs disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-1.5 sm:hidden">{currentPage}/{totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-white hover:shadow-xs disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Panel (Z-Index 10 to sit above backdrop) */}
          <div className="relative w-full max-w-5xl max-h-[94vh] sm:max-h-[95vh] bg-[#F8F9FA] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 z-10">

            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-white z-10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{editData ? "Edit Product" : "New Product"}</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Fill in the details below.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AdminProductForm
                initialData={editData}
                onSubmit={submitProduct}
                onCancel={() => setShowModal(false)}
                categories={uniqueCategories}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ──────────────── Helper Components ──────────────── */

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: "text-[#5f5a52] bg-[#ece8df]",
    emerald: "text-[#59634f] bg-[#e5e8df]",
    amber: "text-[#8b5437] bg-[#f0e5db]"
  };

  return (
    <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">{value}</p>
      </div>
      <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl ${colors[color]} shrink-0 self-end sm:self-center`}>
        <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
}


function AdminProductForm({ initialData = null, onSubmit, onCancel, categories = [] }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "", brand: "", price: "", discountPercentage: "", stock: "", sku: "", tags: "",
    thumbnail: "", images: [], weight: "", width: "", height: "", depth: "", warrantyInformation: "", shippingInformation: "", returnPolicy: "", isActive: true,
    variants: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        price: initialData.price || "",
        discountPercentage: initialData.discountPercentage || "",
        stock: initialData.stock || "",
        sku: initialData.sku || "",
        tags: (initialData.tags || []).join(", "),
        thumbnail: initialData.thumbnail || "",
        images: initialData.images || [],
        weight: initialData.weight || "",
        width: initialData.dimensions?.width || "",
        height: initialData.dimensions?.height || "",
        depth: initialData.dimensions?.depth || "",
        warrantyInformation: initialData.warrantyInformation || "",
        shippingInformation: initialData.shippingInformation || "",
        returnPolicy: initialData.returnPolicy || "",
        isActive: initialData.isActive ?? true,
        variants: initialData.variants || [],
      });
    }
  }, [initialData]);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submitForm = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPercentage: Number(form.discountPercentage),
      stock: Number(form.stock),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      weight: Number(form.weight),
      dimensions: { width: Number(form.width), height: Number(form.height), depth: Number(form.depth) },
      variants: (form.variants || []).filter((v) => v.type && v.options?.length),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submitForm} className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6 p-3 sm:p-6">

        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-3.5 sm:space-y-6">
          {/* General Card */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
              <ClipboardListIcon className="h-4 w-4 text-slate-400" />
              Basic Details
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all bg-slate-50/50 focus:bg-white"
                  required
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all bg-slate-50/50 focus:bg-white resize-none"
                  rows={4}
                  required
                  placeholder="Describe the product features, benefits, and specs..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
              <CurrencyRupeeIcon className="h-4 w-4 text-slate-400" />
              Pricing & Stock
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1 truncate">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1 truncate">Discount (%)</label>
                <input
                  type="number"
                  value={form.discountPercentage}
                  onChange={(e) => update("discountPercentage", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1 truncate">Stock Qty</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white"
                  required
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">Variants</h3>
              <button
                type="button"
                onClick={() => update("variants", [...(form.variants || []), { type: "", options: [] }])}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 hover:bg-slate-50 transition-colors"
              >
                + Add Variant
              </button>
            </div>
            {(form.variants || []).length === 0 && (
              <p className="text-xs text-slate-400">No variants. Add size, color, or storage options.</p>
            )}
            {(form.variants || []).map((v, vi) => (
              <div key={vi} className="p-3 sm:p-4 bg-slate-50 rounded-xl space-y-2 sm:space-y-3 relative">
                <button
                  type="button"
                  onClick={() => update("variants", form.variants.filter((_, i) => i !== vi))}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 text-xs font-bold"
                >
                  Remove
                </button>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Type</label>
                  <input
                    type="text"
                    value={v.type}
                    onChange={(e) => {
                      const copy = [...form.variants];
                      copy[vi] = { ...copy[vi], type: e.target.value };
                      update("variants", copy);
                    }}
                    className="w-40 sm:w-48 rounded-lg border-slate-200 text-xs sm:text-sm py-1.5 px-2.5 bg-white"
                    placeholder="e.g. Size, Color"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={(v.options || []).join(", ")}
                    onChange={(e) => {
                      const copy = [...form.variants];
                      copy[vi] = { ...copy[vi], options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) };
                      update("variants", copy);
                    }}
                    className="w-full rounded-lg border-slate-200 text-xs sm:text-sm py-1.5 px-2.5 bg-white"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Media Card */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
              <PhotographIcon className="h-4 w-4 text-slate-400" />
              Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <ProductImageUploader
                label="Thumbnail"
                mode="single"
                initial={form.thumbnail ? [form.thumbnail] : []}
                onUpload={(url) => update("thumbnail", url)}
              />
              <ProductImageUploader
                label="Gallery (Max 5)"
                mode="multiple"
                limit={5}
                initial={Array.isArray(form.images) ? form.images : []}
                onUpload={(urls) => update("images", urls)}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Settings */}
        <div className="space-y-3.5 sm:space-y-6">
          {/* Status Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1.5">Product Status</label>
              <select
                value={form.isActive}
                onChange={(e) => update("isActive", e.target.value === "true")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 cursor-pointer"
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</h3>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                list="categories-list"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                placeholder="Select..."
              />
              <datalist id="categories-list">
                {categories.map((cat) => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                placeholder="e.g. Nike"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">SKU Code</label>
              <input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                placeholder="PROD-001"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                placeholder="summer, sale..."
              />
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-slate-200/70 space-y-3 sm:space-y-4">
            <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Shipping</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} className="w-full rounded-lg border-slate-200 text-xs sm:text-sm py-1.5 px-2 bg-slate-50/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Width (cm)</label>
                <input type="number" value={form.width} onChange={(e) => update("width", e.target.value)} className="w-full rounded-lg border-slate-200 text-xs sm:text-sm py-1.5 px-2 bg-slate-50/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Height (cm)</label>
                <input type="number" value={form.height} onChange={(e) => update("height", e.target.value)} className="w-full rounded-lg border-slate-200 text-xs sm:text-sm py-1.5 px-2 bg-slate-50/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Depth (cm)</label>
                <input type="number" value={form.depth} onChange={(e) => update("depth", e.target.value)} className="w-full rounded-lg border-slate-200 text-xs sm:text-sm py-1.5 px-2 bg-slate-50/50" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">Policy</label>
              <input value={form.returnPolicy} onChange={(e) => update("returnPolicy", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50/50" placeholder="Returns policy" />
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Footer */}
      <div className="border-t border-slate-200 bg-white px-4 sm:px-8 py-3 sm:py-4 flex justify-end gap-2.5 sm:gap-4 z-20 rounded-b-2xl shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-black active:scale-95 transition-all"
        >
          <SaveIcon className="h-4 w-4 text-slate-300" />
          {initialData ? "Update Product" : "Save Product"}
        </button>
      </div>
    </form>
  );
}
