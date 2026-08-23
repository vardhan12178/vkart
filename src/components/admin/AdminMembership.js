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
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("membership");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const plansQuery = useQuery({
    queryKey: qk.admin.membershipPlans,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/membership/admin/plans");
      return res?.data || [];
    },
  });

  const savePlanMutation = useMutation({
    mutationFn: async ({ payload, planId }) => {
      if (planId) return axiosInstance.put(`/api/membership/admin/plans/${planId}`, payload);
      return axiosInstance.post("/api/membership/admin/plans", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.membershipPlans });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId) => axiosInstance.delete(`/api/membership/admin/plans/${planId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.membershipPlans });
    },
  });

  useEffect(() => {
    if (plansQuery.isError) {
      showToast("Failed to load plans", "error");
    }
  }, [plansQuery.isError]);

  const plans = plansQuery.data || [];
  const loading = plansQuery.isLoading;
  const error = plansQuery.isError ? "Failed to load plans" : "";
  const saving = savePlanMutation.isPending;

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
    try {
      const payload = {
        ...form,
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        features: form.features.filter((f) => f.trim()),
      };
      await savePlanMutation.mutateAsync({ payload, planId: editing });
      showToast(editing ? "Plan updated" : "Plan created");
      setShowForm(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deletePlanMutation.mutateAsync(id);
      showToast("Plan deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

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
              Prime Membership Plans
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 font-medium">{plans.length} subscription tiers</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => plansQuery.refetch()}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs text-slate-600"
              title="Refresh"
            >
              <RefreshIcon className={`h-4 w-4 ${plansQuery.isFetching ? "animate-spin" : ""}`} />
            </button>
            {canWrite && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shadow-xs shrink-0 whitespace-nowrap"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New Plan</span>
                <span className="sm:hidden">Plan</span>
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

        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/70 shadow-xs text-slate-400">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <p className="text-base font-bold text-slate-900 mb-1">No plans created yet</p>
            <p className="text-xs sm:text-sm text-slate-500 mb-4">Create your first membership tier to offer premium perks.</p>
            {canWrite && (
              <button onClick={openCreate} className="text-xs sm:text-sm font-bold text-orange-600 hover:underline">Create your first plan</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`bg-white rounded-2xl p-4 sm:p-6 border ${
                  plan.isPopular ? "border-amber-400 ring-1 ring-amber-400/30" : "border-slate-200/70"
                } shadow-xs space-y-3 relative flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div>
                  {/* Top line: Name, duration, and status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">{plan.name}</h3>
                        {plan.isPopular && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.2 rounded-full">
                            ★ Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{plan.slug} · {plan.durationDays} days</p>
                    </div>
                    {plan.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircleIcon className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                        <XCircleIcon className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 py-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{INR(plan.price)}</span>
                    {plan.originalPrice > plan.price && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">{INR(plan.originalPrice)}</span>
                    )}
                  </div>

                  {/* Features List */}
                  {plan.features?.length > 0 && (
                    <ul className="space-y-1.5 pt-1 border-t border-slate-100">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-[11px] sm:text-xs text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Actions Footer */}
                {canWrite && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openEdit(plan)}
                      className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition flex items-center justify-center"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{editing ? "Edit Plan" : "Create Plan"}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Name *</label>
                    <input value={form.name} onChange={(e) => handleField("name", e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none" placeholder="Monthly" />
                  </div>
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Slug *</label>
                    <input value={form.slug} onChange={(e) => handleField("slug", e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none" placeholder="monthly" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Duration (days)</label>
                    <input type="number" value={form.durationDays} onChange={(e) => handleField("durationDays", e.target.value)} required min="1" className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Price (₹)</label>
                    <input type="number" value={form.price} onChange={(e) => handleField("price", e.target.value)} required min="0" className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">Original ₹</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => handleField("originalPrice", e.target.value)} min="0" className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none" placeholder="Optional" />
                  </div>
                </div>

                {/* Features */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs font-bold text-orange-600 hover:underline">+ Add Feature</button>
                  </div>
                  <div className="space-y-2">
                    {form.features.map((f, idx) => (
                      <div key={idx} className="flex gap-1.5 sm:gap-2">
                        <input value={f} onChange={(e) => handleFeature(idx, e.target.value)} placeholder="Feature perk text" className="flex-1 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none" />
                        {form.features.length > 1 && (
                          <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPopular} onChange={(e) => handleField("isPopular", e.target.checked)} className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700">Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => handleField("isActive", e.target.checked)} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700">Active</span>
                  </label>
                  <div className="ml-auto flex items-center gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Sort</label>
                    <input type="number" value={form.sortOrder} onChange={(e) => handleField("sortOrder", e.target.value)} className="w-14 px-2 py-1 rounded-xl border border-slate-200 text-xs font-bold text-center bg-slate-50/50" />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-black transition disabled:opacity-50 shadow-xs">
                    {saving ? "Saving..." : editing ? "Update Plan" : "Create Plan"}
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
