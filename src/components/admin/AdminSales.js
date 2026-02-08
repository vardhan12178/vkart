import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";

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
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySale);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [productCategories, setProductCategories] = useState([]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await axiosInstance.get("/api/sales");
      setSales(res?.data || []);
    } catch {
      setError("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Fetch unique product categories for dropdown
    (async () => {
      try {
        const res = await axiosInstance.get("/api/products", { params: { limit: 500 } });
        const products = res.data?.products || [];
        const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
        setProductCategories(unique.sort());
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    })();
  }, []);

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
    setSaving(true);
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
      if (editing) {
        await axiosInstance.put(`/api/sales/${editing}`, payload);
        showToast("Sale updated");
      } else {
        await axiosInstance.post("/api/sales", payload);
        showToast("Sale created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await axiosInstance.delete(`/api/sales/${id}`);
      showToast("Sale deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const isActive = (s) => s.isActive && new Date() >= new Date(s.startDate) && new Date() <= new Date(s.endDate);

  return (
    <div className="space-y-6 p-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Sales & Promotions</h1>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <RefreshIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition">
            <PlusIcon className="h-4 w-4" /> New Sale
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : sales.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No sales created yet</p>
          <button onClick={openCreate} className="text-sm font-bold text-orange-600 hover:underline">Create your first sale</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Sale</th>
                  <th className="px-6 py-4 text-left">Categories</th>
                  <th className="px-6 py-4 text-left">Duration</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.categories.map((c, i) => (
                          <span key={i} className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {c.category} ({c.discountPercent}%{c.primeDiscountPercent ? ` / P:${c.primeDiscountPercent}%` : ""})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div>{new Date(s.startDate).toLocaleDateString()}</div>
                      <div>→ {new Date(s.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isActive(s) ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Live
                        </span>
                      ) : s.isActive ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Scheduled</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          <XCircleIcon className="h-3.5 w-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                          <PencilIcon className="h-4 w-4 text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg hover:bg-red-50 transition">
                          <TrashIcon className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{editing ? "Edit Sale" : "Create Sale"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                  <input value={form.name} onChange={(e) => handleField("name", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Slug</label>
                  <input value={form.slug} onChange={(e) => handleField("slug", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400" placeholder="republic-day-sale" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                <input value={form.description} onChange={(e) => handleField("description", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => handleField("startDate", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => handleField("endDate", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Category Discounts</label>
                  <button type="button" onClick={addCategory} className="text-xs font-bold text-orange-600 hover:underline">+ Add Category</button>
                </div>
                <div className="space-y-2">
                  {form.categories.map((cat, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={cat.category}
                        onChange={(e) => handleCatField(idx, "category", e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
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
                        className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="number"
                        value={cat.primeDiscountPercent}
                        onChange={(e) => handleCatField(idx, "primeDiscountPercent", e.target.value)}
                        placeholder="Prime %"
                        min="0"
                        max="95"
                        className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                      {form.categories.length > 1 && (
                        <button type="button" onClick={() => removeCategory(idx)} className="text-red-400 hover:text-red-600 transition p-1">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => handleField("isActive", e.target.checked)} className="rounded" />
                <span className="text-sm font-bold text-gray-700">Active</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black transition disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Sale" : "Create Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
