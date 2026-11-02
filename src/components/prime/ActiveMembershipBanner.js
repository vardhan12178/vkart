import React from "react";
import { FaCrown } from "react-icons/fa";

export default function ActiveMembershipBanner({ membership }) {
  return (
    <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <FaCrown className="text-amber-600 text-xl" />
            </div>
            <div>
              <p className="font-bold text-gray-900">You're a Prime Member!</p>
              <p className="text-sm text-gray-600">
                Active until{" "}
                {new Date(membership.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full">
            ACTIVE
          </span>
        </div>
        {membership.history?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200/50">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
              Membership History
            </p>
            <div className="space-y-1">
              {membership.history
                .slice(-3)
                .reverse()
                .map((h, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600">
                    <span>{h.plan || "Prime Plan"}</span>
                    <span>
                      {new Date(h.startDate).toLocaleDateString("en-IN")}
                      {" -> "}
                      {new Date(h.endDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
