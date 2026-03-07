import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { qk } from "../../query/queryKeys";

// 1. Receive the setIsAdmin prop
export default function AdminLayout({ setIsAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminVerifyQuery = useQuery({
    queryKey: qk.auth.adminVerify,
    queryFn: async () => {
      const res = await axios.get("/api/admin/verify", { withCredentials: true });
      return res.data;
    },
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const adminSettingsQuery = useQuery({
    queryKey: qk.admin.settings,
    queryFn: async () => {
      const res = await axios.get("/api/admin/settings");
      return res.data;
    },
    enabled: Boolean(adminVerifyQuery.data?.valid),
  });

  const fetchAdminProfile = useCallback(async () => {
    await adminSettingsQuery.refetch();
  }, [adminSettingsQuery]);

  /* ---------------------------------------------------
       AUTH GUARD - Now uses cookie-based API check
  ---------------------------------------------------- */
  useEffect(() => {
    if (adminVerifyQuery.isLoading) return;

    if (adminVerifyQuery.data?.valid) {
      if (setIsAdmin) setIsAdmin(true);
      return;
    }

    if (setIsAdmin) setIsAdmin(false);
    navigate("/admin/login", { replace: true });
  }, [navigate, setIsAdmin, adminVerifyQuery.isLoading, adminVerifyQuery.data]);

  /* ---------------------------------------------------
       SCROLL RESET ON NAVIGATE
  ---------------------------------------------------- */
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.scrollTop = 0;
  }, [location.pathname]);

  /* ---------------------------------------------------
       LOGOUT HANDLER - Now uses API logout
  ---------------------------------------------------- */
  const handleLogout = async () => {
    try {
      await axios.post("/api/admin/logout", {}, { withCredentials: true });
    } catch (err) {
      // Ignore errors
    }
    queryClient.removeQueries({ queryKey: qk.auth.adminVerify });
    queryClient.removeQueries({ queryKey: qk.admin.settings });
    if (setIsAdmin) setIsAdmin(false);
    navigate("/admin/login", { replace: true });
  };

  // Don't render until auth is verified
  if (adminVerifyQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">

      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out relative">

        {/* Top Header */}
        <AdminHeader
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          onLogout={handleLogout}
          adminProfile={adminSettingsQuery.data?.admin || null}
        />

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none scroll-smooth flex flex-col"
        >
          <div className="flex-1">
            <Outlet context={{ refreshProfile: fetchAdminProfile }} />
          </div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
