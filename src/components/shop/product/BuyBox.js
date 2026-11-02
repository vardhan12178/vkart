import React from "react";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import BrandSelect from "../BrandSelect";
import AlertButton from "../AlertButton";
import { ACCENT } from "./theme";

export default function BuyBox({ p, variant, available, qty, setQty, notice, buy }) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-4">
      <p className={`text-sm font-semibold ${available ? "text-ok" : "text-alert"}`}>
        {available ? "In stock" : "Currently unavailable"}
      </p>
      <p className="mt-1 text-sm text-muted">Sold by VKart · Ships from India</p>
      {p.id && variant && (
        <AlertButton productId={p.id} sku={variant.sku} outOfStock={!available} />
      )}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm text-muted">Qty</span>
        <BrandSelect
          label="Quantity"
          value={qty}
          onChange={setQty}
          className="w-24"
          options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
        />
      </div>
      <div className="mt-4 hidden gap-3 lg:flex">
        <button
          type="button"
          disabled={!available}
          onClick={() => buy("cart")}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white disabled:opacity-40"
        >
          <FiShoppingCart /> Add to cart
        </button>
        <button
          type="button"
          disabled={!available}
          onClick={() => buy("buy")}
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          <FiZap /> Buy now
        </button>
      </div>
      {notice && <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-xs text-muted">{notice}</p>}
    </div>
  );
}
