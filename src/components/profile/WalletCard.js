import React from "react";

export default function WalletCard({ wallet }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-line shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-base font-bold text-ink">VKart Wallet</h3>
        <div className="text-base sm:text-xl font-bold text-ink">₹{Math.round(wallet.balance)}</div>
      </div>
      <div className="text-[10px] font-bold text-muted-light uppercase tracking-wider mb-2">
        Recent Activity
      </div>
      <div className="space-y-1.5">
        {wallet.transactions.length === 0 ? (
          <div className="text-xs text-muted-light">No wallet activity yet.</div>
        ) : (
          wallet.transactions.slice(0, 4).map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1 border-b border-line last:border-0"
            >
              <span className="text-muted truncate mr-2">{t.reason || t.type}</span>
              <span
                className={`font-bold shrink-0 ${t.type === "CREDIT" ? "text-ok" : "text-alert"}`}
              >
                {t.type === "CREDIT" ? "+" : "-"}₹{Math.round(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
