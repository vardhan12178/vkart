import React, { useEffect, useMemo, useState } from "react";
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

// Tiny fallback badge for brands without an icon in react-icons
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

// helpers
const onlyDigits = (s) => s.replace(/\D/g, "");
const luhn = (num) => {
  let sum = 0, dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  return sum % 10 === 0;
};
const detectBrand = (d) => {
  if (/^4\d{0,}$/.test(d)) return "Visa";
  if (/^5[1-5]\d{0,}$/.test(d)) return "Mastercard";
  if (/^3[47]\d{0,}$/.test(d)) return "Amex";
  if (/^6(?:011|5)\d{0,}$/.test(d)) return "Discover";
  return "";
};

const UPI_PROVIDERS = [
  { name: "PhonePe", icon: SiPhonepe, domain: "@ybl" },
  { name: "GPay", icon: SiGooglepay, domain: "@okaxis" },
  { name: "Paytm", icon: SiPaytm, domain: "@paytm" },
  // CRED has no react-icon – use Badge
  { name: "CRED", icon: null, domain: "@icici" },
];

const CheckoutForm = ({ onOrderPlaced }) => {
  const [method, setMethod] = useState(() => localStorage.getItem("payMethod") || "card");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const [data, setData] = useState({
    // card
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    // upi/paypal
    upi: "",
    paypalEmail: "",
    // shipping
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    address1: "",
    address2: "",
  });

  useEffect(() => localStorage.setItem("payMethod", method), [method]);

  const brand = useMemo(() => detectBrand(onlyDigits(data.cardNumber)), [data.cardNumber]);

  const setField = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // masks
  const onCardNumber = (e) => {
    const digits = onlyDigits(e.target.value).slice(0, 19);
    const groups = digits.match(/.{1,4}/g) || [];
    setField("cardNumber", groups.join(" "));
  };
  const onExpiry = (e) => {
    const digits = onlyDigits(e.target.value).slice(0, 4);
    const mm = digits.slice(0, 2);
    const yy = digits.slice(2, 4);
    setField("expiry", mm + (yy ? "/" + yy : ""));
  };
  const onCVV = (e) => {
    const max = brand === "Amex" ? 4 : 3;
    setField("cvv", onlyDigits(e.target.value).slice(0, max));
  };

  const applyUPISuffix = (suffix) => {
    setField("upi", (prev) => {
      if (!prev) return "yourname" + suffix;
      const parts = prev.split("@");
      if (parts.length === 1) return prev + suffix;
      return parts[0] + suffix;
    });
    setTouched((t) => ({ ...t, upi: true }));
  };

  // validation
  const validate = () => {
    const v = {};
    if (!data.fullName.trim()) v.fullName = "Name is required";
    if (!/^[6-9]\d{9}$/.test(onlyDigits(data.phone))) v.phone = "Enter a valid 10-digit mobile";
    if (!/^\d{6}$/.test(onlyDigits(data.pincode))) v.pincode = "Enter a valid 6-digit pincode";
    if (!data.city.trim()) v.city = "City is required";
    if (!data.state.trim()) v.state = "State is required";
    if (!data.address1.trim()) v.address1 = "Address line is required";

    if (method === "card") {
      const digits = onlyDigits(data.cardNumber);
      if (digits.length < 13 || !luhn(digits)) v.cardNumber = "Enter a valid card number";
      if (!data.cardName.trim()) v.cardName = "Name on card is required";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiry)) v.expiry = "Use MM/YY";
      if (!(brand === "Amex" ? /^\d{4}$/.test(data.cvv) : /^\d{3}$/.test(data.cvv))) v.cvv = "Invalid CVV";
    } else if (method === "upi") {
      if (!/^[a-z0-9.\-_]{2,}@[a-z]{2,}$/i.test(data.upi)) v.upi = "Enter a valid UPI ID (e.g., name@bank)";
    } else if (method === "paypal") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paypalEmail)) v.paypalEmail = "Enter a valid email";
    }
    return v;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched(Object.fromEntries(Object.keys({ ...data }).map((k) => [k, true])));
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
  };

  const Field = ({ label, name, children, hint }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
      {touched[name] && errors[name] ? (
        <p className="text-xs text-red-600 mt-1">{errors[name]}</p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

      {/* Payment selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {METHODS.map((m) => {
            const ActiveIcon = m.icon;
            const active = method === m.key;
            return (
              <label
                key={m.key}
                className={`cursor-pointer rounded-2xl border p-3 flex items-center justify-between gap-3 transition
                ${active ? "border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 ring-1 ring-orange-300" : "border-gray-200 hover:bg-gray-50"}`}
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
                <input
                  type="radio"
                  name="method"
                  value={m.key}
                  checked={active}
                  onChange={() => setMethod(m.key)}
                  className="hidden"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: payment details */}
        <div>
          {method === "card" && (
            <div className="rounded-2xl ring-1 ring-gray-200 p-4">
              <Field label="Card Number" name="cardNumber" hint={brand ? `Detected: ${brand}` : ""}>
                <div className="relative">
                  <input
                    id="cardNumber"
                    value={data.cardNumber}
                    onChange={onCardNumber}
                    onBlur={() => setTouched((t) => ({ ...t, cardNumber: true }))}
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {brand === "Visa" && <SiVisa />}
                    {brand === "Mastercard" && <SiMastercard />}
                    {brand === "Amex" && <SiAmericanexpress />}
                    {brand === "Discover" && <SiDiscover />}
                  </div>
                </div>
              </Field>
              <Field label="Name on Card" name="cardName">
                <input
                  id="cardName"
                  value={data.cardName}
                  onChange={(e) => setField("cardName", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, cardName: true }))}
                  placeholder="As printed on card"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry (MM/YY)" name="expiry">
                  <input
                    id="expiry"
                    value={data.expiry}
                    onChange={onExpiry}
                    onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
                    inputMode="numeric"
                    placeholder="MM/YY"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </Field>
                <Field label={`CVV${brand === "Amex" ? " (4-digit)" : ""}`} name="cvv">
                  <input
                    id="cvv"
                    value={data.cvv}
                    onChange={onCVV}
                    onBlur={() => setTouched((t) => ({ ...t, cvv: true }))}
                    inputMode="numeric"
                    placeholder="123"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </Field>
              </div>
            </div>
          )}

          {method === "upi" && (
            <div className="rounded-2xl ring-1 ring-gray-200 p-4">
              <Field label="UPI ID" name="upi" hint="Example: name@bank">
                <input
                  id="upi"
                  value={data.upi}
                  onChange={(e) => setField("upi", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, upi: true }))}
                  placeholder="yourname@bank"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </Field>
              <div className="flex items-center gap-2">
                {UPI_PROVIDERS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyUPISuffix(p.domain)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                    title={p.name}
                  >
                    {p.icon ? <p.icon /> : <Badge text="CRED" />}
                    <span className="text-sm">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === "paypal" && (
            <div className="rounded-2xl ring-1 ring-gray-200 p-4">
              <Field label="PayPal Email" name="paypalEmail">
                <input
                  id="paypalEmail"
                  type="email"
                  value={data.paypalEmail}
                  onChange={(e) => setField("paypalEmail", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, paypalEmail: true }))}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </Field>
              <p className="text-xs text-gray-500">You’ll be redirected to PayPal to complete the payment.</p>
            </div>
          )}

          {method === "cod" && (
            <div className="rounded-2xl ring-1 ring-gray-200 p-4 text-sm text-gray-600">
              Pay <strong>cash on delivery</strong>. Please keep the exact amount ready.
            </div>
          )}
        </div>

        {/* Right: shipping */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
          <Field label="Full Name" name="fullName">
            <input
              id="fullName"
              value={data.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Mobile Number" name="phone">
              <input
                id="phone"
                inputMode="numeric"
                value={data.phone}
                onChange={(e) => setField("phone", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="10-digit mobile"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </Field>
            <Field label="Pincode" name="pincode">
              <input
                id="pincode"
                inputMode="numeric"
                value={data.pincode}
                onChange={(e) => setField("pincode", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, pincode: true }))}
                placeholder="6-digit"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City" name="city">
              <input
                id="city"
                value={data.city}
                onChange={(e) => setField("city", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </Field>
            <Field label="State" name="state">
              <input
                id="state"
                value={data.state}
                onChange={(e) => setField("state", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, state: true }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </Field>
          </div>
          <Field label="Address line 1" name="address1">
            <input
              id="address1"
              value={data.address1}
              onChange={(e) => setField("address1", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, address1: true }))}
              placeholder="House no, street, area"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </Field>
          <Field label="Address line 2 (optional)" name="address2">
            <input
              id="address2"
              value={data.address2}
              onChange={(e) => setField("address2", e.target.value)}
              placeholder="Landmark, etc."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </Field>
        </div>
      </div>

      {Object.values(errors).some(Boolean) && (
        <div className="mt-2 text-sm text-red-600">Please fix the highlighted fields.</div>
      )}

      <button
        type="submit"
        disabled={busy}
        className={`mt-6 w-full md:w-auto px-6 py-3 rounded-xl text-white font-semibold transition
        ${busy ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}
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

      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
    </form>
  );
};

export default CheckoutForm;
