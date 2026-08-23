import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCheckCircle, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity, FaGlobe, FaMailBulk, FaShieldAlt, FaLock, FaArrowRight, FaCreditCard, FaUniversity, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosInstance";
import CheckoutPreview from "./CheckoutPreview";
import { buildVerifiedPaymentMeta, extractVerificationToken } from "../utils/checkoutPayment";
import { qk } from "../query/queryKeys";

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

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.msg ||
  fallback;

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
    <div className="mb-3 sm:mb-5">
      <label htmlFor={name} className="block text-[10px] sm:text-xs font-bold text-[#777168] uppercase tracking-wider mb-1 sm:mb-1.5 ml-0.5">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {Icon && <Icon className={`text-sm sm:text-base transition-colors ${touched && error ? "text-red-400" : "text-gray-400 group-focus-within:text-[#a85d37]"}`} />}
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
          className={`w-full rounded-xl border-0 bg-white h-10 sm:h-11 py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm font-semibold text-[#1d1c19] shadow-xs ring-1 ring-inset transition-all placeholder:text-gray-400 focus:ring-2 ${touched && error
            ? "ring-red-300 focus:ring-red-500 bg-red-50/30"
            : "ring-black/[0.08] focus:ring-[#a85d37]/40 hover:ring-black/15"
            }`}
        />
      </div>
      {touched && error && (
        <p className="mt-1 ml-0.5 text-[10px] sm:text-xs font-bold text-red-500 flex items-center gap-1 animate-fade-up">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" /> {error}
        </p>
      )}
    </div>
  );
});

export default function CheckoutForm({ onOrderPlaced, totalAmount }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showTestCard, setShowTestCard] = useState(false);
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
  const [saveAddress, setSaveAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useWallet, setUseWallet] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const cartItems = useSelector((s) => s.cart);

  const rzpReady = useRazorpayScript();
  const RZP_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || "";
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const { data: addresses = [] } = useQuery({
    queryKey: qk.profile.addresses,
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await axios.get("/api/profile/addresses");
      return Array.isArray(res?.data?.addresses) ? res.data.addresses : [];
    },
    staleTime: 60 * 1000,
  });

  const { data: wallet = null } = useQuery({
    queryKey: qk.profile.wallet,
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await axios.get("/api/wallet");
      return res.data || null;
    },
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (payload) => axios.post("/api/profile/addresses", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.profile.addresses });
    },
  });

  const createWalletTopupMutation = useMutation({
    mutationFn: async (amount) => {
      const res = await axios.post("/api/wallet/topup", { amount });
      return res.data;
    },
  });

  const verifyWalletTopupMutation = useMutation({
    mutationFn: async ({ response, amount }) =>
      axios.post("/api/wallet/verify", {
        ...response,
        amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.profile.wallet });
    },
  });

  useEffect(() => {
    if (!addresses.length || selectedAddressId) return;
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    if (!def) return;
    setSelectedAddressId(def._id);
    setData((d) => ({
      ...d,
      fullName: def.fullName || def.name || d.fullName,
      phone: def.phone || d.phone,
      email: def.email || d.email,
      address1: def.address1 || def.line1 || d.address1,
      address2: def.address2 || def.line2 || d.address2,
      city: def.city || d.city,
      state: def.state || d.state,
      pincode: def.pincode || def.zip || d.pincode,
    }));
  }, [addresses, selectedAddressId]);

  const walletBalance = Number(wallet?.balance) || 0;

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

  /* Save the entered address after a successful order. Non-fatal: the order
     itself carries the address string, so a failure here is only a missed
     convenience for next time. */
  const persistAddressIfNeeded = async () => {
    if (!(isAuthenticated && saveAddress)) return;
    try {
      await saveAddressMutation.mutateAsync({
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
    } catch (err) {
      console.warn("Address save failed (non-fatal):", err);
    }
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
      const walletApplied = useWallet ? Math.min(walletBalance, grandTotal) : 0;
      const payable = Math.max(0, grandTotal - walletApplied);

      if (payable === 0) {
        const orderId = await onOrderPlaced?.({
          address: fullAddress,
          method: "WALLET",
          walletUsed: walletApplied,
        });
        await persistAddressIfNeeded();
        setBusy(false);
        navigate(orderId ? `/order-success/${orderId}` : "/orders", { replace: true });
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
        // Matches VKart's primary CTA color (the "Confirm & Pay" button right
        // behind this modal) rather than the leftover stock Tailwind orange.
        theme: { color: "#1d1c19" },
        // Pre-selects the method chosen in our own in-page picker so
        // Razorpay's modal skips straight to that method's entry form
        // instead of showing its own method-selection screen first. UPI is
        // deliberately not an option here — it isn't enabled on this
        // Razorpay account (Dashboard > Payment Configuration has no UPI
        // block), so offering it would just dead-end with "No appropriate
        // payment method found."
        method: {
          card: paymentMethod === "card",
          netbanking: paymentMethod === "netbanking",
          paylater: paymentMethod === "paylater",
          upi: false,
          wallet: false,
          emi: false,
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("/api/razorpay/verify", response);
            const verificationToken = extractVerificationToken(verifyRes);
            const orderId = await onOrderPlaced?.({
              address: fullAddress,
              method: paymentMethod.toUpperCase(),
              walletUsed: walletApplied,
              payment: buildVerifiedPaymentMeta(response, verificationToken),
            });
            await persistAddressIfNeeded();
            setBusy(false);
            navigate(orderId ? `/order-success/${orderId}` : "/orders", { replace: true });
          } catch (err) {
            console.error(err);
            setBusy(false);
            setStatus(getErrorMessage(err, "Payment verification failed. Please contact support."));
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
      setStatus(getErrorMessage(err, "Unable to initialize payment."));
    }
  };

  const walletAppliedPreview = useWallet ? Math.min(walletBalance, Number(totalAmount) || 0) : 0;
  const payablePreview = Math.max(0, (Number(totalAmount) || 0) - walletAppliedPreview);

  if (!isAuthenticated) return <CheckoutPreview />;

  return (
    <>
    {/* ---- ORDER REVIEW OVERLAY ---- */}
    {showReview && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1d1c19]/50 backdrop-blur-sm p-3 sm:p-4" onClick={() => setShowReview(false)}>
        <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl sm:rounded-[1.6rem] border border-black/10 bg-[#fffdf8] p-4 sm:p-8 shadow-[0_30px_90px_rgba(29,28,25,.24)] animate-fade-up" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowReview(false)} className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#eee8df] text-sm font-bold text-[#777168] transition-colors hover:bg-[#e4ddd3] hover:text-[#1d1c19]">&times;</button>

          <h2 className="mb-4 sm:mb-6 flex items-center gap-2.5 font-editorial text-xl sm:text-3xl font-bold leading-none tracking-tight text-[#1d1c19]">
            <FaCheckCircle className="text-[#a85d37]" size={20} /> Review Your Order
          </h2>

          {/* Cart Items */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Items ({cartItems.length})</h3>
            <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-black/[0.07] bg-[#eeeae2] p-2.5 sm:p-3">
                  {item.thumbnail && <img src={item.thumbnail} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.title || item.name}</p>
                    <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">{INR((item.price || 0) * (item.quantity || 1))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-4 sm:mb-6 rounded-xl border border-[#a85d37]/15 bg-[#f4eee7] p-3 sm:p-4">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#777168]"><FaMapMarkerAlt className="text-[#a85d37]" /> Shipping To</h3>
            <p className="text-xs sm:text-sm font-bold text-gray-800">{data.fullName}</p>
            <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">{data.address1}{data.address2 ? `, ${data.address2}` : ""}</p>
            <p className="text-[11px] sm:text-xs text-gray-600">{data.city}, {data.state} — {data.pincode}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{data.phone} &bull; {data.email}</p>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600"><span>Order Total</span><span className="font-bold text-gray-900">{INR(Number(totalAmount) || 0)}</span></div>
            {walletAppliedPreview > 0 && <div className="flex justify-between text-xs sm:text-sm text-[#59634f]"><span>Wallet Applied</span><span className="font-bold">−{INR(walletAppliedPreview)}</span></div>}
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between text-sm sm:text-base"><span className="font-bold text-gray-900">Payable Amount</span><span className="text-lg sm:text-xl font-black text-[#a85d37]">{INR(payablePreview)}</span></div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <button type="button" onClick={() => setShowReview(false)} className="flex-1 rounded-full border border-black/10 bg-transparent py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#5f5a52] transition-colors hover:bg-[#eee8df] hover:text-[#1d1c19]">Edit Details</button>
            <button type="button" onClick={proceedToPayment} disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1d1c19] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_12px_28px_rgba(29,28,25,.16)] transition-all hover:-translate-y-0.5 hover:bg-[#34312c] disabled:translate-y-0 disabled:opacity-50">
              {busy ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</> : <>Confirm & Pay <FaArrowRight size={11} /></>}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="premium-page premium-checkout relative w-full bg-[#f6f3ed] py-4 sm:py-10 overflow-hidden pb-28 lg:pb-10">
      <AnimStyles />

      {/* Ambient Background */}
      <div className="hidden" />

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">

        {/* Test Mode Banner */}
        <div className="mb-4 sm:mb-6 rounded-xl bg-blue-50/80 border border-blue-100 px-3 py-2 sm:p-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-blue-600 shadow-xs backdrop-blur-xs">
          <FaShieldAlt size={13} /> <span>TEST MODE — No real money will be charged.</span>
        </div>

        <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">

          {/* --- LEFT: Form Fields --- */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 shadow-sm border border-black/[0.06]">

              <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-black/[0.06] pb-3.5 sm:pb-5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner shrink-0">
                  <FaLock size={15} />
                </div>
                <div>
                  <h2 className="font-editorial text-lg sm:text-2xl font-bold text-[#1d1c19] leading-tight">Secure checkout.</h2>
                  <p className="text-xs sm:text-sm text-[#777269] mt-0.5 font-medium">Where should we send your order?</p>
                </div>
              </div>

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 sm:mb-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Saved Addresses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {addresses.map((a) => (
                      <button
                        type="button"
                        key={a._id}
                        onClick={() => {
                          setSelectedAddressId(a._id);
                          setData((d) => ({
                            ...d,
                            fullName: a.fullName || a.name || d.fullName,
                            phone: a.phone || d.phone,
                            email: a.email || d.email,
                            address1: a.address1 || a.line1 || d.address1,
                            address2: a.address2 || a.line2 || d.address2,
                            city: a.city || d.city,
                            state: a.state || d.state,
                            pincode: a.pincode || a.zip || d.pincode,
                          }));
                        }}
                        className={`text-left p-2.5 sm:p-3.5 rounded-xl border transition-all ${
                          selectedAddressId === a._id
                            ? "border-orange-400 bg-orange-50/80 shadow-xs"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{a.fullName || a.name}</div>
                        <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                          {a.address1 || a.line1}{a.address2 || a.line2 ? `, ${a.address2 || a.line2}` : ""}, {a.city} {a.pincode || a.zip}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{a.state}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> VKart Wallet
                  </h3>
                  <span className="text-xs font-bold text-gray-600">Balance: ₹{Math.round(walletBalance)}</span>
                </div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  Use wallet balance for this order
                </label>
                {useWallet && walletBalance < Number(totalAmount || 0) && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="number"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="Add money"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const amt = Number(topupAmount);
                        if (!amt || amt <= 0) return;
                        if (!rzpReady || !RZP_KEY) {
                          setStatus("Razorpay not ready. Check REACT_APP_RAZORPAY_KEY_ID.");
                          return;
                        }
                        setStatus("");
                        try {
                          const { orderId, amount: amountPaise, currency } = await createWalletTopupMutation.mutateAsync(amt);
                          const options = {
                            key: RZP_KEY,
                            amount: amountPaise,
                            currency,
                            name: "VKart Wallet",
                            description: "Wallet Top-up",
                            order_id: orderId,
                            theme: { color: "#1d1c19" },
                            handler: async function (response) {
                              try {
                                await verifyWalletTopupMutation.mutateAsync({
                                  response,
                                  amount: amt,
                                });
                                setTopupAmount("");
                                setStatus("");
                              } catch (err) {
                                setStatus(getErrorMessage(err, "Wallet top-up verification failed."));
                              }
                            },
                          };
                          const rzp = new window.Razorpay(options);
                          rzp.on("payment.failed", function () {
                            setStatus("Wallet top-up payment failed. Please try again.");
                          });
                          rzp.open();
                        } catch (err) {
                          setStatus(getErrorMessage(err, "Wallet top-up failed."));
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold"
                    >
                      Add Money
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 sm:mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Contact Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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
                <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 sm:mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Delivery Address
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

                <div className="grid grid-cols-2 gap-x-4">
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
                <div className="w-1/2 pr-2">
                  <InputField
                    label="Pincode" name="pincode" inputMode="numeric"
                    icon={FaMailBulk} placeholder="500001"
                    value={data.pincode} onChange={(e) => setField("pincode", e.target.value)} onBlur={() => markTouched("pincode")}
                    error={errors.pincode} touched={touched.pincode}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  id="save-address"
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="save-address" className="text-xs font-bold text-gray-600">
                  Save this address for next time
                </label>
              </div>

            </div>
          </div>

          {/* --- RIGHT: Payment Summary --- */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 bg-gray-900 text-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 shadow-xl shadow-gray-900/20 overflow-hidden border border-white/10">

              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="relative z-10 text-base sm:text-lg font-bold text-white mb-3.5 sm:mb-6 flex items-center gap-2">
                Payment Details
              </h3>

              <div className="relative z-10 space-y-2.5 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-400 font-medium">
                  <span>Order Total</span>
                  <span className="text-white font-semibold">{INR(Number(totalAmount) || 0)}</span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex justify-between items-baseline">
                  <span className="text-gray-300 text-xs sm:text-sm font-medium">Payable Amount</span>
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{INR(Number(totalAmount) || 0)}</span>
                </div>
              </div>

              {/* Payment Method Picker */}
              {payablePreview > 0 && (
                <div className="relative z-10 mb-3.5 sm:mb-6">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pay with</p>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {[
                      { id: "card", icon: FaCreditCard, label: "Card", caption: "Credit / Debit" },
                      { id: "netbanking", icon: FaUniversity, label: "Netbanking", caption: "All banks" },
                      { id: "paylater", icon: FaClock, label: "Pay Later", caption: "BNPL" },
                    ].map(({ id, icon: Icon, label, caption }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        aria-pressed={paymentMethod === id}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2 sm:p-2.5 text-center transition-all ${
                          paymentMethod === id
                            ? "border-orange-400 bg-orange-500/10 shadow-xs"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <Icon className={paymentMethod === id ? "text-orange-400" : "text-gray-400"} size={15} />
                        <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">{label}</span>
                        <span className="text-[8px] sm:text-[9px] leading-tight text-gray-400 truncate">{caption}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Mode Credentials Block (collapsible) */}
              <div className="bg-white/5 border border-white/10 rounded-xl mb-3.5 sm:mb-6">
                <button
                  type="button"
                  onClick={() => setShowTestCard((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 text-left"
                >
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                    Test Mode: {paymentMethod === "card" ? "Use test card" : paymentMethod === "netbanking" ? "Test netbanking" : "Test PayLater"}
                  </span>
                  <span className={`text-gray-400 text-xs transition-transform ${showTestCard ? "rotate-180" : ""}`}>▾</span>
                </button>

                {showTestCard && paymentMethod === "netbanking" && (
                  <div className="px-3 pb-3 flex items-start gap-2.5 animate-fade-up">
                    <div className="p-1.5 bg-white/10 rounded-md shrink-0">
                      <FaUniversity className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-[11px] text-gray-300">
                      <p className="text-white font-bold text-xs mb-0.5">Test bank</p>
                      <p className="mb-0.5">Pick any bank — test mode auto-approves it.</p>
                      <p className="mt-0.5 text-emerald-400">No real bank login needed</p>
                    </div>
                  </div>
                )}

                {showTestCard && paymentMethod === "paylater" && (
                  <div className="px-3 pb-3 flex items-start gap-2.5 animate-fade-up">
                    <div className="p-1.5 bg-white/10 rounded-md shrink-0">
                      <FaClock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-[11px] text-gray-300">
                      <p className="text-white font-bold text-xs mb-0.5">Test PayLater provider</p>
                      <p className="mb-0.5">Pick any provider — test mode auto-approves it.</p>
                      <p className="mt-0.5 text-emerald-400">No real account needed</p>
                    </div>
                  </div>
                )}

                {showTestCard && paymentMethod === "card" && (
                  <div className="px-3 pb-3 flex items-start gap-2.5 animate-fade-up">
                    <div className="p-1.5 bg-white/10 rounded-md shrink-0">
                      <FaCreditCard className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-[11px] text-gray-300">
                      <p className="text-white font-bold text-xs mb-0.5">RuPay Test Card</p>
                      <p className="mb-0.5">Card: <span className="text-white font-mono font-semibold">6070 1010 1010 1010</span></p>
                      <div className="flex gap-2.5">
                        <p>Exp: <span className="text-white">12/34</span></p>
                        <p>CVV: <span className="text-white">123</span></p>
                      </div>
                      <p className="mt-0.5 text-emerald-400">OTP: 123456</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Button */}
              <button
                type="submit"
                disabled={busy || !rzpReady}
                className={`hidden lg:flex w-full py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all transform active:scale-[0.98] items-center justify-center gap-2 ${busy || !rzpReady
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-900 hover:bg-gray-100"
                  }`}
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay Now <FaArrowRight size={12} /></>
                )}
              </button>

              {status && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-medium">
                  {status}
                </div>
              )}

              <div className="mt-3.5 pt-3 border-t border-white/10 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-medium">
                  <FaCheckCircle className="text-green-500" size={11} />
                  <span>Razorpay Secured (256-bit SSL)</span>
                </div>
              </div>

            </div>
          </div>

          {/* --- MOBILE STICKY FOOTER --- */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/10 p-3 lg:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3 items-center max-w-6xl mx-auto">
              <div className="flex-1">
                <div className="text-[9px] text-[#8c887e] font-bold uppercase tracking-wider">Total Payable</div>
                <div className="text-lg font-black text-[#1d1c19] leading-none">{INR(Number(totalAmount) || 0)}</div>
              </div>
              <button
                type="submit"
                disabled={busy || !rzpReady}
                className="px-6 h-10 bg-[#1d1c19] text-white rounded-full text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 disabled:opacity-50 hover:bg-black"
              >
                {busy ? "Processing..." : "Pay Now"} <FaArrowRight size={11} />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
    </>
  );
}
