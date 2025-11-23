import React, { useEffect, useMemo, useState } from "react";
import ProductImageUploader from "./ProductImageUploader";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/products", {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      setProducts(data || []);
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
      const token = localStorage.getItem("admin_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let res;
      if (editData) {
        res = await fetch(`/api/admin/products/${editData._id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save product");

      showToastMsg("success", editData ? "Product updated successfully." : "Product created successfully.");
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
    <div className="min-h-screen bg-[#F8F9FA] p-6 sm:p-8 font-sans text-slate-800">
      <style>{customScrollStyle}</style>
      <div className="max-w-[1600px] mx-auto space-y-8">

      {/* Toast Notification - Z-Index 200 to sit above modal (Z-100) */}
      {toast.message && (
        <div
          className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success" ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-red-100 text-red-800"
          }`}
        >
           {toast.type === "success" ? <CheckCircleIcon className="h-5 w-5 text-emerald-500"/> : <ExclamationIcon className="h-5 w-5 text-red-500"/>}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your product catalog and stock levels.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] transition-all duration-200 active:scale-95"
        >
          <PlusIcon className="h-5 w-5 text-white/90 transition-colors" />
          <span className="font-semibold text-sm">Add Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard 
          label="Total Products" 
          value={totalCount} 
          icon={CubeIcon} 
          color="blue"
        />
        <StatCard 
          label="Active Listings" 
          value={activeCount} 
          icon={CheckCircleIcon} 
          color="emerald"
        />
        <StatCard 
          label="Low Stock Alerts" 
          value={lowStockCount} 
          icon={ExclamationIcon} 
          color="amber"
        />
      </div>

      {/* Controls Toolbar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-sm font-medium"
          />
        </div>

        <div className="h-px w-full bg-slate-100 lg:h-auto lg:w-px lg:bg-slate-100"></div>

        <div className="flex items-center gap-2 px-2 pb-2 lg:pb-0 overflow-x-auto no-scrollbar">
           {/* Status Filter Pills */}
           <div className="flex bg-slate-100/80 p-1 rounded-lg">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === 'inactive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Drafts
              </button>
           </div>

           <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

           {/* Sort Dropdown */}
           <div className="relative">
             <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:ring-0 focus:border-slate-300 cursor-pointer hover:bg-white transition-colors"
             >
               <option value="newest">Newest First</option>
               <option value="price_low">Price: Low to High</option>
               <option value="price_high">Price: High to Low</option>
               <option value="stock_low">Stock: Low to High</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <FilterIcon className="h-3 w-3" />
             </div>
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
             <div className="h-12 w-12 bg-slate-100 rounded-xl"></div>
             <div className="h-4 w-48 bg-slate-100 rounded"></div>
           </div>
        ) : filteredAndSorted.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
               <ArchiveIcon className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No products found</h3>
             <p className="text-slate-500 max-w-xs mt-1 text-sm">
               Try adjusting your filters or add a new product to your inventory.
             </p>
             <button 
               onClick={() => { setSearch(''); setStatusFilter('all'); }}
               className="mt-6 text-orange-600 font-bold text-sm hover:underline"
             >
               Clear all filters
             </button>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
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

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            title="Edit Product"
                          >
                            <PencilAltIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="mt-auto px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
               <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                 <p className="text-sm text-slate-500">
                   <span className="font-medium text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)}</span> of <span className="font-medium text-slate-900">{filteredAndSorted.length}</span>
                 </p>
                 <div className="flex gap-1">
                   <button
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
                   >
                     <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
                   </button>
                   <button
                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages}
                     className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
                   >
                     <ChevronRightIcon className="h-5 w-5 text-slate-600" />
                   </button>
                 </div>
               </div>
            </div>
          </>
        )}
      </div>
      </div>

      {/* Modal with Correct Stacking Context */}
      {showModal && (
        // FIX: Z-Index 100 to beat Header (Z-30)
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
           
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
             onClick={() => setShowModal(false)}
           ></div>
           
           {/* Modal Panel (Z-Index 10 to sit above backdrop) */}
           <div className="relative w-full max-w-5xl max-h-[95vh] bg-[#F8F9FA] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 z-10">
             
             {/* Modal Header */}
             <div className="px-6 py-4 border-b border-slate-200 bg-white z-10 flex items-center justify-between shrink-0">
               <div>
                 <h2 className="text-lg font-bold text-slate-900">{editData ? "Edit Product" : "New Product"}</h2>
                 <p className="text-xs text-slate-500 font-medium">Fill in the details below.</p>
               </div>
               <button 
                 onClick={() => setShowModal(false)}
                 className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
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
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50"
  };
  
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}


function AdminProductForm({ initialData = null, onSubmit, onCancel, categories = [] }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "", brand: "", price: "", discountPercentage: "", stock: "", sku: "", tags: "",
    thumbnail: "", images: [], weight: "", width: "", height: "", depth: "", warrantyInformation: "", shippingInformation: "", returnPolicy: "", isActive: true,
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
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submitForm} className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 sm:p-8">
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
           {/* General Card */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <ClipboardListIcon className="h-4 w-4 text-slate-400" />
                Basic Details
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all bg-slate-50/50 focus:bg-white"
                      required
                      placeholder="e.g. Wireless Noise Cancelling Headphones"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all bg-slate-50/50 focus:bg-white resize-none"
                      rows={5}
                      required
                      placeholder="Describe the product features, benefits, and specs..."
                    />
                 </div>
              </div>
           </div>

           {/* Pricing Card */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <CurrencyRupeeIcon className="h-4 w-4 text-slate-400" />
                Pricing & Stock
              </h3>
              <div className="grid grid-cols-3 gap-5">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white"
                      required
                      placeholder="0.00"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount (%)</label>
                    <input
                      type="number"
                      value={form.discountPercentage}
                      onChange={(e) => update("discountPercentage", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white"
                      placeholder="0"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock Qty</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => update("stock", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white"
                      required
                      placeholder="0"
                    />
                 </div>
              </div>
           </div>

           {/* Media Card */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <PhotographIcon className="h-4 w-4 text-slate-400" />
                Media
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <div className="space-y-6">
           {/* Status Card */}
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-2">Product Status</label>
                 <select
                    value={form.isActive}
                    onChange={(e) => update("isActive", e.target.value === "true")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 cursor-pointer"
                 >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Draft (Hidden)</option>
                 </select>
              </div>
           </div>

           {/* Organization Card */}
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</h3>
              
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                 <input
                    type="text"
                    list="categories-list"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                    placeholder="Select..."
                 />
                 <datalist id="categories-list">
                    {categories.map((cat) => <option key={cat} value={cat} />)}
                 </datalist>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand</label>
                 <input
                    value={form.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                    placeholder="e.g. Nike"
                 />
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1.5">SKU Code</label>
                 <input
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                    placeholder="PROD-001"
                 />
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags</label>
                 <input
                    value={form.tags}
                    onChange={(e) => update("tags", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50"
                    placeholder="summer, sale..."
                 />
              </div>
           </div>

           {/* Shipping Card */}
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shipping</h3>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                    <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} className="w-full rounded border-slate-200 text-sm py-1.5 px-2 bg-slate-50/50" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Width (cm)</label>
                    <input type="number" value={form.width} onChange={(e) => update("width", e.target.value)} className="w-full rounded border-slate-200 text-sm py-1.5 px-2 bg-slate-50/50" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Height (cm)</label>
                    <input type="number" value={form.height} onChange={(e) => update("height", e.target.value)} className="w-full rounded border-slate-200 text-sm py-1.5 px-2 bg-slate-50/50" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Depth (cm)</label>
                    <input type="number" value={form.depth} onChange={(e) => update("depth", e.target.value)} className="w-full rounded border-slate-200 text-sm py-1.5 px-2 bg-slate-50/50" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1.5">Policy</label>
                 <input value={form.returnPolicy} onChange={(e) => update("returnPolicy", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50/50" placeholder="Returns" />
              </div>
           </div>
        </div>

      </div>

      {/* Sticky Footer */}
      <div className="border-t border-slate-200 bg-white px-8 py-4 flex justify-end gap-4 z-20 rounded-b-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-slate-300 hover:bg-black hover:scale-[1.02] transition-all active:scale-95"
        >
          <SaveIcon className="h-4 w-4 text-slate-300" />
          {initialData ? "Update Product" : "Save Product"}
        </button>
      </div>
    </form>
  );
}