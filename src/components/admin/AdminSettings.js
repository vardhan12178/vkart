import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import {
  OfficeBuildingIcon,
  SaveIcon,
  CheckCircleIcon,
  MailIcon,
  PhoneIcon,
  XCircleIcon,
  DocumentTextIcon,
  SparklesIcon
} from "@heroicons/react/outline";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import InputGroup from "./ui/InputGroup";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("settings");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [store, setStore] = useState({
    storeName: "",
    tagline: "",
    supportEmail: "",
    supportPhone: "",
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const settingsQuery = useQuery({
    queryKey: qk.admin.settings,
    queryFn: async () => {
      const response = await axiosInstance.get("/api/admin/settings");
      return response.data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (payload) => axiosInstance.put("/api/admin/settings/store", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.settings });
    },
  });

  useEffect(() => {
    const storeData = settingsQuery.data?.store;
    if (!storeData) return;
    setStore((prev) => ({ ...prev, ...storeData }));
  }, [settingsQuery.data]);

  useEffect(() => {
    if (settingsQuery.isError) {
      showToast("error", "Failed to load settings.");
    }
  }, [settingsQuery.isError]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettingsMutation.mutateAsync({
        storeName: store.storeName,
        tagline: store.tagline,
        supportEmail: store.supportEmail,
        supportPhone: store.supportPhone,
      });
      showToast("success", "Store settings saved successfully.");
    } catch (error) {
      console.error("Save failed:", error);
      const msg = error.response?.data?.message || "Failed to save settings.";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* Header with Inline Responsive Save CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              Store Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium truncate">
              Shown on order invoices sent to customers.
            </p>
          </div>
          {canWrite && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-xs active:scale-95 text-xs sm:text-sm font-bold shrink-0 disabled:opacity-60"
            >
              {saving ? (
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
              <span className="sm:hidden">{saving ? "Saving" : "Save"}</span>
            </button>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-white border shadow-xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "border-red-100 text-red-800" : "border-emerald-100 text-emerald-800"}`}>
            {toast.type === "error" ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">

          {/* Store Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <OfficeBuildingIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Store Identity
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Business branding used on receipts and invoices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup
                label="Store Name"
                value={store.storeName}
                onChange={(e) => setStore({ ...store, storeName: e.target.value })}
                placeholder="e.g. VKart"
                disabled={!canWrite}
              />
              <InputGroup
                label="Tagline"
                value={store.tagline}
                onChange={(e) => setStore({ ...store, tagline: e.target.value })}
                placeholder="e.g. Premium Lifestyle Store"
                disabled={!canWrite}
              />
            </div>
          </div>

          {/* Contact Section Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <PhoneIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Support Contact
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Customer assistance contacts printed on invoices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup
                label="Support Email"
                type="email"
                value={store.supportEmail}
                onChange={(e) => setStore({ ...store, supportEmail: e.target.value })}
                icon={<MailIcon className="h-4 w-4" />}
                placeholder="support@vkart.com"
                disabled={!canWrite}
              />
              <InputGroup
                label="Support Phone"
                value={store.supportPhone}
                onChange={(e) => setStore({ ...store, supportPhone: e.target.value })}
                icon={<PhoneIcon className="h-4 w-4" />}
                placeholder="+91 99999 12345"
                disabled={!canWrite}
              />
            </div>
          </div>

          {/* Live Invoice Preview Box */}
          <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl border border-slate-200/70 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <DocumentTextIcon className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Invoice Header Preview</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-3">
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{store.storeName || "Store Name"}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{store.tagline || "Tagline"}</p>
                </div>
                <div className="text-[11px] text-slate-500 sm:text-right font-medium">
                  <p>{store.supportEmail || "support@example.com"}</p>
                  <p>{store.supportPhone || "+91 00000 00000"}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono text-center sm:text-left">
                * This header is automatically printed at the top of customer PDF order receipts.
              </p>
            </div>
          </div>

          {/* Bottom Save Action Button */}
          {canWrite && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-xs active:scale-95 text-xs sm:text-sm font-bold disabled:opacity-60"
              >
                {saving ? (
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
