import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCheckCircle, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity, FaGlobe, FaMailBulk, FaShieldAlt, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "./axiosInstance";
import CheckoutPreview from "./CheckoutPreview";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.4s ease-out forwards; }
  `}</style>
);

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

/* -------- Razorpay Script Hook -------- */
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

/* -------- Polished Input Component -------- */
const InputField = React.memo(function InputField({ label, name, value, onChange, onBlur, error, touched, icon: Icon, placeholder, type = "text", inputMode }) {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {Icon && <Icon className={`text-lg transition-colors ${touched && error ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500"}`} />}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-xl border-0 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-gray-400 focus:ring-2 ${touched && error
            ? "ring-red-300 focus:ring-red-500 bg-red-50/30"
            : "ring-gray-200 focus:ring-orange-500/50 hover:ring-gray-300"
            }`}
        />
      </div>
      {touched && error && (
        <p className="mt-1.5 ml-1 text-xs font-bold text-red-500 flex items-center gap-1 animate-fade-up">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" /> {error}
        </p>
      )}
    </div>
  );
});

export default function CheckoutForm({ onOrderPlaced, totalAmount }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [showReview, setShowReview] = useState(false);
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
  const [addresses, setAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const cartItems = useSelector((s) => s.cart);

  const rzpReady = useRazorpayScript();
  const RZP_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || "";
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const loadAddresses = async () => {
      try {
        const res = await axios.get("/api/profile/addresses");
        if (cancelled) return;
        const list = Array.isArray(res?.data?.addresses) ? res.data.addresses : [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault);
        if (def) {
          setSelectedAddressId(def._id);
          setData((d) => ({
            ...d,
            fullName: def.fullName || d.fullName,
            phone: def.phone || d.phone,
            email: def.email || d.email,
            address1: def.address1 || d.address1,
            address2: def.address2 || d.address2,
            city: def.city || d.city,
            state: def.state || d.state,
            pincode: def.pincode || d.pincode,
          }));
        }
      } catch {
        // ignore
      }
    };
    loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const loadWallet = async () => {
      try {
        const res = await axios.get("/api/wallet");
        if (cancelled) return;
        setWalletBalance(Number(res?.data?.balance) || 0);
      } catch {
        // ignore
      }
    };
    loadWallet();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // --- Logic ---
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
    return `${p(data.fullName)}, ${p(data.address1)}${p(data.address2) ? ", " + p(data.address2) : ""
      }, ${p(data.city)} ${p(data.pincode)}, ${p(data.state)}. Phone: ${p(
        data.phone
      )}`;
  }, [data]);

  /* --- Step 1: Validate & show review overlay --- */
  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched(Object.keys(data).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.keys(v).length) return;
    setShowReview(true);
  };

  /* --- Step 2: Confirm & proceed to payment --- */
  const proceedToPayment = async () => {
    if (!rzpReady || !RZP_KEY) {
      return setStatus("Razorpay not ready. Check REACT_APP_RAZORPAY_KEY_ID.");
    }

    setStatus("");
    setBusy(true);
    setShowReview(false);

    const grandTotal = Number(totalAmount) || 0;

    try {
      if (isAuthenticated && saveAddress) {
        await axios.post("/api/profile/addresses", {
          label: "Default",
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: "India",
          isDefault: true,
        });
      }

      const walletApplied = useWallet ? Math.min(walletBalance, grandTotal) : 0;
      const payable = Math.max(0, grandTotal - walletApplied);

      if (payable === 0) {
        setBusy(false);
        onOrderPlaced?.({
          address: fullAddress,
          method: "WALLET",
          walletUsed: walletApplied,
        });
        navigate("/orderstages", { replace: true });
        return;
      }

      const res = await axios.post("/api/razorpay/create-order", {
        amount: payable,
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
          name: data.fullName || "VKart User",
          email: data.email || "user@example.com",
          contact: data.phone || "9999999999",
        },
        notes: { shipping_address: fullAddress },
        theme: { color: "#f97316" },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("/api/razorpay/verify", response);
            if (!verifyRes?.data?.success) {
              throw new Error("Payment verification failed");
            }
            setBusy(false);
            onOrderPlaced?.({
              address: fullAddress,
              method: "CARD",
              walletUsed: walletApplied,
              payment: {
                paymentId: response?.razorpay_payment_id,
                paymentOrderId: response?.razorpay_order_id,
                signature: response?.razorpay_signature,
              },
            });
            navigate("/orderstages", { replace: true });
          } catch (err) {
            console.error(err);
            setBusy(false);
            setStatus("Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setBusy(false);
        setStatus("Payment failed. Please try again.");
      });
      rzp.on("modal.closed", function () {
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setBusy(false);
      setStatus("Unable to initialize payment.");
    }
  };

  const walletAppliedPreview = useWallet ? Math.min(walletBalance, Number(totalAmount) || 0) : 0;
  const payablePreview = Math.max(0, (Number(totalAmount) || 0) - walletAppliedPreview);

  if (!isAuthenticated) return <CheckoutPreview />;

  return (
    <>
    {/* ---- ORDER REVIEW OVERLAY ---- */}
    {showReview && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowReview(false)}>
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowReview(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-bold">&times;</button>

          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <FaCheckCircle className="text-orange-500" /> Review Your Order
          </h2>

          {/* Cart Items */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items ({cartItems.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  {item.thumbnail && <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.title || item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{INR((item.price || 0) * (item.quantity || 1))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><FaMapMarkerAlt className="text-orange-500" /> Shipping To</h3>
            <p className="text-sm font-semibold text-gray-800">{data.fullName}</p>
            <p className="text-xs text-gray-600 mt-1">{data.address1}{data.address2 ? `, ${data.address2}` : ""}</p>
            <p className="text-xs text-gray-600">{data.city}, {data.state} — {data.pincode}</p>
            <p className="text-xs text-gray-500 mt-1">{data.phone} &bull; {data.email}</p>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600"><span>Order Total</span><span className="font-bold text-gray-900">{INR(Number(totalAmount) || 0)}</span></div>
            {walletAppliedPreview > 0 && <div className="flex justify-between text-sm text-green-600"><span>Wallet Applied</span><span className="font-bold">−{INR(walletAppliedPreview)}</span></div>}
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between text-base"><span className="font-bold text-gray-900">Payable Amount</span><span className="text-xl font-black text-orange-600">{INR(payablePreview)}</span></div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowReview(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">Edit Details</button>
            <button type="button" onClick={proceedToPayment} disabled={busy} className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-orange-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {busy ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</> : <>Confirm & Pay <FaArrowRight size={12} /></>}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="relative w-full bg-[#f8f9fa] py-8 sm:py-12 overflow-hidden pb-32 lg:pb-12">
      <AnimStyles />

      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">

        {/* Test Mode Banner */}
        <div className="mb-8 rounded-xl bg-blue-50/80 border border-blue-100 p-3 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 shadow-sm backdrop-blur-sm">
          <FaShieldAlt /> <span>TEST MODE — No real money will be charged.</span>
        </div>

        <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- LEFT: Form Fields --- */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-gray-200/40 border border-gray-100">

              <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                  <FaLock size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">Secure Checkout</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Please fill in your shipping details</p>
                </div>
              </div>

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Saved Addresses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((a) => (
                      <button
                        type="button"
                        key={a._id}
                        onClick={() => {
                          setSelectedAddressId(a._id);
                          setData((d) => ({
                            ...d,
                            fullName: a.fullName || d.fullName,
                            phone: a.phone || d.phone,
                            email: a.email || d.email,
                            address1: a.address1 || d.address1,
                            address2: a.address2 || d.address2,
                            city: a.city || d.city,
                            state: a.state || d.state,
                            pincode: a.pincode || d.pincode,
                          }));
                        }}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          selectedAddressId === a._id
                            ? "border-orange-400 bg-orange-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="text-sm font-bold text-gray-900">{a.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {a.address1} {a.address2 ? `, ${a.address2}` : ""}, {a.city} {a.pincode}
                        </div>
                        <div className="text-xs text-gray-500">{a.state}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> VKart Wallet
                  </h3>
                  <span className="text-xs font-bold text-gray-600">Balance: ₹{Math.round(walletBalance)}</span>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  Use wallet balance for this order
                </label>
                {useWallet && walletBalance < Number(totalAmount || 0) && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="Add money"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const amt = Number(topupAmount);
                        if (!amt || amt <= 0) return;
                        try {
                          const res = await axios.post("/api/wallet/topup", { amount: amt });
                          const { orderId, amount: amountPaise, currency } = res.data;
                          const options = {
                            key: RZP_KEY,
                            amount: amountPaise,
                            currency,
                            name: "VKart Wallet",
                            description: "Wallet Top-up",
                            order_id: orderId,
                            handler: async function (response) {
                              await axios.post("/api/wallet/verify", {
                                ...response,
                                amount: amt,
                              });
                              const w = await axios.get("/api/wallet");
                              setWalletBalance(Number(w?.data?.balance) || 0);
                              setTopupAmount("");
                            },
                          };
                          const rzp = new window.Razorpay(options);
                          rzp.open();
                        } catch (err) {
                          setStatus("Wallet top-up failed.");
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold"
                    >
                      Add Money
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Contact Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <InputField
                    label="Full Name" name="fullName"
                    icon={FaUser} placeholder="Enter your name"
                    value={data.fullName} onChange={(e) => setField("fullName", e.target.value)} onBlur={() => markTouched("fullName")}
                    error={errors.fullName} touched={touched.fullName}
                  />
                  <InputField
                    label="Mobile Number" name="phone" inputMode="numeric"
                    icon={FaPhone} placeholder="9876543210"
                    value={data.phone} onChange={(e) => setField("phone", e.target.value)} onBlur={() => markTouched("phone")}
                    error={errors.phone} touched={touched.phone}
                  />
                  <div className="md:col-span-2">
                    <InputField
                      label="Email Address" name="email" type="email"
                      icon={FaEnvelope} placeholder="your.email@example.com"
                      value={data.email} onChange={(e) => setField("email", e.target.value)} onBlur={() => markTouched("email")}
                      error={errors.email} touched={touched.email}
                    />
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Delivery Address
                </h3>

                <InputField
                  label="Address Line 1" name="address1"
                  icon={FaMapMarkerAlt} placeholder="House No, Street, Area"
                  value={data.address1} onChange={(e) => setField("address1", e.target.value)} onBlur={() => markTouched("address1")}
                  error={errors.address1} touched={touched.address1}
                />

                <InputField
                  label="Address Line 2 (Optional)" name="address2"
                  icon={FaMapMarkerAlt} placeholder="Landmark (Optional)"
                  value={data.address2} onChange={(e) => setField("address2", e.target.value)}
                />

                <div className="grid grid-cols-2 gap-x-6">
                  <InputField
                    label="City" name="city"
                    icon={FaCity} placeholder="City"
                    value={data.city} onChange={(e) => setField("city", e.target.value)} onBlur={() => markTouched("city")}
                    error={errors.city} touched={touched.city}
                  />
                  <InputField
                    label="State" name="state"
                    icon={FaGlobe} placeholder="State"
                    value={data.state} onChange={(e) => setField("state", e.target.value)} onBlur={() => markTouched("state")}
                    error={errors.state} touched={touched.state}
                  />
                </div>
                <div className="w-1/2 pr-3">
                  <InputField
                    label="Pincode" name="pincode" inputMode="numeric"
                    icon={FaMailBulk} placeholder="500001"
                    value={data.pincode} onChange={(e) => setField("pincode", e.target.value)} onBlur={() => markTouched("pincode")}
                    error={errors.pincode} touched={touched.pincode}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <input
                  id="save-address"
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="save-address" className="text-xs font-bold text-gray-600">
                  Save this address for next time
                </label>
              </div>

            </div>
          </div>

          {/* --- RIGHT: Payment Summary (Dark Mode for Contrast) --- */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-900/30 overflow-hidden border border-white/10">

              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="relative z-10 text-lg font-bold text-white mb-8 flex items-center gap-2">
                Payment Details
              </h3>

              <div className="relative z-10 space-y-6 mb-8">
                <div className="flex justify-between text-sm text-gray-400 font-medium">
                  <span>Order Total</span>
                  <span className="text-white">{INR(Number(totalAmount) || 0)}</span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex justify-between items-end">
                  <span className="text-gray-300 text-sm font-medium">Payable Amount</span>
                  <span className="text-3xl font-black text-white tracking-tight">{INR(Number(totalAmount) || 0)}</span>
                </div>
              </div>

              {/* Test Mode Credentials Block */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Test Mode: RuPay Card Details
                </p>

                <div className="flex items-start gap-3">
                  {/* SVG Card Icon */}
                  <div className="p-2 bg-white/10 rounded-md shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>

                  <div className="text-xs text-gray-300">
                    <p className="text-white font-bold text-sm mb-0.5">RuPay Test Card</p>
                    <p className="mb-0.5">Card: <span className="text-white font-mono font-semibold">6070 1010 1010 1010</span></p>
                    <div className="flex gap-3">
                      <p>Exp: <span className="text-white">12/34</span></p>
                      <p>CVV: <span className="text-white">123</span></p>
                    </div>
                    <p className="mt-0.5 text-emerald-400">OTP: 123456</p>
                  </div>
                </div>
              </div>


              {/* Desktop Button */}
              <button
                type="submit"
                disabled={busy || !rzpReady}
                className={`hidden lg:flex w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all transform active:scale-[0.98] items-center justify-center gap-2 ${busy || !rzpReady
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-500/40 hover:brightness-110"
                  }`}
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay Now <FaArrowRight size={12} /></>
                )}
              </button>

              {status && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-medium">
                  {status}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium mb-2">
                  <FaCheckCircle className="text-green-500" />
                  <span>Razorpay Secured (256-bit SSL)</span>
                </div>
              </div>

            </div>
          </div>

          {/* --- MOBILE STICKY FOOTER --- */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3 items-center max-w-6xl mx-auto">
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Total Payable</div>
                <div className="text-xl font-black text-gray-900 leading-none">{INR(Number(totalAmount) || 0)}</div>
              </div>
              <button
                type="submit"
                disabled={busy || !rzpReady}
                className="px-8 h-12 bg-gray-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
              >
                {busy ? "Processing..." : "Pay Now"} <FaArrowRight size={12} />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
    </>
  );
}
