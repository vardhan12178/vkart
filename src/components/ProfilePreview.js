import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight, FaBoxOpen, FaHeart, FaHeadset } from "react-icons/fa";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

export default function ProfilePreview() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex items-center justify-center relative overflow-hidden p-6">
      <AnimStyles />

      {/* Ambient Background */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden p-8 sm:p-12 text-center animate-fade-up">
          
          {/* Icon Visual */}
          <div className="relative mx-auto w-28 h-28 mb-8">
            <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full flex items-center justify-center shadow-xl shadow-gray-900/20 animate-float">
              <FaUser className="text-white text-3xl" />
              <div className="absolute bottom-0 right-0 bg-white text-orange-500 p-2.5 rounded-full shadow-md border-4 border-white/50">
                <FaLock size={12} />
              </div>
            </div>
          </div>

          {/* Headlines */}
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Member Access
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
            Manage your profile, track your orders, and view your wishlist in one place.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { icon: <FaBoxOpen />, label: "Orders" },
              { icon: <FaHeart />, label: "Wishlist" },
              { icon: <FaHeadset />, label: "Support" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors group">
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors text-xl">{item.icon}</div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-5">
            <Link
              to="/login?redirect=/profile"
              className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-xl shadow-gray-900/10 transition-all hover:scale-[1.02] hover:shadow-gray-900/20 active:scale-[0.98]"
            >
              <span>Login to Continue</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
            </Link>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
              <span>New to VKart?</span>
              <Link
                to="/register"
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>

        </div>
        
        {/* Footer Note */}
        <p className="text-center text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-widest">
          Secure • Personal • Fast
        </p>
      </div>
    </div>
  );
}