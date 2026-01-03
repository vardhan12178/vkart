import React, { useMemo, useState, useRef, useEffect } from "react";
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
  FaRegHeart,
  FaCartPlus,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaTruck,
  FaMinus,
  FaPlus,
  FaShieldAlt,
  FaShoppingBag
} from "react-icons/fa";
import CheckoutForm from "./CheckoutForm";
import OrderStages from "./OrderStages";
import OrderTimeline from "./OrderTimeline";
import axios from "./axiosInstance";
import { showToast } from "../utils/toast";

/* ---------- Helpers ---------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const TAX_RATE = 0.18;
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const keyOf = (it) => it?._id || it?.productId || it?.externalId || it?.id;

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
  const cartItems = useSelector((s) => s.cart);
  const wishlistItems = useSelector((s) => s.wishlist);

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [totalItemsOrdered, setTotalItemsOrdered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);

  const checkoutRef = useRef(null);

  const calc = useMemo(() => {
    if (!cartItems?.length)
      return { mrp: 0, rawSell: 0, subtotal: 0, promoOff: 0, tax: 0, total: 0, savingsMrpVsSell: 0, shipping: 0 };

    const lines = cartItems.map((it) => {
      // REMOVED: Currency conversion (* 83)
      const unitSell = round2(it.price);
      const unitMrp = it.discountPercentage
        ? round2(it.price / (1 - it.discountPercentage / 100))
        : unitSell;
      return { mrp: round2(unitMrp * it.quantity), sell: round2(unitSell * it.quantity) };
    });

    const mrp = round2(lines.reduce((a, b) => a + b.mrp, 0));
    const rawSell = round2(lines.reduce((a, b) => a + b.sell, 0));
    const promoOff = promoApplied?.pct ? round2(rawSell * (promoApplied.pct / 100)) : 0;

    // Inclusive Tax Logic
    const subtotal = round2(rawSell - promoOff); // This is the amount the user expects to pay for items
    const shipping = subtotal >= 999 ? 0 : 50;

    // Tax is extracted FROM the subtotal, not added TO it
    // Formula: Amount * (Rate / (1 + Rate))
    const tax = round2(subtotal * (TAX_RATE / (1 + TAX_RATE)));

    // Total is just subtotal + shipping (since tax is inside subtotal)
    const total = round2(subtotal + shipping);

    const savingsMrpVsSell = Math.max(0, round2(mrp - rawSell));
    return { mrp, rawSell, subtotal, promoOff, tax, total, savingsMrpVsSell, shipping };
  }, [cartItems, promoApplied]);

  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <CartPreview />;

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === "SAVE10") {
      setPromoApplied({ code, pct: 10 });
      showToast("SAVE10 applied 🎉", "success");
    } else {
      setPromoApplied(null);
      showToast("Invalid code. Try SAVE10.", "error");
    }
  };

  const handleOrderPlaced = async (orderDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      const itemsOrdered = cartItems.reduce((t, i) => t + i.quantity, 0);
      setTotalItemsOrdered(itemsOrdered);
      const productsPayload = cartItems.map((it) => {
        const mongoId = it._id || it.productId || null;
        const extId = it.externalId || (it.id != null ? String(it.id) : null);
        // REMOVED: Currency conversion (* 83)
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
        if (mongoId) payload.productId = String(mongoId);
        if (!mongoId && extId) payload.externalId = extId;
        return payload;
      });

      const orderData = {
        products: productsPayload,
        subtotal: round2(calc.subtotal),
        discount: round2(calc.promoOff),
        tax: round2(calc.tax),
        shipping: round2(calc.shipping),
        totalPrice: round2(calc.total),
        currency: "INR",
        shippingAddress: orderDetails.address,
        promo: promoApplied?.code || undefined,
      };

      await axios.post("/api/orders", orderData);
      dispatch(clearCart());
      setOrderPlaced(true);
      showToast("Order placed successfully ✅", "success");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to place the order.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const moveToWishlist = (item) => {
    const k = keyOf(item);
    dispatch(removeFromCart(k));
    dispatch(toggleWishlist(item));
    showToast("Moved to Wishlist ♥️", "success");
  };

  const moveWishlistToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    dispatch(removeFromWishlist(keyOf(item)));
    showToast("Moved to Cart 🛒", "success");
  };

  const handleProceed = () => {
    setShowPaymentDetails(true);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const hasCartItems = cartItems.length > 0;
  const hasWishlistItems = wishlistItems.length > 0;

  // Only render "Empty State" if BOTH cart and wishlist are empty, and no order was just placed.
  const isCompletelyEmpty = !hasCartItems && !hasWishlistItems && !orderPlaced;

  /* --- RENDER: COMPLETELY EMPTY STATE --- */
  if (isCompletelyEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AnimStyles />
        <div className="text-center animate-fade-up max-w-md">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FaShoppingCart className="text-4xl text-orange-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't made your choice yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-gray-200 hover:scale-105 transition-transform"
          >
            Start Shopping <FaArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  /* --- RENDER: MAIN LAYOUT --- */
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 pb-32 lg:pb-20 overflow-x-hidden">
      <AnimStyles />

      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
          {hasCartItems && (
            <span className="bg-white border border-gray-200 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-gray-600 shadow-sm whitespace-nowrap">
              {cartItems.length} Items
            </span>
          )}
        </div>

        {!orderPlaced ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

            {/* --- LEFT COLUMN: Cart Items & Wishlist --- */}
            <div className="lg:col-span-8 space-y-8">

              {/* 1. Cart Items List */}
              {hasCartItems ? (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    // REMOVED: Currency conversion (* 83)
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
                        className="group bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm transition-all animate-fade-up"
                      >
                        <div className="flex gap-4 sm:gap-6">
                          {/* Image */}
                          <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-gray-50 rounded-xl sm:rounded-2xl p-2 border border-gray-50">
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
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight line-clamp-2">{item.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 capitalize truncate">{item.category}</p>
                              </div>
                              <button
                                onClick={() => setConfirmRemoveId(k)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0"
                              >
                                <FaTrash />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-end justify-between gap-3 mt-3 sm:mt-4">
                              {/* Quantity Pill */}
                              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 h-8 sm:h-10">
                                <button
                                  onClick={() => dispatch(decrementQuantity(k))}
                                  disabled={item.quantity <= 1}
                                  className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-l-xl transition disabled:opacity-30"
                                >
                                  <FaMinus size={10} />
                                </button>
                                <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => dispatch(incrementQuantity(k))}
                                  className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-r-xl transition"
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <div className="text-lg sm:text-xl font-black text-gray-900">{INR(lineSell)}</div>
                                {lineMrp > lineSell && (
                                  <div className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">{INR(lineMrp)}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3">
                          <button
                            onClick={() => moveToWishlist(item)}
                            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            <FaHeart className="text-gray-300 group-hover:text-orange-600" />
                            Save for Later
                          </button>

                          {confirming && (
                            <div className="flex items-center gap-3 animate-fade-up ml-auto">
                              <span className="text-xs text-red-500 font-bold hidden sm:inline">Confirm?</span>
                              <button onClick={() => dispatch(removeFromCart(k))} className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Delete</button>
                              <button onClick={() => setConfirmRemoveId(null)} className="text-xs font-bold text-gray-500 px-2 py-1">Cancel</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty Cart Banner (Show only if Wishlist has items) */
                <div className="bg-white rounded-[2rem] p-8 text-center border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FaShoppingBag size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mb-4">But you have items saved for later!</p>
                  <Link to="/products" className="text-sm font-bold text-orange-600 hover:underline">Continue Shopping</Link>
                </div>
              )}

              {/* 2. Wishlist Section */}
              {hasWishlistItems && (
                <div className={hasCartItems ? "mt-12" : "mt-6"}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaHeart className="text-orange-500" /> Saved for Later
                    </h2>
                    <button onClick={() => dispatch(clearWishlist())} className="text-xs font-bold text-red-500 hover:underline">Clear All</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map(w => (
                      <div key={keyOf(w)} className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl p-2 shrink-0">
                          <img src={w.thumbnail} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{w.title}</h4>
                          {/* REMOVED: Currency conversion (* 83) */}
                          <div className="text-xs font-bold text-gray-500 mb-2">{INR(w.price)}</div>
                          <button
                            onClick={() => moveWishlistToCart(w)}
                            className="text-xs font-bold text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 w-fit"
                          >
                            <FaCartPlus size={10} /> Move to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --- RIGHT COLUMN: Summary (Only show if cart has items) --- */}
            <div className="lg:col-span-4">
              {hasCartItems ? (
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-orange-500/5 border border-gray-100">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-6">Order Summary</h2>

                    <div className="space-y-4 text-sm font-medium text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-gray-900">{INR(calc.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span className="text-xs">Tax (Included 18%)</span>
                        <span className="text-xs">{INR(calc.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={calc.shipping === 0 ? "text-green-600" : "text-gray-900"}>
                          {calc.shipping === 0 ? "Free" : INR(calc.shipping)}
                        </span>
                      </div>
                      {calc.promoOff > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{INR(calc.promoOff)}</span>
                        </div>
                      )}

                      <div className="h-px bg-gray-100 my-4" />

                      <div className="flex justify-between text-lg font-black text-gray-900">
                        <span>Total</span>
                        <span>{INR(calc.total)}</span>
                      </div>
                    </div>

                    {/* Promo Input */}
                    <div className="mt-6">
                      <div className="relative">
                        <FaTag className="absolute left-4 top-3.5 text-gray-400 text-xs" />
                        <input
                          value={promo}
                          onChange={(e) => setPromo(e.target.value)}
                          placeholder="Promo Code"
                          className="w-full pl-10 pr-20 py-3 rounded-xl bg-gray-50 border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-orange-500/20 placeholder:text-gray-400"
                        />
                        <button
                          onClick={applyPromo}
                          className="absolute right-2 top-2 bottom-2 px-3 bg-white rounded-lg text-xs font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Desktop Checkout Button */}
                    <button
                      onClick={handleProceed}
                      className="hidden lg:flex w-full mt-6 py-4 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all items-center justify-center gap-2"
                    >
                      Checkout <FaArrowRight size={12} />
                    </button>

                    {/* Free Shipping Bar */}
                    <div className="mt-6 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                      {calc.subtotal < 999 ? (
                        <>
                          <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                            <span>Add {INR(999 - calc.subtotal)} for Free Shipping</span>
                            <span><FaTruck className="text-orange-500" /></span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                              style={{ width: `${(calc.subtotal / 999) * 100}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-600">
                          <FaCheckCircle /> Free Shipping Unlocked!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Cart Side Message */
                <div className="bg-white rounded-3xl p-6 border border-gray-100 sticky top-24">
                  <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    If you are looking for items you previously added, try checking your order history.
                  </p>
                  <Link to="/profile" className="text-sm font-bold text-orange-600 hover:underline">Go to Profile</Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- ORDER PLACED SUCCESS --- */
          <div className="max-w-2xl mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 text-center shadow-2xl animate-fade-up border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-4xl sm:text-5xl text-green-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">Order Placed!</h2>
            <p className="text-gray-500 mb-8 text-base sm:text-lg">
              Thank you for your purchase. You ordered {totalItemsOrdered} {totalItemsOrdered > 1 ? "items" : "item"}.
            </p>

            <div className="py-8 border-t border-b border-gray-100 mb-8 w-full">
              <OrderTimeline currentStage="PLACED" createdAt={new Date().toISOString()} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products" className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition text-center">
                Continue Shopping
              </Link>
              <Link to="/profile" className="px-8 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition text-center">
                View Order
              </Link>
            </div>
          </div>
        )}

        {/* Checkout Form Section */}
        {showPaymentDetails && !orderPlaced && hasCartItems && (
          <div ref={checkoutRef} className="mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 sm:mb-10 text-center">Secure Checkout</h2>
            <div className="max-w-6xl mx-auto">
              <CheckoutForm onOrderPlaced={handleOrderPlaced} totalAmount={calc.total} />
            </div>
          </div>
        )}

        {/* Global Loader Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-bold text-gray-900">Processing Order...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-3 animate-fade-up border border-red-100 z-50 w-max">
            <FaTimesCircle /> {error}
          </div>
        )}

      </div>

      {/* --- MOBILE STICKY FOOTER --- */}
      {!orderPlaced && !showPaymentDetails && hasCartItems && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3 items-center max-w-7xl mx-auto">
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Total</div>
              <div className="text-xl font-black text-gray-900 leading-none">{INR(calc.total)}</div>
            </div>
            <button
              onClick={handleProceed}
              className="px-8 h-12 bg-gray-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              Checkout <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}