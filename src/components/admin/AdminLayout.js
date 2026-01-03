import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosInstance";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

// 1. Receive the setIsAdmin prop
export default function AdminLayout({ setIsAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  /* ---------------------------------------------------
       FETCH ADMIN PROFILE
  ---------------------------------------------------- */
  const fetchAdminProfile = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/settings");
      if (res.data?.admin) {
        setAdminProfile(res.data.admin);
      }
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  }, []);

  /* ---------------------------------------------------
       AUTH GUARD - Now uses cookie-based API check
  ---------------------------------------------------- */
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/verify", { withCredentials: true });
        if (res.data?.valid) {
          if (setIsAdmin) setIsAdmin(true);
          setAuthChecked(true);
          fetchAdminProfile(); // Fetch profile after verification
        } else {
          throw new Error("Invalid");
        }
      } catch (err) {
        if (setIsAdmin) setIsAdmin(false);
        navigate("/admin/login", { replace: true });
      }
    };
    verifyAdmin();
  }, [navigate, setIsAdmin, fetchAdminProfile]);

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
    if (setIsAdmin) setIsAdmin(false);
    navigate("/admin/login", { replace: true });
  };

  // Don't render until auth is verified
  if (!authChecked) {
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
          adminProfile={adminProfile}
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