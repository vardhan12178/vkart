import React from "react";
import { FiCheck } from "react-icons/fi";

export default function Highlights({ items, variant }) {
  return (
    <>
      {items?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-bold text-ink">Highlights</h2>
          <ul className="mt-2 space-y-2">
            {items.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-ink-soft">
                <FiCheck className="mt-0.5 flex-none text-accent" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {variant && (
        <p className="mt-6 text-xs text-muted-light">
          SKU {variant.sku}
          {variant.mpn ? ` · Model ${variant.mpn}` : ""}
        </p>
      )}
    </>
  );
}
