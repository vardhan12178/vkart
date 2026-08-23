import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";

const emptySale = {
  name: "",
  slug: "",
  description: "",
  bannerImage: "",
  startDate: "",
  endDate: "",
  isActive: true,
  categories: [{ category: "", discountPercent: "", primeDiscountPercent: "" }],
};

const toLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export default function AdminSales() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("sales");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySale);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const salesQuery = useQuery({
    queryKey: qk.admin.sales,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/sales");
      return res?.data || [];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "sales", "categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/products/filters");
      return (res.data?.categories || [])
        .map((entry) => entry.slug)
        .filter(Boolean)
        .sort();
    },
  });

  const saveSaleMutation = useMutation({
    mutationFn: async ({ payload, saleId }) => {
      if (saleId) return axiosInstance.put(`/api/sales/${saleId}`, payload);
      return axiosInstance.post("/api/sales", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.sales });
      queryClient.invalidateQueries({ queryKey: qk.public.activeSale });
      queryClient.invalidateQueries({ queryKey: qk.home.landing });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "filters"] });
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (saleId) => axiosInstance.delete(`/api/sales/${saleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.sales });
      queryClient.invalidateQueries({ queryKey: qk.public.activeSale });
      queryClient.invalidateQueries({ queryKey: qk.home.landing });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "filters"] });
    },
  });

  useEffect(() => {
    if (salesQuery.isError) {
      showToast("Failed to load sales", "error");
    }
  }, [salesQuery.isError]);

  const sales = salesQuery.data || [];
  const loading = salesQuery.isLoading;
  const error = salesQuery.isError ? "Failed to load sales" : "";
  const saving = saveSaleMutation.isPending;
  const productCategories = categoriesQuery.data || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptySale);
    setShowForm(true);
  };

  const openEdit = (sale) => {
    setEditing(sale._id);
    setForm({
      name: sale.name,
      slug: sale.slug,
      description: sale.description || "",
      bannerImage: sale.bannerImage || "",
      startDate: toLocal(sale.startDate),
      endDate: toLocal(sale.endDate),
      isActive: sale.isActive,
      categories: sale.categories.length
        ? sale.categories.map((c) => ({
            category: c.category,
            discountPercent: c.discountPercent,
            primeDiscountPercent: c.primeDiscountPercent || "",
          }))
        : [{ category: "", discountPercent: "", primeDiscountPercent: "" }],
    });
    setShowForm(true);
  };

  const handleField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleCatField = (idx, key, val) => {
    setForm((p) => {
      const cats = [...p.categories];
      cats[idx] = { ...cats[idx], [key]: val };
      return { ...p, categories: cats };
    });
  };

  const addCategory = () =>
    setForm((p) => ({
      ...p,
      categories: [...p.categories, { category: "", discountPercent: "", primeDiscountPercent: "" }],
    }));

  const removeCategory = (idx) =>
    setForm((p) => ({ ...p, categories: p.categories.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        categories: form.categories
          .filter((c) => c.category && c.discountPercent)
          .map((c) => ({
            category: c.category.trim(),
            discountPercent: Number(c.discountPercent),
            primeDiscountPercent: Number(c.primeDiscountPercent) || 0,
          })),
      };
      await saveSaleMutation.mutateAsync({ payload, saleId: editing });
      showToast(editing ? "Sale updated" : "Sale created");
      setShowForm(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await deleteSaleMutation.mutateAsync(id);
      showToast("Sale deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const isActive = (s) => s.isActive && new Date() >= new Date(s.startDate) && new Date() <= new Date(s.endDate);

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "bg-white border-red-100 text-red-800" : "bg-white border-emerald-100 text-emerald-800"}`}>
            {toast.type === "error" ? <XCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="font-editorial text-lg sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              Sales & Promotions
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 font-medium">{sales.length} promotional events</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => salesQuery.refetch()}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs text-slate-600"
              title="Refresh"
            >
              <RefreshIcon className={`h-4 w-4 ${salesQuery.isFetching ? "animate-spin" : ""}`} />
            </button>
            {canWrite && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shadow-xs shrink-0 whitespace-nowrap"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New Sale</span>
                <span className="sm:hidden">Sale</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/70 shadow-xs text-slate-400">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <p className="text-base font-bold text-slate-900 mb-1">No sales created yet</p>
            <p className="text-xs sm:text-sm text-slate-500 mb-4">Set up a seasonal or promotional discount event.</p>
            {canWrite && (
              <button onClick={openCreate} className="text-xs sm:text-sm font-bold text-orange-600 hover:underline">Create your first sale</button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            {/* Mobile Card View (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {sales.map((s) => (
                <div key={s._id} className="p-3.5 space-y-3 hover:bg-slate-50/50 transition">
                  {/* Top Row: Sale Name & Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{s.name}</h4>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{s.slug}</span>
                    </div>

                    <div className="shrink-0">
                      {isActive(s) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircleIcon className="h-3 w-3" /> Live
                        </span>
                      ) : s.isActive ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Scheduled</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <XCircleIcon className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration Banner */}
                  <div className="text-[11px] text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Duration</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(s.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(s.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Structured Categories Mini-Table */}
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      <span>Categories ({s.categories.length})</span>
                      <span>Discounts</span>
                    </div>
                    <div className="divide-y divide-slate-200/50">
                      {s.categories.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-1 px-1 text-xs">
                          <span className="font-medium text-slate-700 capitalize truncate pr-2 text-[11px]">
                            {c.category.replace(/-/g, ' ')}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded text-[10px]">
                              {c.discountPercent}% OFF
                            </span>
                            {c.primeDiscountPercent > 0 && (
                              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px]">
                                ★ {c.primeDiscountPercent}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  {canWrite && (
                    <div className="flex items-center justify-end gap-2 pt-0.5">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Sale</th>
                    <th className="px-6 py-4 text-left">Categories</th>
                    <th className="px-6 py-4 text-left">Duration</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    {canWrite && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{s.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {s.categories.map((c, i) => (
                            <span key={i} className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {c.category} ({c.discountPercent}%{c.primeDiscountPercent ? ` / P:${c.primeDiscountPercent}%` : ""})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div>{new Date(s.startDate).toLocaleDateString()}</div>
                        <div>→ {new Date(s.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isActive(s) ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                            <CheckCircleIcon className="h-3.5 w-3.5" /> Live
                          </span>
                        ) : s.isActive ? (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">Scheduled</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            <XCircleIcon className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      {canWrite && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-slate-100 transition">
                            <PencilIcon className="h-4 w-4 text-slate-500" />
                          </button>
                          <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg hover:bg-red-50 transition">
                            <TrashIcon className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{editing ? "Edit Sale" : "Create Sale"}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Name *</label>
                    <input value={form.name} onChange={(e) => handleField("name", e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Slug *</label>
                    <input value={form.slug} onChange={(e) => handleField("slug", e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none" placeholder="republic-day-sale" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Description</label>
                  <input value={form.description} onChange={(e) => handleField("description", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Start Date *</label>
                    <input type="datetime-local" value={form.startDate} onChange={(e) => handleField("startDate", e.target.value)} required className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">End Date *</label>
                    <input type="datetime-local" value={form.endDate} onChange={(e) => handleField("endDate", e.target.value)} required className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none" />
                  </div>
                </div>

                {/* Categories */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase">Category Discounts</label>
                    <button type="button" onClick={addCategory} className="text-xs font-bold text-orange-600 hover:underline">+ Add Category</button>
                  </div>
                  <div className="space-y-2">
                    {form.categories.map((cat, idx) => (
                      <div key={idx} className="flex gap-1.5 sm:gap-2 items-center">
                        <select
                          value={cat.category}
                          onChange={(e) => handleCatField(idx, "category", e.target.value)}
                          className="flex-1 px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
                        >
                          <option value="">Select category</option>
                          {productCategories
                            .filter((c) => c === cat.category || !form.categories.some((fc, fi) => fi !== idx && fc.category.toLowerCase() === c.toLowerCase()))
                            .map((c) => (
                              <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())}</option>
                            ))}
                        </select>
                        <input
                          type="number"
                          value={cat.discountPercent}
                          onChange={(e) => handleCatField(idx, "discountPercent", e.target.value)}
                          placeholder="Disc %"
                          min="1"
                          max="95"
                          className="w-16 sm:w-20 px-2 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
                        />
                        <input
                          type="number"
                          value={cat.primeDiscountPercent}
                          onChange={(e) => handleCatField(idx, "primeDiscountPercent", e.target.value)}
                          placeholder="Prime %"
                          min="0"
                          max="95"
                          className="w-16 sm:w-20 px-2 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
                        />
                        {form.categories.length > 1 && (
                          <button type="button" onClick={() => removeCategory(idx)} className="text-red-400 hover:text-red-600 transition p-1 shrink-0">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => handleField("isActive", e.target.checked)} className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">Active</span>
                </label>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-black transition disabled:opacity-50 shadow-xs">
                    {saving ? "Saving..." : editing ? "Update Sale" : "Create Sale"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
