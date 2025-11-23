import React, { useState } from "react";
import {
  UserCircleIcon,
  OfficeBuildingIcon,
  SaveIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CreditCardIcon,
  PhotographIcon,
  MailIcon,
  PhoneIcon,
  DocumentTextIcon,
  IdentificationIcon,
  GlobeAltIcon,
  LockClosedIcon,
  BellIcon
} from "@heroicons/react/outline";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // --- State Management ---
  const [profile, setProfile] = useState({
    name: "Bala Vardhan",
    email: "balavardhan12178@gmail.com",
    role: "Super Admin",
    avatar: "",
  });

  const [store, setStore] = useState({
    storeName: "VKart",
    tagline: "Premium Lifestyle Store",
    supportEmail: "support@vkartshop.in",
    supportPhone: "+91 99999 12345",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const [legal, setLegal] = useState({
    businessName: "VKart Retail Pvt Ltd",
    gstNumber: "29ABCDE1234F1Z5",
    invoiceNote: "Thank you for shopping with VKart!",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    twoFactor: true,
    emailNotifications: true,
  });

  // --- Handlers ---
  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setToast("Settings updated successfully.");
      setTimeout(() => setToast(null), 3000);
    }, 800);
  };

  const tabs = [
    { id: "store", label: "Store General", icon: OfficeBuildingIcon, description: "Name, contact & branding" },
    { id: "legal", label: "Billing & Legal", icon: DocumentTextIcon, description: "Invoice details & GST" },
    { id: "profile", label: "My Profile", icon: UserCircleIcon, description: "Your personal admin info" },
    { id: "security", label: "Security", icon: ShieldCheckIcon, description: "Password & 2FA" },
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
            Save Changes
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-white border border-emerald-100 text-emerald-800 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-bold">{toast}</span>
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
                        onChange={(e) => setStore({...store, storeName: e.target.value})}
                        placeholder="e.g. VKart"
                      />
                      <InputGroup 
                        label="Tagline" 
                        value={store.tagline} 
                        onChange={(e) => setStore({...store, tagline: e.target.value})}
                        placeholder="e.g. Premium Lifestyle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Store Logo</label>
                      <div className="flex items-center gap-6">
                        <div className="h-24 w-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group hover:border-orange-300 hover:text-orange-500 transition-colors cursor-pointer">
                          <PhotographIcon className="h-8 w-8" />
                        </div>
                        <div className="space-y-3">
                          <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm">
                            Upload New Logo
                          </button>
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
                      onChange={(e) => setStore({...store, supportEmail: e.target.value})}
                      icon={<MailIcon className="h-4 w-4" />}
                    />
                    <InputGroup 
                      label="Support Phone" 
                      value={store.supportPhone} 
                      onChange={(e) => setStore({...store, supportPhone: e.target.value})}
                      icon={<PhoneIcon className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- LEGAL TAB --- */}
            {activeTab === "legal" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-slate-400" />
                    Invoice Details
                  </h2>

                  <div className="space-y-6 max-w-2xl">
                    <InputGroup 
                      label="Registered Business Name" 
                      value={legal.businessName} 
                      onChange={(e) => setLegal({...legal, businessName: e.target.value})}
                      icon={<IdentificationIcon className="h-4 w-4" />}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputGroup 
                        label="GST / Tax ID" 
                        value={legal.gstNumber} 
                        onChange={(e) => setLegal({...legal, gstNumber: e.target.value})}
                        placeholder="Optional"
                      />
                      <InputGroup 
                        label="Currency" 
                        value={store.currency} 
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Invoice Footer Note</label>
                      <textarea 
                        value={legal.invoiceNote}
                        onChange={(e) => setLegal({...legal, invoiceNote: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-2 font-medium">Visible at the bottom of customer invoices.</p>
                    </div>
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
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-sm">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{profile.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 mt-2">
                        {profile.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                    <InputGroup 
                      label="Full Name" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                    <InputGroup 
                      label="Email Address" 
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled
                      className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      icon={<MailIcon className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 2FA Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                   <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-slate-400" />
                    Access Control
                  </h2>
                  
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <LockClosedIcon className="h-5 w-5" />
                       </div>
                       <div>
                          <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Add an extra layer of security to your account.</p>
                       </div>
                    </div>
                    <ToggleSwitch 
                      enabled={security.twoFactor} 
                      onChange={() => setSecurity({...security, twoFactor: !security.twoFactor})} 
                    />
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <BellIcon className="h-5 w-5" />
                       </div>
                       <div>
                          <h3 className="text-sm font-bold text-slate-900">Login Notifications</h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Receive email alerts for new logins.</p>
                       </div>
                    </div>
                    <ToggleSwitch 
                      enabled={security.emailNotifications} 
                      onChange={() => setSecurity({...security, emailNotifications: !security.emailNotifications})} 
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-6">Change Password</h2>
                  <div className="max-w-xl space-y-5">
                    <InputGroup 
                      label="Current Password" 
                      type="password" 
                      placeholder="••••••••"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputGroup 
                        label="New Password" 
                        type="password" 
                        placeholder="••••••••"
                      />
                      <InputGroup 
                        label="Confirm Password" 
                        type="password" 
                        placeholder="••••••••"
                      />
                    </div>
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
                {loading ? "Saving..." : "Save Changes"}
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

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
        enabled ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}