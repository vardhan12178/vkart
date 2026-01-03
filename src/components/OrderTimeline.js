import React, { useMemo } from "react";
import {
    ClipboardCheckIcon,
    CubeIcon,
    TruckIcon, // Using Truck for Shipped
    HomeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from "@heroicons/react/outline";
import { CheckIcon } from "@heroicons/react/solid";

function formatStageDate(isoStr) {
    if (!isoStr) return null;
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const STAGES_CONFIG = [
    { key: "PLACED", label: "Order Placed", icon: ClipboardCheckIcon, description: "We have received your order." },
    { key: "CONFIRMED", label: "Confirmed", icon: CheckCircleIcon, description: "Order details have been verified." },
    { key: "PROCESSING", label: "Processing", icon: CubeIcon, description: "We are getting your items ready." },
    { key: "SHIPPED", label: "Shipped", icon: TruckIcon, description: "Your package is on the way." },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: TruckIcon, description: "Our agent is near your location." },
    { key: "DELIVERED", label: "Delivered", icon: HomeIcon, description: "Package delivered successfully." },
];

export default function OrderTimeline({ currentStage = "PLACED", statusHistory = [], createdAt }) {

    const stageDateMap = useMemo(() => {
        const map = {};
        const history = statusHistory || [];

        if (createdAt) map["PLACED"] = createdAt;

        history.forEach(entry => {
            if (entry?.stage && entry?.date) {
                if (!map[entry.stage] || new Date(entry.date) < new Date(map[entry.stage])) {
                    map[entry.stage] = entry.date;
                }
            }
        });

        return map;
    }, [statusHistory, createdAt]);

    const currentIndex = STAGES_CONFIG.findIndex(s => s.key === currentStage);
    const isCancelled = currentStage === "CANCELLED";

    if (isCancelled) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50">
                    <ExclamationCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-red-900">Order Cancelled</h3>
                <p className="text-red-700 mt-2 text-sm z-10 relative">
                    This order has been cancelled and is no longer active.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* --- DESKTOP: PREMIUM TIMELINE --- */}
            <div className="hidden lg:block relative py-16 px-4">

                {/* Current Status Banner (Floating Above) */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-xl shadow-orange-500/10 border border-orange-100 z-20 flex items-center gap-2 animate-bounce-slow">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
                        {STAGES_CONFIG.find(s => s.key === currentStage)?.label || "Processing"}
                    </span>
                </div>

                {/* Connection Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden" />

                {/* Connection Line Progress */}
                <div
                    className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(currentIndex / (STAGES_CONFIG.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between relative z-10 w-full">
                    {STAGES_CONFIG.map((stage, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        const isPending = idx > currentIndex;
                        const dateStr = formatStageDate(stageDateMap[stage.key]);
                        const Icon = stage.icon;

                        return (
                            <div key={stage.key} className="flex flex-col items-center group relative w-40">

                                {/* Icon Wrapper */}
                                <div
                                    className={`
                                        w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10
                                        ${isCompleted
                                            ? "bg-emerald-500 border-white text-white shadow-lg scale-100"
                                            : isCurrent
                                                ? "bg-gradient-to-br from-orange-500 to-amber-600 border-white text-white shadow-2xl shadow-orange-500/50 scale-150 ring-4 ring-orange-100 ring-offset-2"
                                                : "bg-white border-gray-200 text-gray-300 scale-90"
                                        }
                                    `}
                                >
                                    {isCompleted ? <CheckIcon className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                                </div>

                                {/* Label & Date */}
                                <div className={`
                                    absolute top-28 w-48 text-center transition-all duration-500 flex flex-col items-center
                                    ${isPending ? "opacity-30 grayscale blur-[1px]" : "opacity-100"}
                                    ${isCurrent ? "scale-110 -translate-y-2" : ""}
                                `}>
                                    <p className={`text-sm font-black uppercase tracking-wide ${isCurrent ? "text-orange-600" : "text-gray-900"}`}>
                                        {stage.label}
                                    </p>

                                    {/* Description (Only for current or completed) */}
                                    {!isPending && (
                                        <p className="text-[10px] text-gray-500 font-medium mt-1 leading-tight max-w-[120px]">
                                            {isCurrent ? stage.description : dateStr}
                                        </p>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>


            <div className="lg:hidden relative pl-4 border-l-2 border-gray-100 space-y-8 py-2 ml-4">
                {STAGES_CONFIG.map((stage, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const isPending = idx > currentIndex;
                    const dateStr = formatStageDate(stageDateMap[stage.key]);
                    const Icon = stage.icon;

                    return (
                        <div key={stage.key} className="relative pl-8">
                            {/* Dot on Line */}
                            <div
                                className={`
                                    absolute -left-[23px] top-0 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10
                                    ${isCompleted
                                        ? "bg-emerald-500 border-white text-white shadow-md ring-0"
                                        : isCurrent
                                            ? "bg-orange-500 border-white text-white shadow-xl ring-4 ring-orange-100"
                                            : "bg-white border-gray-100 text-gray-300"
                                    }
                                `}
                            >
                                {isCompleted ? <CheckIcon className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                            </div>

                            {/* Content */}
                            <div className={`transition-all duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
                                <div className="flex flex-col items-start gap-1">
                                    <h4 className={`text-lg font-bold ${isCurrent ? "text-gray-900" : "text-gray-700"}`}>
                                        {stage.label}
                                    </h4>
                                    {dateStr && (
                                        <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold border border-gray-100">
                                            {dateStr}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2 leading-snug">
                                    {stage.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
