import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCheckCircle, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity, FaGlobe, FaMailBulk, FaShieldAlt, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
          className={`w-full rounded-xl border-0 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-gray-400 focus:ring-2 ${
            touched && error 
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

    const grandTotal = Number(totalAmount) || 0;

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
          name: data.fullName || "VKart User",
          email: data.email || "user@example.com",
          contact: data.phone || "9999999999",
        },
        notes: { shipping_address: fullAddress },
        theme: { color: "#f97316" }, // Orange-500 matches UI
        handler: function () {
          setBusy(false);
          onOrderPlaced?.({ address: fullAddress, method: "razorpay" });
          navigate("/orderstages", { replace: true });
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

  const isLoggedIn = !!localStorage.getItem("auth_token");
  if (!isLoggedIn) return <CheckoutPreview />;

  return (
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
                className={`hidden lg:flex w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all transform active:scale-[0.98] items-center justify-center gap-2 ${
                  busy || !rzpReady
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
  );
}