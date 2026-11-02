import React from "react";
import { InboxIcon } from "@heroicons/react/outline";

export default function OrdersEmpty({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
        <InboxIcon className="h-7 w-7 text-slate-300" />
      </div>
      <h3 className="text-base font-bold text-slate-900">No orders found</h3>
      <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-xs">
        Try adjusting your search or filter to find what you're looking for.
      </p>
      <button
        onClick={onClear}
        className="mt-4 text-orange-600 font-bold text-xs sm:text-sm hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}
