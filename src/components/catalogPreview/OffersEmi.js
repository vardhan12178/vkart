import React, { useState } from "react";
import { FiCreditCard, FiPercent, FiChevronDown } from "react-icons/fi";
import { formatPrice } from "./catalogApi";

export const EMI_MIN_PRICE = 3000;
const INTEREST_PA = 0.14; // standard card EMI rate used for the longer plans

// Monthly instalment for a loan of `amount` over `months` at `annualRate` (reducing balance)
export function emi(amount, months, annualRate) {
  if (!annualRate) return amount / months;
  const r = annualRate / 12;
  const f = (1 + r) ** months;
  return (amount * r * f) / (f - 1);
}

export function emiPlans(price) {
  return [3, 6, 9, 12].map((months) => {
    const rate = months <= 6 ? 0 : INTEREST_PA;
    const monthly = Math.ceil(emi(price, months, rate));
    // No-cost plans: the bank's rounding never adds to what the shopper pays
    const total = rate ? monthly * months : price;
    return { months, rate, monthly, interest: total - price, total };
  });
}

// Sample bank offers and an EMI calculator for the product page
export default function OffersEmi({ price }) {
  const [open, setOpen] = useState(false);
  if (!price) return null;
  const plans = price >= EMI_MIN_PRICE ? emiPlans(price) : [];
  const offers = [
    price >= 5000 && { title: "Bank offer", text: `10% instant discount on credit cards, up to ${formatPrice(1500)} on orders of ${formatPrice(5000)} or more` },
    { title: "Pay Later", text: "Buy now and pay within 30 days at no extra cost" },
  ].filter(Boolean);

  return (
    <section aria-label="Offers" className="mt-6 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink"><FiPercent className="text-accent" />Offers</h2>
        <span className="text-[11px] text-muted-faint">Sample offers for this demo store</span>
      </div>
      <ul className="mt-3 space-y-2">
        {offers.map((o) => (
          <li key={o.title} className="text-sm text-ink-soft"><span className="font-semibold text-ink">{o.title}:</span> {o.text}</li>
        ))}
      </ul>

      {plans.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-between gap-2 text-left text-sm">
            <span className="flex items-center gap-2 text-ink-soft">
              <FiCreditCard className="flex-none text-muted" />
              <span><span className="font-semibold text-ink">No-cost EMI</span> from {formatPrice(plans[1].monthly)}/month</span>
            </span>
            <span className="flex flex-none items-center gap-1 text-xs font-semibold text-accent">
              {open ? "Hide plans" : "View plans"} <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </span>
          </button>
          {open && (
            <table className="mt-3 w-full text-left text-xs">
              <thead className="text-muted-light">
                <tr><th className="py-1.5 font-semibold">Plan</th><th className="py-1.5 font-semibold">Per month</th><th className="py-1.5 font-semibold">Interest</th><th className="py-1.5 text-right font-semibold">Total</th></tr>
              </thead>
              <tbody>
                {plans.map((pl) => (
                  <tr key={pl.months} className="border-t border-tint text-ink-soft">
                    <td className="py-2">{pl.months} months</td>
                    <td className="py-2 font-semibold text-ink">{formatPrice(pl.monthly)}</td>
                    <td className="py-2">{pl.rate ? `${formatPrice(pl.interest)} (${Math.round(pl.rate * 100)}% p.a.)` : <span className="font-semibold text-ok">No cost</span>}</td>
                    <td className="py-2 text-right">{formatPrice(pl.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
