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
  ExclamationCircleIcon,
} from "@heroicons/react/outline";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";

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
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("coupons");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const couponsQuery = useQuery({
    queryKey: qk.admin.coupons,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/coupons/all");
      return res?.data?.coupons || [];
    },
  });

  const saveCouponMutation = useMutation({
    mutationFn: async ({ payload, couponId }) => {
      if (couponId) {
        return axiosInstance.patch(`/api/coupons/${couponId}`, payload);
      }
      return axiosInstance.post("/api/coupons", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.coupons });
      queryClient.invalidateQueries({ queryKey: qk.public.coupons });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId) => axiosInstance.delete(`/api/coupons/${couponId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.coupons });
      queryClient.invalidateQueries({ queryKey: qk.public.coupons });
    },
  });

  const toggleCouponMutation = useMutation({
    mutationFn: async ({ couponId, isActive }) => axiosInstance.patch(`/api/coupons/${couponId}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.coupons });
      queryClient.invalidateQueries({ queryKey: qk.public.coupons });
    },
  });

  useEffect(() => {
    if (couponsQuery.isError) {
      showToast("Failed to load coupons", "error");
    }
  }, [couponsQuery.isError]);

  const coupons = couponsQuery.data || [];
  const loading = couponsQuery.isLoading;
  const error = couponsQuery.isError ? "Failed to load coupons" : "";
  const saving = saveCouponMutation.isPending;

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
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
      };

      await saveCouponMutation.mutateAsync({ payload, couponId: editing });
      showToast(editing ? "Coupon updated" : "Coupon created");
      setShowForm(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteCouponMutation.mutateAsync(id);
      showToast("Coupon deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const toggleActive = async (c) => {
    try {
      await toggleCouponMutation.mutateAsync({ couponId: c._id, isActive: !c.isActive });
    } catch {
      showToast("Update failed", "error");
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const isExpired = (d) => d && new Date(d) < new Date();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {toast && (
          <div className={`fixed z-50 top-5 right-5 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "bg-white border-red-100 text-red-800" : "bg-white border-emerald-100 text-emerald-800"}`}>
            {toast.type === "error" ? <ExclamationCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Coupons
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">{coupons.length} total coupons</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => couponsQuery.refetch()}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs"
              title="Refresh"
            >
              <RefreshIcon className={`h-4 w-4 text-slate-600 ${couponsQuery.isFetching ? "animate-spin" : ""}`} />
            </button>
            {canWrite && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition shadow-xs shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Coupon</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Coupon Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{editing ? "Edit Coupon" : "Create Coupon"}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Code *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE10" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white" />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to users at checkout" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none bg-slate-50/50 focus:bg-white" />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Value *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percent" ? "e.g. 10" : "e.g. 100"} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                </div>

                {form.type === "percent" && (
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Max Discount (₹)</label>
                    <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No cap" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                  </div>
                )}

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Min Order (₹)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Per User Limit</label>
                  <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} placeholder="1" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Valid From</label>
                  <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 block">Valid To *</label>
                  <input type="datetime-local" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  Show at checkout
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shadow-xs disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coupons List / Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/70 shadow-xs text-slate-400">
            <p className="text-base font-bold text-slate-900">No coupons yet</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Create your first coupon to offer discounts to customers.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            {/* Mobile Card List (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {coupons.map((c) => (
                <div key={c._id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50 transition">
                  {/* Top Row: Code + Status Pills */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 border border-dashed border-slate-300 px-2 py-0.5 rounded-lg tracking-wider">
                      {c.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {canWrite ? (
                        <button onClick={() => toggleActive(c)} className="inline-flex items-center gap-1">
                          {c.isActive && !isExpired(c.validTo) ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircleIcon className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              <XCircleIcon className="h-3 w-3" /> {isExpired(c.validTo) ? "Expired" : "Inactive"}
                            </span>
                          )}
                          {c.isPublic && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">Public</span>
                          )}
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          {c.isActive && !isExpired(c.validTo) ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircleIcon className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              <XCircleIcon className="h-3 w-3" /> {isExpired(c.validTo) ? "Expired" : "Inactive"}
                            </span>
                          )}
                          {c.isPublic && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Public</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Info: Value & Terms */}
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                      </span>
                      {c.maxDiscount && (
                        <span className="text-[10px] font-bold text-slate-500">Max ₹{c.maxDiscount}</span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
                      {c.minOrder ? <span>Min Order: ₹{c.minOrder}</span> : <span>No min order</span>}
                      <span>·</span>
                      <span>Used: {c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ""}</span>
                    </div>

                    {c.description && (
                      <p className="text-[11px] text-slate-600 italic mt-0.5">{c.description}</p>
                    )}
                  </div>

                  {/* Bottom Row: Validity & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-medium ${isExpired(c.validTo) ? "text-red-500 font-bold" : "text-slate-400"}`}>
                      Valid till: {fmt(c.validTo)}
                    </span>

                    {canWrite && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <PencilIcon className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <TrashIcon className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-4">Code</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Value</th>
                    <th className="px-5 py-4">Min Order</th>
                    <th className="px-5 py-4">Used</th>
                    <th className="px-5 py-4">Valid Until</th>
                    <th className="px-5 py-4">Status</th>
                    {canWrite && <th className="px-5 py-4 text-right">Actions</th>}
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
                        {canWrite ? (
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
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
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
                          </div>
                        )}
                      </td>
                      {canWrite && (
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
                      )}
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
