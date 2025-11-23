import React from "react";
import { Link } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaHome,
  FaArrowLeft,
  FaSearch,
  FaEnvelope,
  FaGhost
} from "react-icons/fa";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.2); } 50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.4); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-pulse-glow { animation: pulse-glow 3s infinite; }
  `}</style>
);

export default function Error() {
  const handleSearch = (val) => {
    if (val.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(val)}`;
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-800 flex items-center justify-center p-4">
      <AnimStyles />

      {/* Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        
        {/* 404 Visual */}
        <div className="relative mx-auto w-40 h-40 mb-6 animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-[2.5rem] rotate-6 opacity-20 blur-xl animate-pulse-glow" />
          <div className="relative w-full h-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-2xl flex items-center justify-center">
            <FaGhost className="text-6xl text-orange-500 drop-shadow-sm" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
            <span className="text-xl font-black text-gray-900">404</span>
          </div>
        </div>

        {/* Headlines */}
        <div className="animate-fade-up space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full rounded-2xl border-0 bg-white py-4 pl-11 pr-24 text-sm font-semibold text-gray-900 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 transition-all focus:ring-2 focus:ring-orange-500/20 focus:shadow-orange-500/10 placeholder:text-gray-400"
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e.currentTarget.value)}
            />
            <button
              onClick={(e) => handleSearch(e.currentTarget.parentElement?.querySelector("input")?.value || "")}
              className="absolute right-2 top-2 bottom-2 rounded-xl bg-gray-900 px-4 text-xs font-bold text-white shadow-lg hover:bg-black transition-all active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/40 active:scale-95"
          >
            <FaHome /> Back to Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-700 border border-gray-200 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>

        {/* Footer Support */}
        <div className="mt-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-orange-600 transition-colors"
          >
            <FaEnvelope /> Need help? Contact Support
          </Link>
        </div>

      </div>
    </main>
  );
}