import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import {
  UserCircleIcon,
  MailIcon,
  SaveIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  LockClosedIcon,
} from "@heroicons/react/outline";
import axiosInstance from "../axiosInstance";
import { ROLE_LABELS, MODULES } from "../../constants/adminRoles";
import InputGroup from "./ui/InputGroup";

// Every logged-in admin — regardless of role or module permissions — can
// reach this page and edit their own account. It's intentionally not wrapped
// in RequireModule; the backend mirrors this (PUT /settings/profile only
// needs a valid admin JWT, not any specific permission).
export default function AdminProfile() {
  const { identity, adminRole, permissions, refreshProfile } = useOutletContext() || {};

  const [name, setName] = useState(identity?.name || "");
  const [email, setEmail] = useState(identity?.email || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(identity?.profileImage || null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setName(identity?.name || "");
    setEmail(identity?.email || "");
    setAvatarPreview(identity?.profileImage || null);
  }, [identity?.name, identity?.email, identity?.profileImage]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const saveMutation = useMutation({
    mutationFn: async (formData) =>
      axiosInstance.put("/api/admin/settings/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Image size must be less than 2MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Email is intentionally not sent — it's read-only (see backend
      // updateAdminProfile for why: it's the login identifier, and changing
      // it safely needs a verify-before-switch flow that doesn't exist yet).
      const formData = new FormData();
      formData.append("name", name);
      if (avatarFile) formData.append("profileImage", avatarFile);

      await saveMutation.mutateAsync(formData);
      showToast("success", "Profile updated successfully.");
      if (refreshProfile) refreshProfile();
    } catch (error) {
      console.error("Profile save failed:", error);
      showToast("error", error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = ROLE_LABELS[adminRole] || "Team Member";
  const isSuperAdmin = adminRole === "super_admin";

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-4 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">Your personal admin account details and access.</p>
        </div>

        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-white border shadow-xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "border-red-100 text-red-800" : "border-emerald-100 text-emerald-800"}`}>
            {toast.type === "error" ? <XCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span className="font-bold">{toast.message}</span>
          </div>
        )}

        {/* Personal details */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-8">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
            <UserCircleIcon className="h-5 w-5 text-slate-400" />
            Personal Details
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-3.5 sm:p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3.5 sm:gap-6 w-full sm:w-auto">
              <div className="relative shrink-0">
                <div
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-lg sm:text-xl font-bold ring-2 ring-white shadow-xs overflow-hidden cursor-pointer hover:opacity-90 transition"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      onError={() => setAvatarPreview(null)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (name || email || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{name || "Unnamed"}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{email}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 mt-1">
                  <ShieldCheckIcon className="h-3 w-3" />
                  {roleLabel}
                </span>
              </div>
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs sm:text-sm text-orange-600 font-bold hover:text-orange-700 sm:ml-auto self-end sm:self-center"
            >
              Change Photo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <InputGroup label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <InputGroup
                label="Email Address"
                value={email}
                icon={<MailIcon className="h-4 w-4" />}
                disabled
                readOnly
              />
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <LockClosedIcon className="h-3 w-3" />
                Email is your login ID and can't be changed here.
              </p>
            </div>
          </div>

          {identity?.createdAt && (
            <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <CalendarIcon className="h-3.5 w-3.5" />
              Admin since {new Date(identity.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm font-bold disabled:opacity-70"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Access summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-slate-400" />
            Your Access
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isSuperAdmin
              ? "Super admin has full read and write access to every module."
              : "What you can see and change in the admin panel. Ask a super admin if you need something changed here."}
          </p>

          {isSuperAdmin ? (
            <div className="flex flex-wrap gap-2">
              {MODULES.map((mod) => (
                <span key={mod.key} className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                  {mod.label} · write
                </span>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODULES.map((mod) => {
                const level = permissions?.[mod.key];
                return (
                  <div
                    key={mod.key}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold ${
                      level === "write"
                        ? "bg-slate-900 text-white border-slate-900"
                        : level === "read"
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-slate-50 text-slate-300 border-slate-100"
                    }`}
                  >
                    <span>{mod.label}</span>
                    <span className="uppercase tracking-wide">{level || "none"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
