import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

// 1. Receive the setIsAdmin prop
export default function AdminLayout({ setIsAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ---------------------------------------------------
       AUTH GUARD
  ---------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      // 2. Sync state if token is missing to prevent loops
      if (setIsAdmin) setIsAdmin(false);
      navigate("/admin/login", { replace: true });
    }
  }, [navigate, setIsAdmin]);

  /* ---------------------------------------------------
       SCROLL RESET ON NAVIGATE
  ---------------------------------------------------- */
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.scrollTop = 0;
  }, [location.pathname]);

  /* ---------------------------------------------------
       LOGOUT HANDLER
  ---------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    
    // 3. Update State IMMEDIATELY to stop redirect loop
    if (setIsAdmin) setIsAdmin(false);
    
    navigate("/admin/login", { replace: true });
    fetch("/api/logout", { method: "POST" }).catch(() => {});
  };

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
        />

        {/* Page Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none scroll-smooth flex flex-col"
        >
          <div className="flex-1">
             <Outlet />
          </div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}