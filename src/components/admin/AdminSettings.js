import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import {
  OfficeBuildingIcon,
  SaveIcon,
  CheckCircleIcon,
  MailIcon,
  PhoneIcon,
  XCircleIcon
} from "@heroicons/react/outline";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import InputGroup from "./ui/InputGroup";

// Store-level configuration only. Personal account info (name/email/avatar)
// lives on the Profile page instead — it isn't gated by the "settings"
// module, since every employee should be able to manage their own account
// regardless of what else they have access to.
//
// Note: Store Name / Tagline / Support Email / Support Phone are the only
// fields here because they're the only ones anything actually reads —
// they feed the "Sold by" block on order invoice PDFs (backend/utils/invoicePdf.js).
// A store logo upload used to live here too but was stripped: it saved fine
// but was never rendered anywhere (not the storefront, not invoices, not
// emails), so it was dead weight.
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
    <div className="premium-admin-page min-h-screen bg-transparent p-4 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Shown on order invoices sent to customers.
            </p>
          </div>
          {canWrite && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm font-bold disabled:opacity-70"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-white border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "border-red-100 text-red-800" : "border-emerald-100 text-emerald-800"
            }`}>
            {toast.type === "error" ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            )}
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        )}

        <div className="space-y-6">

          {/* Store Identity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <OfficeBuildingIcon className="h-5 w-5 text-slate-400" />
              Store Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                placeholder="e.g. Premium Lifestyle"
                disabled={!canWrite}
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PhoneIcon className="h-5 w-5 text-slate-400" />
              Support Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputGroup
                label="Support Email"
                type="email"
                value={store.supportEmail}
                onChange={(e) => setStore({ ...store, supportEmail: e.target.value })}
                icon={<MailIcon className="h-4 w-4" />}
                disabled={!canWrite}
              />
              <InputGroup
                label="Support Phone"
                value={store.supportPhone}
                onChange={(e) => setStore({ ...store, supportPhone: e.target.value })}
                icon={<PhoneIcon className="h-4 w-4" />}
                disabled={!canWrite}
              />
            </div>
          </div>

          {/* Save Button Mobile (Sticky) */}
          {canWrite && (
            <div className="sm:hidden sticky bottom-4 z-10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white transition-all shadow-xl active:scale-95 text-sm font-bold disabled:opacity-70"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
