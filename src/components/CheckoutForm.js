// src/pages/CheckoutForm.jsx
import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { FaMoneyBillWave, FaRegCreditCard } from "react-icons/fa";
import {
  SiVisa,
  SiMastercard,
  SiAmericanexpress,
  SiDiscover,
  SiPaypal,
  SiGooglepay,
  SiPaytm,
  SiPhonepe,
} from "react-icons/si";

const Badge = ({ text }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
    {text}
  </span>
);

const METHODS = [
  {
    key: "card",
    label: "Credit / Debit Card",
    icon: () => (
      <div className="flex items-center gap-2 text-gray-600">
        <SiVisa />
        <SiMastercard />
        <SiAmericanexpress />
        <SiDiscover />
      </div>
    ),
  },
  {
    key: "upi",
    label: "UPI",
    icon: () => (
      <div className="flex items-center gap-2 text-gray-600">
        <SiPhonepe />
        <SiGooglepay />
        <SiPaytm />
        <Badge text="CRED" />
      </div>
    ),
  },
  { key: "paypal", label: "PayPal", icon: () => <SiPaypal className="text-[#00457C]" /> },
  { key: "cod", label: "Cash on Delivery", icon: () => <FaMoneyBillWave className="text-green-600" /> },
];

const onlyDigits = (s) => (s || "").replace(/\D/g, "");

// Luhn check
const luhn = (num) => {
  let sum = 0,
    dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

const detectBrand = (d) => {
  if (/^4\d*/.test(d)) return "Visa";
  if (/^5[1-5]\d*/.test(d)) return "Mastercard";
  if (/^3[47]\d*/.test(d)) return "Amex";
  if (/^6(?:011|5)\d*/.test(d)) return "Discover";
  return "";
};

const brandValidLengths = {
  Visa: [13, 16, 19],
  Mastercard: [16],
  Amex: [15],
  Discover: [16],
};

const UPI_PROVIDERS = [
  { name: "PhonePe", icon: SiPhonepe, domain: "@ybl" },
  { name: "GPay", icon: SiGooglepay, domain: "@okaxis" },
  { name: "Paytm", icon: SiPaytm, domain: "@paytm" },
  { name: "CRED", icon: null, domain: "@icici" },
];

const Field = memo(function Field({ label, name, children, hint, touched, error }) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errId = touched && error ? `${name}-error` : undefined;

  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: name,
        "aria-invalid": touched && !!error,
        "aria-describedby": [hintId, errId].filter(Boolean).join(" ") || undefined,
      })
    : children;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {child}
      {hint ? (
        <p id={hintId} className="text-xs text-gray-400 mt-1">
          {hint}
        </p>
      ) : null}
      {touched && error ? (
        <p id={errId} className="text-xs text-red-600 mt-1">
          {error}
        </p>
      ) : null}
    </div>
  );
});

const PaymentMethodSelector = memo(function PaymentMethodSelector({ method, onChange }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">Payment Method</p>
        <span className="text-[11px] text-gray-500">Secure • 256-bit</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {METHODS.map((m) => {
          const ActiveIcon = m.icon;
          const active = method === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChange(m.key)}
              aria-pressed={active}
              className={
                "group relative w-full rounded-2xl transition transform active:scale-[0.98] p-[2px] " +
                (active
                  ? "bg-gradient-to-r from-orange-600 to-yellow-600 shadow-lg"
                  : "bg-gray-200/70 hover:bg-gray-300/60")
              }
            >
              <div
                className={
                  "flex items-center justify-between gap-3 rounded-2xl px-3 py-3 " +
                  (active ? "bg-white shadow-sm" : "bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm")
                }
              >
                <div className="flex items-center gap-3">
                  {m.key === "card" ? (
                    <FaRegCreditCard className="text-gray-700" />
                  ) : m.key === "cod" ? (
                    <FaMoneyBillWave className="text-green-600" />
                  ) : (
                    <ActiveIcon />
                  )}
                  <span className="text-sm font-semibold text-gray-800">{m.label}</span>
                </div>
                <span className={"h-2 w-2 rounded-full " + (active ? "bg-emerald-500" : "bg-gray-300")} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default function CheckoutForm({ onOrderPlaced }) {
  const [method, setMethod] = useState(() => {
    try {
      return localStorage.getItem("payMethod") || "card";
    } catch {
      return "card";
    }
  });
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [data, setData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    upi: "",
    paypalEmail: "",
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    address1: "",
    address2: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("payMethod", method);
    } catch {}
  }, [method]);

  const brand = useMemo(() => detectBrand(onlyDigits(data.cardNumber)), [data.cardNumber]);

  const setField = useCallback((name, value) => {
    setData((d) => (d[name] === value ? d : { ...d, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const markTouched = useCallback((name) => {
    setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
  }, []);

  const onCardNumber = useCallback(
    (e) => {
      const digits = onlyDigits(e.target.value).slice(0, 19);
      const groups = digits.match(/.{1,4}/g) || [];
      setField("cardNumber", groups.join(" "));
    },
    [setField]
  );

  const onExpiry = useCallback(
    (e) => {
      const digits = onlyDigits(e.target.value).slice(0, 4);
      const mm = digits.slice(0, 2);
      const yy = digits.slice(2, 4);
      setField("expiry", mm + (yy ? "/" + yy : ""));
    },
    [setField]
  );

  const onCVV = useCallback(
    (e) => {
      const max = brand === "Amex" ? 4 : 3;
      setField("cvv", onlyDigits(e.target.value).slice(0, max));
    },
    [brand, setField]
  );

  const applyUPISuffix = useCallback(
    (suffix) => {
      const cur = String(data.upi || "");
      const base = cur.includes("@") ? cur.split("@")[0] : cur || "yourname";
      setField("upi", `${base}${suffix}`);
      markTouched("upi");
    },
    [data.upi, setField, markTouched]
  );

  const validateExpiryNotPast = (exp) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) return false;
    const [mm, yy] = exp.split("/");
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    // Use last day of expiry month 23:59:59
    const expiryDate = new Date(year, month, 0, 23, 59, 59);
    const now = new Date();
    return expiryDate >= now;
  };

  const validateCardLengthByBrand = (digits, brand) => {
    if (!brand) return digits.length >= 13 && digits.length <= 19;
    const allowed = brandValidLengths[brand];
    return allowed ? allowed.includes(digits.length) : digits.length >= 13 && digits.length <= 19;
  };

  const validate = useCallback(() => {
    const v = {};
    if (!data.fullName.trim()) v.fullName = "Name is required";
    if (!/^[6-9]\d{9}$/.test(onlyDigits(data.phone))) v.phone = "Enter a valid 10-digit mobile";
    if (!/^\d{6}$/.test(onlyDigits(data.pincode))) v.pincode = "Enter a valid 6-digit pincode";
    if (!data.city.trim()) v.city = "City is required";
    if (!data.state.trim()) v.state = "State is required";
    if (!data.address1.trim()) v.address1 = "Address line is required";

    if (method === "card") {
      const digits = onlyDigits(data.cardNumber);
      if (!validateCardLengthByBrand(digits, brand) || !luhn(digits)) v.cardNumber = "Enter a valid card number";
      if (!data.cardName.trim()) v.cardName = "Name on card is required";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiry)) v.expiry = "Use MM/YY";
      else if (!validateExpiryNotPast(data.expiry)) v.expiry = "Card expired";
      if (!(brand === "Amex" ? /^\d{4}$/.test(data.cvv) : /^\d{3}$/.test(data.cvv))) v.cvv = "Invalid CVV";
    } else if (method === "upi") {
      if (!/^[a-z0-9.\-_]{2,}@[a-z]{2,}$/i.test(data.upi)) v.upi = "Enter a valid UPI ID (e.g., name@bank)";
    } else if (method === "paypal") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paypalEmail)) v.paypalEmail = "Enter a valid email";
    }

    return v;
  }, [data, method, brand]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const v = validate();
      setErrors(v);
      // mark all touched
      setTouched((t) => {
        const all = {};
        Object.keys(data).forEach((k) => (all[k] = true));
        return { ...t, ...all };
      });
      if (Object.keys(v).length) return;

      setBusy(true);
      setStatus("Placing your order…");
      setTimeout(() => {
        setBusy(false);
        setStatus("");
        onOrderPlaced({
          address: `${data.fullName}, ${data.address1}${data.address2 ? ", " + data.address2 : ""}, ${data.city} ${data.pincode}, ${data.state}. Phone: ${data.phone}`,
          method,
        });
      }, 1200);
    },
    [data, method, onOrderPlaced, validate]
  );

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-amber-50 to-white rounded-3xl p-[1px]">
      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-3xl shadow-2xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-600 to-yellow-600 p-5">
          <h2 className="text-xl font-extrabold text-white">Checkout</h2>
        </div>

        <div className="p-5 md:p-8">
          <PaymentMethodSelector method={method} onChange={setMethod} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Payment method details */}
            <div>
              {method === "card" && (
                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-gray-200 to-gray-100">
                  <div className="rounded-2xl p-4 bg-white">
                    <Field label="Card Number" name="cardNumber" hint={brand ? `Detected: ${brand}` : ""} touched={touched.cardNumber} error={errors.cardNumber}>
                      <div className="relative">
                        <input
                          name="cardNumber"
                          value={data.cardNumber}
                          onChange={onCardNumber}
                          onBlur={() => markTouched("cardNumber")}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 5678 9012 3456"
                          disabled={busy}
                          className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {brand === "Visa" && <SiVisa />}
                          {brand === "Mastercard" && <SiMastercard />}
                          {brand === "Amex" && <SiAmericanexpress />}
                          {brand === "Discover" && <SiDiscover />}
                        </div>
                      </div>
                    </Field>

                    <Field label="Name on Card" name="cardName" touched={touched.cardName} error={errors.cardName}>
                      <input
                        name="cardName"
                        value={data.cardName}
                        onChange={(e) => setField("cardName", e.target.value)}
                        onBlur={() => markTouched("cardName")}
                        autoComplete="cc-name"
                        placeholder="As printed on card"
                        disabled={busy}
                        className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry (MM/YY)" name="expiry" touched={touched.expiry} error={errors.expiry}>
                        <input
                          name="expiry"
                          value={data.expiry}
                          onChange={onExpiry}
                          onBlur={() => markTouched("expiry")}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          disabled={busy}
                          className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </Field>

                      <Field label={`CVV${brand === "Amex" ? " (4-digit)" : ""}`} name="cvv" touched={touched.cvv} error={errors.cvv}>
                        <input
                          name="cvv"
                          value={data.cvv}
                          onChange={onCVV}
                          onBlur={() => markTouched("cvv")}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          disabled={busy}
                          className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {method === "upi" && (
                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-gray-200 to-gray-100">
                  <div className="rounded-2xl p-4 bg-white">
                    <Field label="UPI ID" name="upi" touched={touched.upi} error={errors.upi} hint="Example: name@bank">
                      <input
                        name="upi"
                        value={data.upi}
                        onChange={(e) => setField("upi", e.target.value)}
                        onBlur={() => markTouched("upi")}
                        placeholder="yourname@bank"
                        autoComplete="off"
                        inputMode="text"
                        disabled={busy}
                        className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </Field>

                    <div className="flex flex-wrap items-center gap-2">
                      {UPI_PROVIDERS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => applyUPISuffix(p.domain)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
                          disabled={busy}
                          title={`Use ${p.domain}`}
                        >
                          {p.icon ? <p.icon /> : <Badge text="CRED" />}
                          <span className="text-sm">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {method === "paypal" && (
                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-gray-200 to-gray-100">
                  <div className="rounded-2xl p-4 bg-white">
                    <Field label="PayPal Email" name="paypalEmail" touched={touched.paypalEmail} error={errors.paypalEmail}>
                      <input
                        name="paypalEmail"
                        type="email"
                        value={data.paypalEmail}
                        onChange={(e) => setField("paypalEmail", e.target.value)}
                        onBlur={() => markTouched("paypalEmail")}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={busy}
                        className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </Field>
                    <p className="text-xs text-gray-500">You’ll be redirected to PayPal to complete the payment.</p>
                  </div>
                </div>
              )}

              {method === "cod" && (
                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-gray-200 to-gray-100">
                  <div className="rounded-2xl p-4 bg-white text-sm text-gray-600">
                    Pay <strong>cash on delivery</strong>. Please keep the exact amount ready.
                  </div>
                </div>
              )}
            </div>

            {/* Right: Shipping */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>

              <Field label="Full Name" name="fullName" touched={touched.fullName} error={errors.fullName}>
                <input
                  name="fullName"
                  value={data.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  onBlur={() => markTouched("fullName")}
                  autoComplete="name"
                  disabled={busy}
                  className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Mobile Number" name="phone" touched={touched.phone} error={errors.phone}>
                  <input
                    name="phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={data.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    onBlur={() => markTouched("phone")}
                    placeholder="10-digit mobile"
                    disabled={busy}
                    className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </Field>
                <Field label="Pincode" name="pincode" touched={touched.pincode} error={errors.pincode}>
                  <input
                    name="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={data.pincode}
                    onChange={(e) => setField("pincode", e.target.value)}
                    onBlur={() => markTouched("pincode")}
                    placeholder="6-digit"
                    disabled={busy}
                    className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" name="city" touched={touched.city} error={errors.city}>
                  <input
                    name="city"
                    value={data.city}
                    onChange={(e) => setField("city", e.target.value)}
                    onBlur={() => markTouched("city")}
                    autoComplete="address-level2"
                    disabled={busy}
                    className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </Field>
                <Field label="State" name="state" touched={touched.state} error={errors.state}>
                  <input
                    name="state"
                    value={data.state}
                    onChange={(e) => setField("state", e.target.value)}
                    onBlur={() => markTouched("state")}
                    autoComplete="address-level1"
                    disabled={busy}
                    className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </Field>
              </div>

              <Field label="Address line 1" name="address1" touched={touched.address1} error={errors.address1}>
                <input
                  name="address1"
                  value={data.address1}
                  onChange={(e) => setField("address1", e.target.value)}
                  onBlur={() => markTouched("address1")}
                  autoComplete="address-line1"
                  placeholder="House no, street, area"
                  disabled={busy}
                  className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </Field>

              <Field label="Address line 2 (optional)" name="address2" touched={touched.address2} error={errors.address2}>
                <input
                  name="address2"
                  value={data.address2}
                  onChange={(e) => setField("address2", e.target.value)}
                  autoComplete="address-line2"
                  placeholder="Landmark, etc."
                  disabled={busy}
                  className="w-full rounded-xl bg-white/80 border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </Field>
            </div>
          </div>

          {Object.values(errors).some(Boolean) ? (
            <div className="mt-2 text-sm text-red-600">Please fix the highlighted fields.</div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className={
              "mt-6 w-full md:w-auto px-6 py-3 rounded-xl text-white font-semibold transition " +
              (busy
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-yellow-600 hover:opacity-95 shadow-xl")
            }
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing…
              </span>
            ) : (
              "Place Order"
            )}
          </button>

          {status ? (
            <p className="mt-3 text-sm text-gray-600" aria-live="polite">
              {status}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
