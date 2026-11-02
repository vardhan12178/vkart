import React from "react";
import { TagIcon } from "../ui/icons";
import { formatINR } from "../../utils/format";

export default function PromoBox({ promo }) {
  const {
    code,
    setCode,
    applied,
    loading,
    coupons,
    showCoupons,
    apply,
    remove,
    toggleCoupons,
    pickCoupon,
  } = promo;

  return (
    <div className="mt-4 sm:mt-6">
      {applied ? (
        <div className="flex items-center justify-between bg-ok/10 px-3.5 py-2.5 rounded-xl border border-ok/30">
          <div className="flex items-center gap-2">
            <TagIcon className="text-ok text-xs" />
            <span className="text-xs font-bold text-ok">{applied.code}</span>
            <span className="text-[11px] text-ok">-{formatINR(applied.discount)}</span>
          </div>
          <button onClick={remove} className="text-xs font-bold text-[#75483b] hover:underline">
            Remove
          </button>
        </div>
      ) : (
        <div className="relative">
          <TagIcon className="absolute left-3.5 top-3 text-muted-light text-xs" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Coupon Code"
            className="w-full pl-9 pr-16 py-2.5 rounded-xl bg-[#f6f3ed] border border-black/[0.06] text-xs font-bold text-[#1d1c19] focus:outline-none focus:ring-1 focus:ring-[#a85d37] placeholder:text-muted-light"
          />
          <button
            onClick={apply}
            disabled={loading}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-white rounded-lg text-xs font-bold text-[#1d1c19] shadow-sm hover:bg-sand transition disabled:opacity-50"
          >
            {loading ? "..." : "Apply"}
          </button>
        </div>
      )}

      {!applied && (
        <button
          onClick={toggleCoupons}
          className="mt-1.5 text-[11px] font-bold text-[#a85d37] hover:underline"
        >
          {showCoupons ? "Hide coupons" : "View available coupons"}
        </button>
      )}

      {showCoupons && !applied && coupons.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {coupons.map((c) => (
            <button
              key={c.code}
              onClick={() => pickCoupon(c)}
              className="w-full text-left p-2.5 rounded-xl bg-[#fbf3ee] border border-[#a85d37]/15 hover:bg-[#f6eee8] transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1c19]">{c.code}</span>
                <span className="text-[11px] font-bold text-[#a85d37]">
                  {c.type === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`}
                </span>
              </div>
              {c.description && (
                <p className="text-[10px] text-[#6f6b62] mt-0.5">{c.description}</p>
              )}
              {c.minOrder > 0 && (
                <p className="text-[9px] text-muted-light mt-0.5">
                  Min order: {formatINR(c.minOrder)}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
      {showCoupons && !applied && coupons.length === 0 && (
        <p className="mt-2 text-xs text-muted-light text-center">No coupons available right now</p>
      )}
    </div>
  );
}
