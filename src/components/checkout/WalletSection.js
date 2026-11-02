import React, { useState } from "react";
import SectionTitle from "./SectionTitle";

export default function WalletSection({ balance, total, useWallet, onToggle, onTopUp }) {
  const [topup, setTopup] = useState("");

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <SectionTitle className="">VKart Wallet</SectionTitle>
        <span className="text-xs font-bold text-muted">Balance: ₹{Math.round(balance)}</span>
      </div>
      <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-ink-soft">
        <input
          type="checkbox"
          checked={useWallet}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-line-strong text-accent focus:ring-accent"
        />
        Use wallet balance for this order
      </label>
      {useWallet && balance < Number(total || 0) && (
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="number"
            value={topup}
            onChange={(e) => setTopup(e.target.value)}
            placeholder="Add money"
            className="flex-1 rounded-xl border border-line-strong bg-white px-3 py-1.5 text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={() => onTopUp(Number(topup), () => setTopup(""))}
            className="px-3 py-1.5 rounded-xl bg-ink text-white text-xs font-bold"
          >
            Add Money
          </button>
        </div>
      )}
    </div>
  );
}
