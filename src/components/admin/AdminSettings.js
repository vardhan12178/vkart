import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../axiosInstance";
import { useOutletContext } from "react-router-dom";
import {
  UserCircleIcon,
  OfficeBuildingIcon,
  SaveIcon,
  CheckCircleIcon,
  PhotographIcon,
  MailIcon,
  PhoneIcon,
  XCircleIcon
} from "@heroicons/react/outline";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Get refresh function from AdminLayout
  const { refreshProfile } = useOutletContext() || {};

  // --- State Management ---
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "Super Admin", // Assuming role is static or comes from elsewhere, not specified in GET API, keeping default
    avatar: "", // URL from API
  });

  const [store, setStore] = useState({
    storeName: "",
    tagline: "",
    supportEmail: "",
    supportPhone: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    storeLogo: "", // URL from API
  });

  // File objects for uploads
  const [storeLogoFile, setStoreLogoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Previews
  const [storeLogoPreview, setStoreLogoPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Hidden file inputs
  const logoInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // --- Initial Data Load ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/settings");
        const { store: storeData, admin: adminData } = response.data;

        if (storeData) {
          setStore((prev) => ({
            ...prev,
            ...storeData,
          }));
          if (storeData.storeLogo) {
            setStoreLogoPreview(storeData.storeLogo);
          }
        }

        if (adminData) {
          setProfile((prev) => ({
            ...prev,
            name: adminData.name || "",
            email: adminData.email || "",
            avatar: adminData.profileImage || "",
          }));
          if (adminData.profileImage) {
            setAvatarPreview(adminData.profileImage);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        showToast("error", "Failed to load settings.");
      }
    };

    fetchSettings();
  }, []);

  // --- Handlers ---

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast("error", "Image size must be less than 2MB.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      if (type === "storeLogo") {
        setStoreLogoFile(file);
        setStoreLogoPreview(previewUrl);
      } else if (type === "avatar") {
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      if (activeTab === "store") {
        formData.append("storeName", store.storeName);
        formData.append("tagline", store.tagline);
        formData.append("supportEmail", store.supportEmail);
        formData.append("supportPhone", store.supportPhone);
        if (storeLogoFile) {
          formData.append("storeLogo", storeLogoFile);
        }

        await axiosInstance.put("/api/admin/settings/store", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Store settings saved successfully.");

        // Refresh profile if logo might affect it (unlikely but safe)
        if (storeLogoFile && refreshProfile) refreshProfile();

      } else if (activeTab === "profile") {
        formData.append("name", profile.name);
        formData.append("email", profile.email);
        if (avatarFile) {
          formData.append("profileImage", avatarFile);
        }

        await axiosInstance.put("/api/admin/settings/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Profile updated successfully.");

        // Refresh profile in Header
        if (refreshProfile) refreshProfile();

      }

    } catch (error) {
      console.error("Save failed:", error);
      const msg = error.response?.data?.message || "Failed to save settings.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "store", label: "Store General", icon: OfficeBuildingIcon, description: "Name, contact & branding" },
    { id: "profile", label: "My Profile", icon: UserCircleIcon, description: "Your personal admin info" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage your store configuration and preferences.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm font-bold disabled:opacity-70"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
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

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-start gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 outline-none group relative overflow-hidden
                      ${isActive
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                      }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl"></div>}
                    <Icon className={`h-6 w-6 flex-shrink-0 mt-0.5 transition-colors ${isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <div>
                      <span className={`block text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>{tab.label}</span>
                      <span className="block text-[11px] font-medium text-slate-400 mt-0.5">{tab.description}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">

            {/* --- STORE GENERAL TAB --- */}
            {activeTab === "store" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Branding Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <OfficeBuildingIcon className="h-5 w-5 text-slate-400" />
                    Store Branding
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputGroup
                        label="Store Name"
                        value={store.storeName}
                        onChange={(e) => setStore({ ...store, storeName: e.target.value })}
                        placeholder="e.g. VKart"
                      />
                      <InputGroup
                        label="Tagline"
                        value={store.tagline}
                        onChange={(e) => setStore({ ...store, tagline: e.target.value })}
                        placeholder="e.g. Premium Lifestyle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Store Logo</label>
                      <div className="flex items-center gap-6">
                        <div
                          className="h-24 w-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group hover:border-orange-300 hover:text-orange-500 transition-colors cursor-pointer overflow-hidden relative"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          {storeLogoPreview ? (
                            <img src={storeLogoPreview} alt="Logo Preview" className="h-full w-full object-contain" />
                          ) : (
                            <PhotographIcon className="h-8 w-8" />
                          )}
                        </div>
                        <div className="space-y-3">
                          <button
                            onClick={() => logoInputRef.current?.click()}
                            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            Upload New Logo
                          </button>
                          <input
                            type="file"
                            ref={logoInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, "storeLogo")}
                          />
                          <p className="text-xs text-slate-400 font-medium">Recommended: 512x512px (PNG/JPG). Max 2MB.</p>
                        </div>
                      </div>
                    </div>
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
                    />
                    <InputGroup
                      label="Support Phone"
                      value={store.supportPhone}
                      onChange={(e) => setStore({ ...store, supportPhone: e.target.value })}
                      icon={<PhoneIcon className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- PROFILE TAB --- */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5 text-slate-400" />
                    Personal Profile
                  </h2>

                  <div className="flex items-center gap-6 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="relative">
                      <div
                        className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-sm overflow-hidden cursor-pointer hover:opacity-90"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          profile.name.charAt(0)
                        )}
                      </div>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "avatar")}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{profile.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 mt-2">
                        {profile.role}
                      </span>
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="ml-auto text-sm text-orange-600 font-bold hover:text-orange-700"
                    >
                      Change Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                    <InputGroup
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                    <InputGroup
                      label="Email Address"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      icon={<MailIcon className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button Mobile (Sticky) */}
            <div className="mt-8 sm:hidden sticky bottom-4 z-10">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white transition-all shadow-xl active:scale-95 text-sm font-bold disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Helper Components ----------------------------- */

function InputGroup({ label, icon, className = "", ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-400 
            focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-white
            ${icon ? "pl-10 pr-4" : "px-4"}
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}

