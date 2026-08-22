import React, { useMemo, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import CartPreview from "./CartPreview";
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  addToCart,
} from "../redux/cartSlice";
import {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../redux/wishlistSlice";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaTrash,
  FaHeart,
  FaCartPlus,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaTruck,
  FaMinus,
  FaPlus,
  FaShoppingBag,
} from "react-icons/fa";
import CheckoutForm from "./CheckoutForm";
import axios from "./axiosInstance";
import { showToast } from "../utils/toast";
import { buildSecureOrderPayload } from "../utils/orderPayload";
import { qk } from "../query/queryKeys";

/* ---------- Helpers ---------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const TAX_RATE = 0.18;
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const keyOf = (it) => {
  const base = it?._id || it?.productId || it?.externalId || it?.id;
  return it?.selectedVariants ? `${base}::${it.selectedVariants}` : base;
};

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.4s ease-out forwards; }
  `}</style>
);

/* -------------------------------------------------------------------------- */
export default function Cart() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cartItems = useSelector((s) => s.cart);
  const wishlistItems = useSelector((s) => s.wishlist);

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);

  const checkoutRef = useRef(null);

  const calc = useMemo(() => {
    if (!cartItems?.length)
      return { mrp: 0, rawSell: 0, subtotal: 0, promoOff: 0, tax: 0, total: 0, savingsMrpVsSell: 0, shipping: 0 };

    const lines = cartItems.map((it) => {
      const unitSell = round2(it.price);
      const unitMrp = it.discountPercentage
        ? round2(it.price / (1 - it.discountPercentage / 100))
        : unitSell;
      return { mrp: round2(unitMrp * it.quantity), sell: round2(unitSell * it.quantity) };
    });

    const mrp = round2(lines.reduce((a, b) => a + b.mrp, 0));
    const rawSell = round2(lines.reduce((a, b) => a + b.sell, 0));
    const promoOff = promoApplied?.discount || 0;

    const subtotal = round2(rawSell - promoOff);
    const shipping = subtotal >= 999 ? 0 : 50;

    // Tax included in subtotal
    const tax = round2(subtotal * (TAX_RATE / (1 + TAX_RATE)));

    // Total = subtotal + shipping (tax already inside subtotal)
    const total = round2(subtotal + shipping);

    const savingsMrpVsSell = Math.max(0, round2(mrp - rawSell));
    return { mrp, rawSell, subtotal, promoOff, tax, total, savingsMrpVsSell, shipping };
  }, [cartItems, promoApplied]);

  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <CartPreview />;

  const applyPromo = async () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    try {
      const { data } = await axios.post("/api/coupons/validate", { code, subtotal: calc.rawSell });
      if (data.valid) {
        setPromoApplied({ code: data.code, discount: data.discount, description: data.description });
        showToast(`${data.code} applied — ${INR(data.discount)} off!`, "success");
      }
    } catch (err) {
      setPromoApplied(null);
      showToast(err?.response?.data?.message || "Invalid coupon code", "error");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoApplied(null);
    setPromo("");
    showToast("Coupon removed", "success");
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get("/api/coupons/public");
      setAvailableCoupons(data.coupons || []);
    } catch { /* ignore */ }
  };

  const handleOrderPlaced = async (orderDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      const productsPayload = cartItems.map((it) => {
        const mongoId = it._id || it.productId || null;
        const extId = it.externalId || (it.id != null ? String(it.id) : null);
        const unitPrice = round2(it.price);
        const lineTotal = round2(unitPrice * it.quantity);
        const payload = {
          name: it.title,
          image: it.thumbnail || it.images?.[0],
          quantity: it.quantity,
          price: unitPrice,
          lineTotal,
          currency: "INR",
        };
        if (it.selectedVariants) payload.selectedVariants = it.selectedVariants;
        if (mongoId) payload.productId = String(mongoId);
        if (!mongoId && extId) payload.externalId = extId;
        return payload;
      });

      const orderData = buildSecureOrderPayload({
        productsPayload,
        shippingAddress: orderDetails.address,
        promoCode: promoApplied?.code,
        paymentVerificationToken: orderDetails?.payment?.verificationToken,
        walletUsed: orderDetails?.walletUsed,
      });

      const res = await axios.post("/api/orders", orderData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.profile.orders }),
        queryClient.invalidateQueries({ queryKey: qk.profile.root }),
        queryClient.invalidateQueries({ queryKey: qk.profile.wallet }),
      ]);
      dispatch(clearCart());
      showToast("Order placed successfully", "success");
      return res?.data?._id || res?.data?.orderId || null;
    } catch (e) {
      const existingId = e?.response?.status === 409 ? e?.response?.data?.orderId : null;
      if (existingId) {
        dispatch(clearCart());
        await queryClient.invalidateQueries({ queryKey: qk.profile.orders });
        return existingId;
      }
      const msg = e?.response?.data?.message || e?.message || "Failed to place the order.";
      setError(msg);
      showToast(msg, "error");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const moveToWishlist = (item) => {
    const k = keyOf(item);
    dispatch(removeFromCart(k));
    dispatch(toggleWishlist(item));
    showToast("Moved to Wishlist", "success");
  };

  const moveWishlistToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    dispatch(removeFromWishlist(keyOf(item)));
    showToast("Moved to Cart", "success");
  };

  const handleProceed = () => {
    setShowPaymentDetails(true);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const hasCartItems = cartItems.length > 0;
  const hasWishlistItems = wishlistItems.length > 0;

  // Only render "Empty State" if BOTH cart and wishlist are empty.
  const isCompletelyEmpty = !hasCartItems && !hasWishlistItems;

  /* --- RENDER: COMPLETELY EMPTY STATE --- */
  if (isCompletelyEmpty) {
    return (
      <div className="premium-page premium-cart min-h-screen bg-[#f6f3ed] flex items-center justify-center p-4">
        <AnimStyles />
        <div className="text-center animate-fade-up max-w-md">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <FaShoppingCart className="text-3xl text-orange-400" />
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-normal text-[#1d1c19] mb-2">Your bag is waiting.</h2>
          <p className="text-[#777269] text-xs sm:text-sm mb-6">You haven’t added anything yet. Start with the latest edit.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-[#1d1c19] text-white px-6 py-3 rounded-full text-xs font-bold shadow-lg hover:bg-black transition-colors"
          >
            Explore the collection <FaArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  /* --- RENDER: MAIN LAYOUT --- */
  return (
    <div className="premium-page premium-cart min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] pb-32 lg:pb-20 overflow-x-hidden">
      <AnimStyles />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1d1c19] tracking-tight">Your bag.</h1>
          {hasCartItems && (
            <span className="bg-white border border-black/10 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#5c574e] shadow-sm whitespace-nowrap">
              {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12">

          {/* --- LEFT COLUMN: Cart Items & Wishlist --- */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">

            {/* 1. Cart Items List */}
            {hasCartItems ? (
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => {
                  const unitSell = round2(item.price);
                  const unitMrp = item.discountPercentage
                    ? round2(item.price / (1 - item.discountPercentage / 100))
                    : unitSell;
                  const lineSell = round2(unitSell * item.quantity);
                  const lineMrp = round2(unitMrp * item.quantity);
                  const k = keyOf(item);
                  const confirming = confirmRemoveId === k;

                  return (
                    <div
                      key={k}
                      className="group bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-black/[0.06] shadow-sm transition-all animate-fade-up"
                    >
                      <div className="flex gap-3 sm:gap-6">
                        {/* Image */}
                        <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-[#fbfaf7] rounded-xl sm:rounded-2xl p-2 border border-black/[0.05]">
                          <img
                            src={item.thumbnail || item.images?.[0]}
                            alt={item.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2 sm:gap-4">
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-base font-bold text-[#1d1c19] leading-snug line-clamp-2">{item.title}</h3>
                              <p className="text-[10px] sm:text-xs text-[#8c887e] mt-0.5 capitalize truncate">{item.category}</p>
                              {item.selectedVariants && (
                                <p className="text-[10px] sm:text-xs text-[#a85d37] font-semibold mt-0.5">{item.selectedVariants}</p>
                              )}
                            </div>
                            <button
                              onClick={() => setConfirmRemoveId(k)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0"
                              aria-label="Remove item"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2.5 sm:mt-4">
                            {/* Quantity Pill */}
                            <div className="flex items-center bg-[#f6f3ed] rounded-lg sm:rounded-xl border border-black/[0.06] h-7 sm:h-9">
                              <button
                                onClick={() => dispatch(decrementQuantity(k))}
                                disabled={item.quantity <= 1}
                                className="w-7 sm:w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-l-lg transition disabled:opacity-30"
                              >
                                <FaMinus size={9} />
                              </button>
                              <span className="w-5 sm:w-7 text-center font-bold text-xs">{item.quantity}</span>
                              <button
                                onClick={() => dispatch(incrementQuantity(k))}
                                className="w-7 sm:w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-r-lg transition"
                              >
                                <FaPlus size={9} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-sm sm:text-lg font-bold text-[#1d1c19]">{INR(lineSell)}</div>
                              {lineMrp > lineSell && (
                                <div className="text-[10px] sm:text-xs text-[#9b978d] line-through font-medium">{INR(lineMrp)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="mt-2.5 pt-2 sm:mt-4 sm:pt-4 border-t border-black/[0.05] flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => moveToWishlist(item)}
                          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#716c63] hover:text-[#a85d37] transition-colors"
                        >
                          <FaHeart size={11} className="text-gray-300 group-hover:text-[#a85d37]" />
                          Save for Later
                        </button>

                        {confirming && (
                          <div className="flex items-center gap-2 animate-fade-up ml-auto">
                            <span className="text-[11px] font-bold text-[#75483b]">Remove?</span>
                            <button onClick={() => dispatch(removeFromCart(k))} className="rounded-full bg-[#eee2dc] px-2.5 py-0.5 text-[11px] font-bold text-[#75483b]">Yes</button>
                            <button onClick={() => setConfirmRemoveId(null)} className="text-[11px] font-bold text-gray-500 px-1.5 py-0.5">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Cart Banner (Show only if Wishlist has items) */
              <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-gray-300">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <FaShoppingBag size={20} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mb-3">You have items saved for later!</p>
                <Link to="/products" className="text-xs font-bold text-orange-600 hover:underline">Continue Shopping</Link>
              </div>
            )}

            {/* 2. Wishlist Section inside Cart */}
            {hasWishlistItems && (
              <div className={hasCartItems ? "mt-6 sm:mt-10" : "mt-4"}>
                <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                  <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1d1c19] flex items-center gap-2">
                    <FaHeart size={13} className="text-[#a85d37]" /> Saved for Later
                  </h2>
                  <button onClick={() => dispatch(clearWishlist())} className="rounded-full border border-black/10 bg-[#eee8df] px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#6f6b62] transition-colors hover:bg-[#e6ddd2] hover:text-[#1d1c19]">Clear all</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  {wishlistItems.map(w => (
                    <div key={keyOf(w)} className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.06] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#fbfaf7] rounded-lg p-1.5 shrink-0 border border-black/[0.04]">
                          <img src={w.thumbnail} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1d1c19] line-clamp-1">{w.title}</h4>
                          <div className="text-[11px] font-bold text-[#716c63] mt-0.5">{INR(w.price)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => moveWishlistToCart(w)}
                        className="mt-2 text-[10px] sm:text-xs font-bold text-[#a85d37] hover:text-white hover:bg-[#a85d37] bg-[#fbf3ee] py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 w-full"
                      >
                        <FaCartPlus size={10} /> Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: Summary (Only show if cart has items) --- */}
          <div className="lg:col-span-4">
            {hasCartItems ? (
              <div className="sticky top-24 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/[0.06]">
                  <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1d1c19] mb-3 sm:mb-5">Order Summary</h2>

                  <div className="space-y-3 text-xs sm:text-sm font-medium text-[#6f6b62]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#1d1c19] font-semibold">{INR(calc.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#9b978d]">
                      <span className="text-[11px]">Tax (Included 18%)</span>
                      <span className="text-[11px]">{INR(calc.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={calc.shipping === 0 ? "text-green-600 font-bold" : "text-[#1d1c19] font-semibold"}>
                        {calc.shipping === 0 ? "Free" : INR(calc.shipping)}
                      </span>
                    </div>
                    {calc.promoOff > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Discount</span>
                        <span>-{INR(calc.promoOff)}</span>
                      </div>
                    )}

                    <div className="h-px bg-black/[0.06] my-3" />

                    <div className="flex justify-between text-base sm:text-lg font-black text-[#1d1c19]">
                      <span>Total</span>
                      <span>{INR(calc.total)}</span>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <div className="mt-4 sm:mt-6">
                    {promoApplied ? (
                      <div className="flex items-center justify-between bg-green-50 px-3.5 py-2.5 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2">
                          <FaTag className="text-green-600 text-xs" />
                          <span className="text-xs font-bold text-green-700">{promoApplied.code}</span>
                          <span className="text-[11px] text-green-600">-{INR(promoApplied.discount)}</span>
                        </div>
                        <button onClick={removePromo} className="text-xs font-bold text-[#75483b] hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="relative">
                        <FaTag className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                        <input
                          value={promo}
                          onChange={(e) => setPromo(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                          placeholder="Coupon Code"
                          className="w-full pl-9 pr-16 py-2.5 rounded-xl bg-[#f6f3ed] border border-black/[0.06] text-xs font-bold text-[#1d1c19] focus:outline-none focus:ring-1 focus:ring-[#a85d37] placeholder:text-gray-400"
                        />
                        <button
                          onClick={applyPromo}
                          disabled={promoLoading}
                          className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-white rounded-lg text-xs font-bold text-[#1d1c19] shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          {promoLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {!promoApplied && (
                      <button
                        onClick={() => { if (!showCoupons) fetchCoupons(); setShowCoupons(!showCoupons); }}
                        className="mt-1.5 text-[11px] font-bold text-[#a85d37] hover:underline"
                      >
                        {showCoupons ? "Hide coupons" : "View available coupons"}
                      </button>
                    )}
                    {showCoupons && !promoApplied && availableCoupons.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => { setPromo(c.code); setShowCoupons(false); }}
                            className="w-full text-left p-2.5 rounded-xl bg-[#fbf3ee] border border-[#a85d37]/15 hover:bg-[#f6eee8] transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#1d1c19]">{c.code}</span>
                              <span className="text-[11px] font-bold text-[#a85d37]">
                                {c.type === "percent" ? `${c.value}% off` : `${INR(c.value)} off`}
                              </span>
                            </div>
                            {c.description && <p className="text-[10px] text-[#6f6b62] mt-0.5">{c.description}</p>}
                            {c.minOrder > 0 && <p className="text-[9px] text-[#9b978d] mt-0.5">Min order: {INR(c.minOrder)}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                    {showCoupons && !promoApplied && availableCoupons.length === 0 && (
                      <p className="mt-2 text-xs text-gray-400 text-center">No coupons available right now</p>
                    )}
                  </div>

                  {/* Desktop Checkout Button */}
                  <button
                    onClick={handleProceed}
                    className="hidden lg:flex w-full mt-6 py-3.5 rounded-full bg-[#1d1c19] text-white font-bold text-sm shadow-lg hover:bg-black transition-all items-center justify-center gap-2"
                  >
                    Checkout <FaArrowRight size={12} />
                  </button>

                  {/* Free Shipping Bar */}
                  <div className="mt-4 bg-[#fbf3ee] p-3 rounded-xl border border-[#a85d37]/15">
                    {calc.subtotal < 999 ? (
                      <>
                        <div className="flex justify-between text-[11px] font-bold text-[#6f6b62] mb-1.5">
                          <span>Add {INR(999 - calc.subtotal)} for Free Shipping</span>
                          <span><FaTruck className="text-[#a85d37]" /></span>
                        </div>
                        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#a85d37] rounded-full transition-all"
                            style={{ width: `${Math.min(100, (calc.subtotal / 999) * 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-700">
                        <FaCheckCircle /> Free Shipping Unlocked!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Cart Side Message */
              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] sticky top-24">
                <h3 className="font-bold text-[#1d1c19] text-sm mb-1.5">Need Help?</h3>
                <p className="text-xs text-[#6f6b62] mb-3">
                  If you are looking for items you previously added, try checking your order history.
                </p>
                <Link to="/profile" className="text-xs font-bold text-[#a85d37] hover:underline">Go to Profile</Link>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Form Section */}
        {showPaymentDetails && hasCartItems && (
          <div ref={checkoutRef} className="mt-8 pt-8 sm:mt-12 sm:pt-12 border-t border-black/10">
            <h2 className="text-xl sm:text-3xl font-editorial font-bold text-[#1d1c19] mb-6 sm:mb-10 text-center">Secure Checkout</h2>
            <div className="max-w-6xl mx-auto">
              <CheckoutForm onOrderPlaced={handleOrderPlaced} totalAmount={calc.total} />
            </div>
          </div>
        )}

        {/* Global Loader Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#a85d37] border-t-transparent rounded-full animate-spin" />
              <span className="font-bold text-sm text-[#1d1c19]">Processing Order...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-5 py-2.5 rounded-full shadow-xl font-bold flex items-center gap-2 animate-fade-up border border-red-100 z-50 text-xs w-max">
            <FaTimesCircle /> {error}
          </div>
        )}

      </div>

      {/* --- MOBILE STICKY FOOTER --- */}
      {!showPaymentDetails && hasCartItems && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/10 p-3 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3 items-center max-w-7xl mx-auto">
            <div className="flex-1">
              <div className="text-[10px] text-[#8c887e] font-bold uppercase tracking-wide">Total</div>
              <div className="text-lg font-black text-[#1d1c19] leading-none">{INR(calc.total)}</div>
            </div>
            <button
              onClick={handleProceed}
              className="px-6 h-10 bg-[#1d1c19] text-white rounded-full text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 hover:bg-black"
            >
              Checkout <FaArrowRight size={11} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
