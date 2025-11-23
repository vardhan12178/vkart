import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaLock, FaArrowRight, FaStore, FaSync, FaShieldAlt } from "react-icons/fa";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

export default function CartPreview() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex items-center justify-center relative overflow-hidden p-6">
      <AnimStyles />

      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-orange-500/5 rounded-[2.5rem] overflow-hidden p-8 sm:p-12 text-center animate-fade-up">
          
          {/* Icon Visual */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-orange-50 rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/30 animate-float">
              <FaShoppingCart className="text-white text-4xl" />
              <div className="absolute top-0 right-0 bg-white text-gray-900 p-3 rounded-full shadow-md border-4 border-white/50">
                <FaLock size={14} />
              </div>
            </div>
          </div>

          {/* Headlines */}
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Your Cart is Waiting
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4 font-medium">
            Login to see items you added previously and sync your cart across all your devices.
          </p>

          {/* Micro Features */}
          <div className="flex justify-center gap-4 mb-10">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <FaSync className="text-orange-500" /> Sync Devices
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <FaShieldAlt className="text-green-500" /> Secure
             </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/login?redirect=/cart"
              className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-xl shadow-gray-900/10 transition-all hover:scale-[1.02] hover:shadow-gray-900/20 active:scale-[0.98]"
            >
              <span>Sign In to View Cart</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
            </Link>

            <Link
              to="/products"
              className="group w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <FaStore className="text-gray-400 group-hover:text-orange-500 transition-colors" /> 
              Continue Shopping
            </Link>
          </div>

        </div>
        
        {/* Footer Note */}
        <p className="text-center text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-widest">
          VKart Secure Checkout
        </p>
      </div>
    </div>
  );
}