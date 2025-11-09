// src/pages/CheckoutForm.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "./axiosInstance";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

/* -------- load Razorpay script once -------- */
function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.Razorpay) {
      setLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => setLoaded(true);
    s.onerror = () => setLoaded(false);
    document.body.appendChild(s);
  }, []);
  return loaded;
}

const Field = React.memo(function Field({ label, name, children, touched, error }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {touched && error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
});

export default function CheckoutForm({ onOrderPlaced, totalAmount }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [data, setData] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    address1: "",
    address2: "",
    email: "",
  });

  const rzpReady = useRazorpayScript();
  const RZP_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || "";

  const setField = (name, value) => {
    setData((d) => (d[name] === value ? d : { ...d, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const markTouched = (name) => {
    setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
  };

  const validate = useCallback(() => {
    const v = {};
    if (!data.fullName.trim()) v.fullName = "Name is required";
    if (!/^[6-9]\d{9}$/.test((data.phone || "").replace(/\D/g, "")))
      v.phone = "Enter a valid 10-digit mobile";
    if (!/^\d{6}$/.test((data.pincode || "").replace(/\D/g, "")))
      v.pincode = "Enter a valid 6-digit pincode";
    if (!data.city.trim()) v.city = "City is required";
    if (!data.state.trim()) v.state = "State is required";
    if (!data.address1.trim()) v.address1 = "Address is required";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      v.email = "Valid email required";
    if (!(Number(totalAmount) > 0)) v.amount = "Invalid amount";
    return v;
  }, [data, totalAmount]);

  const fullAddress = useMemo(() => {
    const p = (s) => String(s || "").trim();
    return `${p(data.fullName)}, ${p(data.address1)}${
      p(data.address2) ? ", " + p(data.address2) : ""
    }, ${p(data.city)} ${p(data.pincode)}, ${p(data.state)}. Phone: ${p(
      data.phone
    )}`;
  }, [data]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched(Object.keys(data).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.keys(v).length) return;

    if (!rzpReady || !RZP_KEY) {
      return setStatus("Razorpay not ready. Check REACT_APP_RAZORPAY_KEY_ID.");
    }

    setStatus("");
    setBusy(true);

    const subtotal = Number(totalAmount) || 0;
    const grandTotal = subtotal;

    try {
      const res = await axios.post("/api/razorpay/create-order", {
        amount: grandTotal,
        currency: "INR",
      });

      if (!res?.data?.success || !res.data.orderId)
        throw new Error("Failed to create order");

      const { orderId, amount: amountPaise, currency } = res.data;

      const options = {
        key: RZP_KEY,
        amount: amountPaise,
        currency,
        name: "VKart (Test)",
        description: "Secure Payment via Razorpay",
        order_id: orderId,
        prefill: {
          name: data.fullName || "VKart Demo User",
          email: data.email || "demo@example.com",
          contact: data.phone || "9999999999",
        },
        notes: { shipping_address: fullAddress },
        theme: { color: "#ff7a00" },
        handler: function () {
          setBusy(false);
          onOrderPlaced?.({ address: fullAddress, method: "razorpay" });
          // redirect to order tracking page
          navigate("/orderstages", { replace: true });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setBusy(false);
        setStatus("Payment failed in sandbox. Try again.");
      });
      rzp.on("modal.closed", function () {
        // reset state if user cancels popup
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setBusy(false);
      setStatus("Unable to initialize payment.");
    }
  };

  const subtotal = Number(totalAmount) || 0;
  const grandTotal = subtotal;

  // prevent user from going back to payment page after success
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePop = () => navigate("/products", { replace: true });
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [navigate]);

  return (
    <div className="w-full bg-[#f9fafb] py-10">
      <div className="max-w-6xl mx-auto bg-gray-100 border border-gray-200 text-gray-700 text-sm text-center py-2 mb-6 rounded-lg">
        ⚙ TEST MODE — Payments are simulated via Razorpay sandbox. No real money will be charged.
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-6 text-sm text-gray-500">
        <span className="text-gray-700 font-medium">Cart</span> →{" "}
        <span className="text-orange-600 font-semibold">Details & Payment</span> → Confirmation
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white shadow-xl rounded-3xl p-6 md:p-10"
      >
        {/* left */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Checkout</h2>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>

            <Field label="Full Name" name="fullName" touched={touched.fullName} error={errors.fullName}>
              <input
                name="fullName"
                value={data.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                onBlur={() => markTouched("fullName")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
              />
            </Field>

            <Field label="Mobile Number" name="phone" touched={touched.phone} error={errors.phone}>
              <input
                name="phone"
                inputMode="numeric"
                value={data.phone}
                onChange={(e) => setField("phone", e.target.value)}
                onBlur={() => markTouched("phone")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
              />
            </Field>

            <Field label="Email" name="email" touched={touched.email} error={errors.email}>
              <input
                name="email"
                type="email"
                value={data.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => markTouched("email")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
              />
            </Field>

            <Field label="Address line 1" name="address1" touched={touched.address1} error={errors.address1}>
              <input
                name="address1"
                value={data.address1}
                onChange={(e) => setField("address1", e.target.value)}
                onBlur={() => markTouched("address1")}
                placeholder="House no, street, area"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
              />
            </Field>

            <Field label="Address line 2 (optional)" name="address2">
              <input
                name="address2"
                value={data.address2}
                onChange={(e) => setField("address2", e.target.value)}
                placeholder="Landmark, etc."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City" name="city" touched={touched.city} error={errors.city}>
                <input
                  name="city"
                  value={data.city}
                  onChange={(e) => setField("city", e.target.value)}
                  onBlur={() => markTouched("city")}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
                />
              </Field>
              <Field label="State" name="state" touched={touched.state} error={errors.state}>
                <input
                  name="state"
                  value={data.state}
                  onChange={(e) => setField("state", e.target.value)}
                  onBlur={() => markTouched("state")}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
                />
              </Field>
            </div>

            <Field label="Pincode" name="pincode" touched={touched.pincode} error={errors.pincode}>
              <input
                name="pincode"
                inputMode="numeric"
                value={data.pincode}
                onChange={(e) => setField("pincode", e.target.value)}
                onBlur={() => markTouched("pincode")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300"
              />
            </Field>
          </div>
        </div>

        {/* right: order summary */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 h-fit self-start">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{INR(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
              <span>Total</span>
              <span>{INR(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || !rzpReady}
            className={`mt-6 w-full rounded-xl px-6 py-3 font-semibold text-white transition ${
              busy || !rzpReady
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-yellow-600 hover:opacity-95 shadow-lg"
            }`}
          >
            {busy ? "Processing…" : "Pay & Place Order (Test)"}
          </button>

          {status && (
            <p className="mt-3 text-sm text-gray-600 text-center" aria-live="polite">
              {status}
            </p>
          )}

          <div className="mt-6 text-xs text-gray-500 border-t pt-3">
            <p>
              <strong>Test Card:</strong> 6070 1010 1010 1010 • any future expiry • any CVV
            </p>
            <p>
              <strong>UPI:</strong> success@razorpay (pass) or failure@razorpay (fail)
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <FaCheckCircle className="text-emerald-500" /> Secure Payment via Razorpay
          </div>
        </div>
      </form>
    </div>
  );
}
