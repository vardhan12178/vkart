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

const emptyPlan = {
  name: "",
  slug: "",
  durationDays: "",
  price: "",
  originalPrice: "",
  features: [""],
  isPopular: false,
  isActive: true,
  sortOrder: 0,
};

const INR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n));

export default function AdminMembership() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await axiosInstance.get("/api/membership/admin/plans");
      setPlans(res?.data || []);
    } catch {
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan);
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditing(plan._id);
    setForm({
      name: plan.name,
      slug: plan.slug,
      durationDays: plan.durationDays,
      price: plan.price,
      originalPrice: plan.originalPrice || "",
      features: plan.features?.length ? plan.features : [""],
      isPopular: plan.isPopular || false,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder || 0,
    });
    setShowForm(true);
  };

  const handleField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleFeature = (idx, val) => {
    setForm((p) => {
      const feats = [...p.features];
      feats[idx] = val;
      return { ...p, features: feats };
    });
  };

  const addFeature = () => setForm((p) => ({ ...p, features: [...p.features, ""] }));

  const removeFeature = (idx) => setForm((p) => ({ ...p, features: p.features.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        features: form.features.filter((f) => f.trim()),
      };
      if (editing) {
        await axiosInstance.put(`/api/membership/admin/plans/${editing}`, payload);
        showToast("Plan updated");
      } else {
        await axiosInstance.post("/api/membership/admin/plans", payload);
        showToast("Plan created");
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
    if (!window.confirm("Delete this plan?")) return;
    try {
      await axiosInstance.delete(`/api/membership/admin/plans/${id}`);
      showToast("Plan deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Prime Membership Plans</h1>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <RefreshIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition">
            <PlusIcon className="h-4 w-4" /> New Plan
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No plans created yet</p>
          <button onClick={openCreate} className="text-sm font-bold text-orange-600 hover:underline">Create your first plan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className={`bg-white rounded-2xl p-6 border-2 ${plan.isPopular ? "border-amber-400" : "border-gray-100"} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.slug} · {plan.durationDays} days</p>
                </div>
                {plan.isActive ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-gray-300" />
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-gray-900">{INR(plan.price)}</span>
                {plan.originalPrice > plan.price && (
                  <span className="text-sm text-gray-400 line-through">{INR(plan.originalPrice)}</span>
                )}
              </div>

              {plan.features?.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}

              {plan.isPopular && (
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mb-3">★ Popular</span>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(plan)} className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1">
                  <PencilIcon className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(plan._id)} className="py-2 px-3 rounded-lg border border-red-100 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{editing ? "Edit Plan" : "Create Plan"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                  <input value={form.name} onChange={(e) => handleField("name", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Monthly" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Slug</label>
                  <input value={form.slug} onChange={(e) => handleField("slug", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="monthly" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duration (days)</label>
                  <input type="number" value={form.durationDays} onChange={(e) => handleField("durationDays", e.target.value)} required min="1" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price (₹)</label>
                  <input type="number" value={form.price} onChange={(e) => handleField("price", e.target.value)} required min="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Original ₹</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => handleField("originalPrice", e.target.value)} min="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Strikethrough" />
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Features</label>
                  <button type="button" onClick={addFeature} className="text-xs font-bold text-orange-600 hover:underline">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.features.map((f, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={f} onChange={(e) => handleFeature(idx, e.target.value)} placeholder="Feature text" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                      {form.features.length > 1 && (
                        <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600 p-1">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPopular} onChange={(e) => handleField("isPopular", e.target.checked)} className="rounded" />
                  <span className="text-sm font-bold text-gray-700">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => handleField("isActive", e.target.checked)} className="rounded" />
                  <span className="text-sm font-bold text-gray-700">Active</span>
                </label>
                <div className="ml-auto">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Sort</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => handleField("sortOrder", e.target.value)} className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black transition disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
