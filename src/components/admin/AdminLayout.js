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

  // The single source of truth for "who is this admin" — identity, role, and
  // module permissions all come from here. It's the one endpoint every admin
  // can hit regardless of their permissions, so the header/sidebar/pages never
  // need a module-gated call just to know who's logged in.
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

  const refreshProfile = useCallback(async () => {
    await adminVerifyQuery.refetch();
  }, [adminVerifyQuery]);

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
    if (setIsAdmin) setIsAdmin(false);
    navigate("/admin/login", { replace: true });
  };

  // Don't render until auth is verified
  if (adminVerifyQuery.isLoading) {
    return (
      <div className="premium-admin flex h-screen items-center justify-center bg-[#f2f0eb]">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const adminRole = adminVerifyQuery.data?.adminRole || null;
  const permissions = adminVerifyQuery.data?.permissions || {};
  const identity = {
    name: adminVerifyQuery.data?.name || "",
    email: adminVerifyQuery.data?.email || "",
    profileImage: adminVerifyQuery.data?.profileImage || null,
    createdAt: adminVerifyQuery.data?.createdAt || null,
  };

  return (
    <div className="premium-admin flex h-screen bg-[#f2f0eb] overflow-hidden font-sans text-[#24231f]">

      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
        adminRole={adminRole}
        permissions={permissions}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out relative">

        {/* Top Header */}
        <AdminHeader
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          onLogout={handleLogout}
          adminProfile={identity}
          adminRole={adminRole}
          permissions={permissions}
        />

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none scroll-smooth flex flex-col"
        >
          <div className="flex-1">
            <Outlet
              context={{
                refreshProfile,
                adminRole,
                permissions,
                identity,
              }}
            />
          </div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
