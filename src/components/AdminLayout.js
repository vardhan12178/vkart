import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ---------------------------------------------------
     AUTH GUARD – block unauthorized admins instantly
  ---------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  /* ---------------------------------------------------
     FIXED LOGOUT (instant redirect – no UI flicker)
  ---------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("admin_token");

    // Navigate immediately
    navigate("/admin/login", { replace: true });

    // Fire-and-forget logout API call (non-blocking)
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <AdminHeader
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
