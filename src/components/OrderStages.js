import React, { useMemo } from "react";
import {
  FaClipboardList,
  FaCheck,
  FaCogs,
  FaBox,
  FaPlane,
  FaTruck,
  FaHome,
  FaTimesCircle,
  FaCheckCircle
} from "react-icons/fa";

export default function OrderStages({ currentStage = "PLACED" }) {
  const stages = [
    { key: "PLACED", label: "Order Placed", icon: FaClipboardList, date: "Mon, 12 Aug" },
    { key: "CONFIRMED", label: "Confirmed", icon: FaCheck, date: "Mon, 12 Aug" },
    { key: "PROCESSING", label: "Processing", icon: FaCogs, date: "Tue, 13 Aug" },
    { key: "PACKED", label: "Packed", icon: FaBox, date: "Wed, 14 Aug" },
    { key: "SHIPPED", label: "Shipped", icon: FaPlane, date: "Thu, 15 Aug" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: FaTruck, date: "Fri, 16 Aug" },
    { key: "DELIVERED", label: "Delivered", icon: FaHome, date: "Fri, 16 Aug" },
  ];

  const isCancelled = currentStage === "CANCELLED";

  const currentIndex = useMemo(
    () => stages.findIndex((s) => s.key === currentStage),
    [currentStage]
  );

  /* --- CANCELLED STATE --- */
  if (isCancelled) {
    return (
      <div className="max-w-3xl mx-auto my-8">
        <div className="rounded-[2rem] bg-red-50 border border-red-100 p-10 text-center animate-fade-up shadow-sm">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <FaTimesCircle size={36} />
          </div>
          <h2 className="text-2xl font-black text-red-900 mb-2">Order Cancelled</h2>
          <p className="text-gray-600">
            This order has been cancelled and the refund process has been initiated.
          </p>
        </div>
      </div>
    );
  }

  /* --- PROGRESS TIMELINE --- */
  return (
    <div className="w-full flex justify-center py-8 px-4">
      {/* Card Container to control width and add padding */}
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 relative overflow-hidden">
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600" />

        {/* ================= DESKTOP VIEW (Horizontal) ================= */}
        <div className="hidden lg:block">
          <div className="relative flex items-center justify-between px-4">
            
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-6 h-1 bg-gray-100 rounded-full -z-10 mx-8" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute left-0 top-6 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full -z-10 mx-8 transition-all duration-1000 ease-out"
              style={{ width: `calc(${ (currentIndex / (stages.length - 1)) * 100 }% - 4rem)` }}
            />

            {stages.map((step, i) => {
              const isCompleted = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isPending = i > currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center relative group">
                  
                  {/* Icon Node */}
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                      isCompleted 
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-100"
                        : isCurrent
                          ? "bg-orange-500 text-white shadow-xl shadow-orange-500/40 scale-125 ring-4 ring-orange-100"
                          : "bg-white border-2 border-gray-100 text-gray-300"
                    }`}
                  >
                    {isCompleted ? <FaCheckCircle size={18} /> : <step.icon size={isCurrent ? 18 : 16} />}
                  </div>

                  {/* Label & Date */}
                  <div className={`absolute top-16 flex flex-col items-center w-32 text-center transition-all duration-500 ${
                    isPending ? "opacity-40 blur-[0.5px]" : "opacity-100 translate-y-0"
                  }`}>
                    <span className={`text-xs font-bold mb-1 ${isCurrent ? "text-orange-600 scale-110" : "text-gray-700"}`}>
                      {step.label}
                    </span>
                    {!isPending && (
                      <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-full">
                        {step.date}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Spacer for labels */}
          <div className="h-16" />
        </div>


        {/* ================= MOBILE VIEW (Vertical) ================= */}
        <div className="lg:hidden flex flex-col pl-2 relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100 rounded-full" />
          
          {/* Active Vertical Line */}
          <div 
             className="absolute left-[19px] top-6 w-0.5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
             style={{ height: `${Math.min(100, (currentIndex / (stages.length - 1)) * 100)}%` }} 
          />

          {stages.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <div key={step.key} className="flex gap-5 mb-8 relative last:mb-0 z-10">
                {/* Icon Node */}
                <div 
                  className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted 
                      ? "bg-green-500 border-green-500 text-white shadow-md"
                      : isCurrent
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg ring-4 ring-orange-100"
                        : "bg-white border-gray-100 text-gray-300"
                  }`}
                >
                  {isCompleted ? <FaCheckCircle size={14} /> : <step.icon size={14} />}
                </div>

                {/* Text Info */}
                <div className={`flex flex-col justify-center transition-all duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
                  <span className={`text-sm font-bold ${isCurrent ? "text-gray-900" : "text-gray-600"}`}>
                    {step.label}
                  </span>
                  {!isPending && (
                    <span className="text-xs text-gray-400 font-medium mt-0.5">
                      {step.date}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}