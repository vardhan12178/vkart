import React, { useEffect, useRef, useState } from "react";
import { FiMapPin, FiTruck, FiTool, FiAlertCircle } from "react-icons/fi";
import { fetchDelivery, formatPrice } from "./catalogApi";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../../utils/shipping";

const PIN_KEY = "vkart:pincode";
const readPin = () => {
  try { return localStorage.getItem(PIN_KEY) || ""; } catch { return ""; }
};
const savePin = (pin) => {
  try { localStorage.setItem(PIN_KEY, pin); } catch { /* optional */ }
};

const addDays = (from, n) => { const d = new Date(from); d.setDate(d.getDate() + n); return d; };
const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

// "Tomorrow, Sat 1 Nov" / "Mon, 3 Nov – Wed, 5 Nov"
export function deliveryWindow(days, today = new Date()) {
  const first = addDays(today, days.min);
  const last = addDays(today, days.max);
  const label = (d, n) => (n === 1 ? `Tomorrow, ${fmt(d)}` : fmt(d));
  return days.min === days.max ? label(first, days.min) : `${label(first, days.min)} – ${fmt(last)}`;
}

export const placeLabel = (place) =>
  [place?.area, place?.district && place.district !== place?.area ? place.district : null, place?.state].filter(Boolean).join(", ");

// PIN code delivery check for the product page. The last PIN code is remembered on this device.
export default function DeliveryCheck({ category, price = 0 }) {
  const [pin, setPin] = useState(readPin);
  const [editing, setEditing] = useState(() => !readPin());
  const [state, setState] = useState({ status: "idle" }); // idle | loading | done | error
  const inputRef = useRef(null);
  const seq = useRef(0);

  const check = async (value) => {
    const code = String(value || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(code)) {
      setState({ status: "done", result: { valid: false, reason: "Enter a valid 6-digit PIN code." } });
      return;
    }
    const n = ++seq.current;
    setState({ status: "loading" });
    try {
      const result = await fetchDelivery(code, category);
      if (n !== seq.current) return;
      setState({ status: "done", result });
      if (result.valid) { savePin(code); setEditing(false); }
    } catch {
      if (n === seq.current) setState({ status: "error" });
    }
  };

  // Check the remembered PIN code, again when the product's category changes
  useEffect(() => {
    if (readPin()) check(readPin());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const result = state.status === "done" ? state.result : null;
  const ok = result?.valid && result.serviceable;
  const free = price >= FREE_SHIPPING_THRESHOLD;

  return (
    <section aria-label="Delivery" className="mt-6 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-start gap-2 text-sm font-semibold text-ink">
          <FiMapPin className="mt-0.5 flex-none text-accent" />
          {ok && !editing ? (
            <span className="min-w-0 break-words">Deliver to <span className="font-normal text-ink-soft">{placeLabel(result.place)} {result.pincode}</span></span>
          ) : "Check delivery"}
        </p>
        {ok && !editing && (
          <button type="button" onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); }}
            className="flex-none text-xs font-semibold text-accent hover:underline">
            Change
          </button>
        )}
      </div>

      {(editing || !ok) && (
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); check(pin); }}>
          <label htmlFor="pdp-pincode" className="sr-only">PIN code</label>
          <input
            id="pdp-pincode"
            ref={inputRef}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="Enter PIN code"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="min-w-0 flex-1 rounded-xl border border-line-strong bg-paper px-3 py-2 text-sm tracking-wider text-ink placeholder:tracking-normal placeholder:text-muted-faint focus:border-ink focus:outline-none"
          />
          <button type="submit" disabled={state.status === "loading"}
            className="rounded-xl bg-ink px-4 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50">
            {state.status === "loading" ? "Checking…" : "Check"}
          </button>
        </form>
      )}

      <div aria-live="polite">
        {state.status === "loading" && !editing && <p className="mt-3 text-sm text-muted">Checking delivery…</p>}
        {state.status === "error" && <p className="mt-3 text-sm text-alert">Couldn't check delivery right now. Please try again.</p>}
        {result && !result.valid && <p className="mt-2 flex items-center gap-1.5 text-sm text-alert"><FiAlertCircle className="flex-none" />{result.reason}</p>}
        {result?.valid && !result.serviceable && (
          <p className="mt-3 flex items-start gap-1.5 text-sm text-alert"><FiAlertCircle className="mt-0.5 flex-none" />{result.reason}</p>
        )}
        {ok && (
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li className="flex gap-2">
              <FiTruck className="mt-0.5 flex-none text-muted" />
              <span>
                <span className="font-semibold text-ink">{free ? "Free delivery" : `${formatPrice(SHIPPING_FEE)} delivery`}</span>{" "}
                {deliveryWindow(result.days)}
                {!free && <span className="block text-xs text-muted">Free on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>}
              </span>
            </li>
            {result.installation && (
              <li className="flex gap-2"><FiTool className="mt-0.5 flex-none text-muted" />Installation included: we'll call to book a slot after delivery</li>
            )}
          </ul>
        )}
      </div>
      {ok && <p className="mt-3 text-[11px] text-muted-faint">Estimated dates for this demo store</p>}
    </section>
  );
}
