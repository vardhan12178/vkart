import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // protect route
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, Admin</h1>
        <p className="text-gray-600 mb-6">
          You are now logged in to the VKart Admin Dashboard.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => alert("Orders page coming soon...")}
            className="px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            Manage Orders
          </button>
          <button
            onClick={() => alert("Products page coming soon...")}
            className="px-6 py-3 rounded-lg bg-amber-400 text-white font-semibold hover:bg-amber-500 transition"
          >
            Manage Products
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 px-6 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-orange-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
