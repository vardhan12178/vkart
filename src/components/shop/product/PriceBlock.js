import React from "react";
import { formatPrice } from "../catalogApi";

export default function PriceBlock({ p, variant, off }) {
  return (
    <div className="mt-5 border-t border-line pt-5">
      {variant ? (
        <>
          {off > 0 && (
            <span className="mr-3 rounded-md bg-ok px-2 py-0.5 text-sm font-semibold text-white">
              {off}% off
            </span>
          )}
          <span className="text-3xl font-bold text-ink">{formatPrice(variant.price)}</span>
          {off > 0 && (
            <p className="mt-1 text-sm text-muted-light">
              M.R.P.: <span className="line-through">{formatPrice(variant.mrp)}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-light">Inclusive of all taxes</p>
          {p.sale && (
            <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
              {p.sale.name}: {p.sale.percent}% off MRP
              {p.sale.primePercent && (
                <span className="font-normal text-ink-soft">
                  · Prime members get {p.sale.primePercent}% off at checkout
                </span>
              )}
            </p>
          )}
        </>
      ) : (
        <p className="text-lg text-muted">This combination is not available</p>
      )}
    </div>
  );
}
