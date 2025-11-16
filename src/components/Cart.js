// src/pages/Cart.jsx
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
import { Helmet } from "react-helmet-async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTrash,
  faHeart,
  faTag,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import CheckoutForm from "./CheckoutForm";
import OrderStages from "./OrderStages";
import axios from "./axiosInstance";
import { showToast } from "../utils/toast";

/* ---------- helpers ---------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const TAX_RATE = 0.18;
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const isValidObjectId = (v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);
const keyOf = (it) => it?._id || it?.productId || it?.externalId || it?.id;

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
      return {
        mrp: 0,
        rawSell: 0,
        subtotal: 0,
        promoOff: 0,
        tax: 0,
        total: 0,
        savingsMrpVsSell: 0,
        shipping: 0,
      };

    const lines = cartItems.map((it) => {
      const unitSell = round2(it.price * 83);
      const unitMrp = it.discountPercentage
        ? round2((it.price / (1 - it.discountPercentage / 100)) * 83)
        : unitSell;
      return { mrp: round2(unitMrp * it.quantity), sell: round2(unitSell * it.quantity) };
    });

    const mrp = round2(lines.reduce((a, b) => a + b.mrp, 0));
    const rawSell = round2(lines.reduce((a, b) => a + b.sell, 0));
    const promoOff = promoApplied?.pct ? round2(rawSell * (promoApplied.pct / 100)) : 0;
    const subtotal = round2(rawSell - promoOff);
    const shipping = subtotal >= 999 ? 0 : 50;
    const tax = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + tax + shipping);
    const savingsMrpVsSell = Math.max(0, round2(mrp - rawSell));
    return { mrp, rawSell, subtotal, promoOff, tax, total, savingsMrpVsSell, shipping };
  }, [cartItems, promoApplied]);


  const isLoggedIn = !!localStorage.getItem("auth_token");
  if (!isLoggedIn) return <CartPreview />;



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
        const unitPrice = round2(it.price * 83);
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
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to place the order. Please try again.";
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

  const hasItems = cartItems.length > 0;

  const handleProceed = () => {
    setShowPaymentDetails(true);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  /* ------------------------------- empty cart ------------------------------ */
  if (!hasItems && !orderPlaced) {
    return (
      <section className="relative max-w-6xl mx-auto px-4 py-16 text-center">
        <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-orange-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-600 mt-1">Looks like you haven’t added anything yet.</p>
        <Link
          to="/products"
          className="inline-block mt-6 rounded-xl bg-orange-600 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
        >
          Browse products
        </Link>
      </section>
    );
  }

return (
  <div className="min-h-screen bg-[#F9FAFB]">
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Your Cart</h1>
        <span className="self-start sm:self-auto rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-100">
          {cartItems.length} items
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {cartItems.map((item) => {
            const unitSell = round2(item.price * 83);
            const unitMrp = item.discountPercentage
              ? round2((item.price / (1 - item.discountPercentage / 100)) * 83)
              : unitSell;
            const lineSell = round2(unitSell * item.quantity);
            const lineMrp = round2(unitMrp * item.quantity);
            const youSave = Math.max(0, lineMrp - lineSell);
            const k = keyOf(item);
            const confirming = confirmRemoveId === k;

            return (
              <div
                key={k}
                className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <img
                    src={item.thumbnail || item.images?.[0]}
                    alt={item.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl object-contain border border-gray-100"
                  />

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => setConfirmRemoveId(k)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {item.brand ? `${item.brand} • ` : ""}
                      {item.category}
                    </p>

                    <div className="mt-3 flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-5">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => dispatch(decrementQuantity(k))}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 text-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          –
                        </button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(incrementQuantity(k))}
                          className="px-3 py-2 text-lg hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="ml-auto text-right min-w-[100px]">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">{INR(lineSell)}</div>
                        {lineMrp > lineSell && (
                          <div className="text-xs sm:text-sm text-gray-500 line-through">
                            {INR(lineMrp)}
                          </div>
                        )}
                        {youSave > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700">
                            <FontAwesomeIcon icon={faTag} /> You save {INR(youSave)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <button
                        onClick={() => moveToWishlist(item)}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faHeart} /> Save for later
                      </button>
                    </div>

                    {confirming && (
                      <div className="mt-4 flex justify-end gap-2 text-sm">
                        <button
                          onClick={() => {
                            dispatch(removeFromCart(k));
                            setConfirmRemoveId(null);
                            showToast("Removed from cart", "success");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl sm:rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="bg-orange-50 p-4 sm:p-5 border-b border-orange-100">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                Order Summary
              </h2>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>MRP</span>
                <span>{INR(calc.mrp)}</span>
              </div>
              {calc.savingsMrpVsSell > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>You save</span>
                  <span>-{INR(calc.savingsMrpVsSell)}</span>
                </div>
              )}
              {calc.promoOff > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promo ({promoApplied?.code})</span>
                  <span>-{INR(calc.promoOff)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span>Subtotal</span>
                <span>{INR(calc.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{calc.shipping === 0 ? "Free" : INR(calc.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>{INR(calc.tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base sm:text-lg font-extrabold">
                <span>Total</span>
                <span>{INR(calc.total)}</span>
              </div>

              {/* Promo input */}
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 rounded-lg border border-orange-300 text-orange-700 font-medium hover:bg-orange-50"
                >
                  Apply
                </button>
              </div>

              {/* Buttons */}
              <button
                onClick={handleProceed}
                className="mt-5 w-full py-3 rounded-lg bg-orange-600 text-white font-semibold hover:opacity-95 transition"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => {
                  dispatch(clearCart());
                  showToast("Cart cleared", "success");
                }}
                className="w-full mt-2 text-sm text-red-600 hover:underline"
              >
                Clear cart
              </button>

              {/* Free shipping progress */}
              <div className="mt-5 bg-orange-50 p-4 rounded-2xl">
                {calc.subtotal < 999 ? (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                      <span>
                        You're ₹{999 - calc.subtotal} away from free shipping!
                      </span>
                      <span>🚚</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(calc.subtotal / 999) * 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm text-emerald-700 font-semibold">
                      <span>🎉 You’ve unlocked Free Shipping!</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Wishlist */}
          <div className="mt-8 rounded-2xl sm:rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="bg-orange-50 p-4 sm:p-5 border-b border-orange-100 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                Your Wishlist
              </h2>
              {wishlistItems?.length > 0 && (
                <button
                  onClick={() => {
                    dispatch(clearWishlist());
                    showToast("Wishlist cleared", "success");
                  }}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {wishlistItems?.length ? (
                wishlistItems.map((w) => (
                  <div
                    key={keyOf(w)}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3"
                  >
                    <img
                      src={w.thumbnail || w.images?.[0]}
                      alt={w.title}
                      className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-lg bg-gray-50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{w.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{w.category}</p>
                    </div>
                    <button
                      onClick={() => moveWishlistToCart(w)}
                      className="text-xs border px-3 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                      Move to cart
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No items saved yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Checkout form */}
      {showPaymentDetails && (
        <div ref={checkoutRef} className="mt-10">
          <CheckoutForm onOrderPlaced={handleOrderPlaced} totalAmount={calc.total} />
        </div>
      )}

      {/* Order placement states */}
      {isLoading && (
        <div className="flex items-center justify-center mt-4 text-gray-700">
          Placing your order…
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center mt-4 text-red-600">
          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
          {error}
        </div>
      )}
      {orderPlaced && (
        <div className="mt-12 bg-white p-6 sm:p-8 rounded-3xl shadow-xl text-center">
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="2x"
            className="text-emerald-500 mb-3"
          />
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
            Order placed successfully!
          </h2>
          <p className="text-gray-700 mb-6">
            You placed an order for {totalItemsOrdered}{" "}
            {totalItemsOrdered > 1 ? "items" : "item"}.
          </p>
          <OrderStages currentStage="Shipping" />
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-block text-sm px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  </div>
);

}
