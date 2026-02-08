import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

const empty = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minOrder: "",
  usageLimit: "",
  perUserLimit: "1",
  validFrom: "",
  validTo: "",
  isPublic: false,
  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
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
      const res = await axiosInstance.get("/api/coupons/all");
      setCoupons(res?.data?.coupons || []);
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      code: c.code || "",
      description: c.description || "",
      type: c.type || "percent",
      value: c.value ?? "",
      maxDiscount: c.maxDiscount ?? "",
      minOrder: c.minOrder ?? "",
      usageLimit: c.usageLimit ?? "",
      perUserLimit: c.perUserLimit ?? "1",
      validFrom: c.validFrom ? c.validFrom.slice(0, 16) : "",
      validTo: c.validTo ? c.validTo.slice(0, 16) : "",
      isPublic: !!c.isPublic,
      isActive: c.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.type || !form.value || !form.validTo) {
      showToast("Code, type, value and expiry date are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
      };

      if (editing) {
        await axiosInstance.patch(`/api/coupons/${editing}`, payload);
        showToast("Coupon updated");
      } else {
        await axiosInstance.post("/api/coupons", payload);
        showToast("Coupon created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axiosInstance.delete(`/api/coupons/${id}`);
      showToast("Coupon deleted");
      load();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const toggleActive = async (c) => {
    try {
      await axiosInstance.patch(`/api/coupons/${c._id}`, { isActive: !c.isActive });
      load();
    } catch {
      showToast("Update failed", "error");
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const isExpired = (d) => d && new Date(d) < new Date();

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {toast && (
          <div className={`fixed z-50 top-5 right-5 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "bg-white border-red-100 text-red-800" : "bg-white border-emerald-100 text-emerald-800"}`}>
            {toast.type === "error" ? <ExclamationCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
            <p className="text-sm text-slate-500 mt-1">{coupons.length} total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              <RefreshIcon className="h-4 w-4 text-slate-600" />
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm">
              <PlusIcon className="h-4 w-4" /> New Coupon
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5" /> {error}
          </div>
        )}

        {/* Coupon Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Coupon" : "Create Coupon"}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Code *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE10" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300" />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to users" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Value *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percent" ? "e.g. 10" : "e.g. 100"} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                </div>

                {form.type === "percent" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Max Discount (₹)</label>
                    <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No cap" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Min Order (₹)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Per User Limit</label>
                  <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} placeholder="1" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Valid From</label>
                  <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Valid To *</label>
                  <input type="datetime-local" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  Show to users at checkout
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coupons Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-semibold">No coupons yet</p>
            <p className="text-sm mt-1">Create your first coupon to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-4">Code</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Value</th>
                    <th className="px-5 py-4">Min Order</th>
                    <th className="px-5 py-4">Used</th>
                    <th className="px-5 py-4">Valid Until</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{c.code}</div>
                        {c.description && <div className="text-xs text-slate-400 mt-0.5">{c.description}</div>}
                      </td>
                      <td className="px-5 py-4 capitalize">{c.type}</td>
                      <td className="px-5 py-4 font-semibold">
                        {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                        {c.maxDiscount && <span className="text-xs text-slate-400 block">max ₹{c.maxDiscount}</span>}
                      </td>
                      <td className="px-5 py-4">{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
                      <td className="px-5 py-4">
                        {c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="px-5 py-4">
                        <span className={isExpired(c.validTo) ? "text-red-500" : ""}>{fmt(c.validTo)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleActive(c)} className="inline-flex items-center gap-1.5">
                          {c.isActive && !isExpired(c.validTo) ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircleIcon className="h-3.5 w-3.5" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                              <XCircleIcon className="h-3.5 w-3.5" /> {isExpired(c.validTo) ? "Expired" : "Inactive"}
                            </span>
                          )}
                          {c.isPublic && (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Public</span>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-slate-100 transition">
                            <PencilIcon className="h-4 w-4 text-slate-500" />
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg hover:bg-red-50 transition">
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
      </div>
    </div>
  );
}
