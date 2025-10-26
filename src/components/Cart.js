// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  faCheckCircle,
  faTimesCircle,
  faTag,
  faArrowRightArrowLeft,
  faPaperPlane,
  faMagicWandSparkles,
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

  // promo
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);

  // AI
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { from: "bot", text: "Hi! I’m VKart AI. Ask me about shipping, returns, or deals." },
  ]);

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
    const shipping = 0;
    const tax = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + tax + shipping);
    const savingsMrpVsSell = Math.max(0, round2(mrp - rawSell));

    return { mrp, rawSell, subtotal, promoOff, tax, total, savingsMrpVsSell, shipping };
  }, [cartItems, promoApplied]);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === "SAVE10") {
      setPromoApplied({ code, pct: 10 });
      showToast("SAVE10 applied 🎉", "success");
    } else if (code === "SAVE5") {
      setPromoApplied({ code, pct: 5 });
      showToast("SAVE5 applied 🎉", "success");
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
        if (mongoId && !isValidObjectId(String(mongoId)))
          throw new Error(`Invalid Mongo product _id for "${it.title}": "${mongoId}"`);
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
  const showMobileCheckoutBar = hasItems && !showPaymentDetails && !orderPlaced;

  /* ------------------------------- empty cart ------------------------------ */
  if (!hasItems && !orderPlaced) {
    return (
      <>
        <Helmet>
          <title>Cart · VKart</title>
          <meta
            name="description"
            content="Review your VKart shopping cart, apply discounts and proceed to checkout."
          />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ShoppingCart",
              merchant: "VKart",
              numberOfItems: 0,
              currency: "INR",
            })}
          </script>
        </Helmet>

        <section className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
          </div>
          <div className="rounded-3xl bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-2xl p-10 text-center">
            <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-orange-500 mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600 mt-1">Looks like you haven’t added anything yet.</p>
            <Link
              to="/products"
              className="inline-block mt-6 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
            >
              Browse products
            </Link>
          </div>

          {/* Wishlist preview when cart empty */}
          {wishlistItems?.length ? (
            <div className="mt-10 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">From your Wishlist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistItems.slice(0, 6).map((w) => (
                  <div
                    key={keyOf(w)}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <img
                      src={w.thumbnail || w.images?.[0]}
                      alt={w.title}
                      className="h-16 w-16 object-contain rounded-xl bg-gray-50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{w.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{w.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveWishlistToCart(w)}
                      className="text-xs rounded-lg border px-3 py-1 hover:bg-gray-50"
                    >
                      Move to cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Your Cart · VKart</title>
        <meta
          name="description"
          content="Review items in your VKart cart, apply coupons, move items to wishlist, and checkout securely."
        />
        <link rel="canonical" href="https://vkartshop.netlify.app/cart" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ShoppingCart",
            merchant: "VKart",
            numberOfItems: cartItems.reduce((t, i) => t + i.quantity, 0),
            currency: "INR",
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-amber-50 to-white">
        <div className={`container mx-auto px-4 ${showMobileCheckoutBar ? "pb-28" : "pb-10"} pt-10`}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Your Cart</h1>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-100">
              {cartItems.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
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
                    className="group relative rounded-3xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xl hover:shadow-2xl transition overflow-hidden"
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex items-start gap-4 md:gap-5">
                        <div className="relative">
                          <div className="p-[1px] rounded-2xl bg-gradient-to-br from-orange-200 via-amber-200 to-white">
                            <div className="w-24 h-24 md:w-28 md:h-28 grid place-items-center bg-white rounded-[14px] overflow-hidden">
                              <img
                                src={item.thumbnail || item.images?.[0]}
                                alt={item.title}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          </div>
                          {item.discountPercentage ? (
                            <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 text-white text-[11px] px-2 py-0.5 shadow">
                              {Math.round(item.discountPercentage)}% OFF
                            </span>
                          ) : null}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
                              {item.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveId(k)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label="Remove item"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                            {item.brand ? <span>{item.brand}</span> : null}
                            {item.category ? <span>• {item.category}</span> : null}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-4">
                            <div className="flex items-center rounded-xl overflow-hidden border border-gray-200">
                              <button
                                type="button"
                                onClick={() => dispatch(decrementQuantity(k))}
                                className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                –
                              </button>
                              <span className="px-4 py-2 text-lg font-medium">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => dispatch(incrementQuantity(k))}
                                className="px-3 py-2 hover:bg-gray-50"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <div className="ml-auto text-right">
                              <div className="text-xl md:text-2xl font-bold text-gray-900">
                                {INR(lineSell)}
                              </div>
                              {lineMrp > lineSell ? (
                                <div className="text-sm text-gray-500 line-through">{INR(lineMrp)}</div>
                              ) : null}
                              {youSave > 0 ? (
                                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                  <FontAwesomeIcon icon={faTag} /> You save {INR(youSave)}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <button
                              type="button"
                              className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
                              onClick={() => moveToWishlist(item)}
                            >
                              <FontAwesomeIcon icon={faHeart} /> Save for later
                            </button>
                            <Link
                              to={`/product/${item.id ?? item.externalId ?? item._id}`}
                              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                              title="View details"
                            >
                              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
                              Compare/Details
                            </Link>
                          </div>

                          {confirming && (
                            <div className="mt-4 flex items-center justify-end gap-3 text-sm">
                              <span className="text-gray-600">
                                Remove <strong>{item.title}</strong>?
                              </span>
                              <button
                                type="button"
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
                                type="button"
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
                  </div>
                );
              })}
            </div>

            {/* Summary / Promo / Checkout */}
            <aside className="lg:sticky lg:top-24 self-start space-y-6">
              <div className="rounded-3xl overflow-hidden bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xl">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5">
                  <h2 className="text-xl font-extrabold text-gray-900">Order Summary</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">MRP</span>
                      <span className="text-gray-900">{INR(calc.mrp)}</span>
                    </div>

                    {calc.savingsMrpVsSell > 0 ? (
                      <div className="flex justify-between text-emerald-700">
                        <span>You save</span>
                        <span>-{INR(calc.savingsMrpVsSell)}</span>
                      </div>
                    ) : null}

                    {calc.promoOff ? (
                      <div className="flex justify-between text-emerald-700">
                        <span>Promo {promoApplied?.code ? `(${promoApplied.code})` : ""}</span>
                        <span>-{INR(calc.promoOff)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{INR(calc.subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">Free</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (18%)</span>
                      <span className="text-gray-900">{INR(calc.tax)}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t text-lg font-extrabold" aria-live="polite">
                      <span>Total</span>
                      <span>{INR(calc.total)}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center gap-2">
                      <input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="Enter promo code"
                        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        className="px-4 py-2 rounded-xl bg-white border border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Apply
                      </button>
                    </div>
                    {promoApplied === null && promo ? (
                      <p className="mt-2 text-xs text-red-600">Invalid code. Try SAVE10.</p>
                    ) : null}
                    {promoApplied?.code ? (
                      <p className="mt-2 text-xs text-emerald-700">
                        {promoApplied.code} applied! ({promoApplied.pct}% off)
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentDetails(true)}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearCart());
                      showToast("Cart cleared", "success");
                    }}
                    className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear cart
                  </button>

                  <div className="mt-5 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Free shipping</span>
                      <span className="text-emerald-700 font-semibold">Unlocked</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-orange-100 overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-orange-600 to-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wishlist section */}
              <div className="rounded-3xl overflow-hidden bg-white/90 shadow-xl">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-gray-900">Your Wishlist</h2>
                  {wishlistItems?.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearWishlist());
                        showToast("Wishlist cleared", "success");
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="p-4">
                  {wishlistItems?.length ? (
                    <div className="space-y-3">
                      {wishlistItems.map((w) => (
                        <div
                          key={keyOf(w)}
                          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                        >
                          <img
                            src={w.thumbnail || w.images?.[0]}
                            alt={w.title}
                            className="h-14 w-14 object-contain rounded-xl bg-gray-50"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium line-clamp-1">{w.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{w.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moveWishlistToCart(w)}
                              className="text-xs rounded-lg border px-3 py-1 hover:bg-gray-50"
                              title="Move to cart"
                            >
                              Move to cart
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                dispatch(removeFromWishlist(keyOf(w)));
                                showToast("Removed from Wishlist", "success");
                              }}
                              className="text-xs rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
                              title="Remove"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No items saved yet.</p>
                  )}
                </div>
              </div>

              {/* AI Assistant */}
              <div className="rounded-3xl overflow-hidden bg-white/90 shadow-xl">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-gray-900">VKart AI</h2>
                  <button
                    type="button"
                    onClick={() => setAiOpen((v) => !v)}
                    className="text-xs rounded-lg border px-3 py-1 hover:bg-gray-50"
                  >
                    {aiOpen ? "Hide" : "Open"}
                  </button>
                </div>

                {aiOpen ? (
                  <div className="p-4 space-y-3">
                    <div className="h-48 overflow-y-auto space-y-2 rounded-xl border border-gray-100 p-3 bg-white">
                      {aiMessages.map((m, i) => (
                        <div
                          key={i}
                          className={`text-sm ${m.from === "bot" ? "text-gray-800" : "text-gray-900 text-right"}`}
                        >
                          {m.text}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Ask about coupons, shipping, returns…"
                        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const text = aiInput.trim();
                          if (!text) return;
                          setAiMessages((prev) => [
                            ...prev,
                            { from: "user", text },
                            { from: "bot", text: "I’ll analyze your cart and find best deals soon. (Demo reply) 💡" },
                          ]);
                          setAiInput("");
                        }}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 text-white"
                        title="Send"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {["Any active coupons?", "What’s the return policy?", "How fast is shipping?"].map((q) => (
                        <button
                          type="button"
                          key={q}
                          onClick={() =>
                            setAiMessages((prev) => [
                              ...prev,
                              { from: "user", text: q },
                              { from: "bot", text: "Here’s a quick answer (demo). I’ll be smarter soon! ✨" },
                            ])
                          }
                          className="rounded-full border px-3 py-1 hover:bg-gray-50"
                        >
                          <FontAwesomeIcon icon={faMagicWandSparkles} className="mr-1" />
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>

          {/* Checkout form */}
          {showPaymentDetails ? (
            <div className="mt-8">
              <CheckoutForm onOrderPlaced={handleOrderPlaced} />
            </div>
          ) : null}

          {/* Status lines */}
          {isLoading ? (
            <div className="flex items-center justify-center mt-4 text-gray-700">Placing your order…</div>
          ) : null}

          {error ? (
            <div className="flex items-center justify-center mt-4 text-red-600">
              <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
              <p>{error}</p>
            </div>
          ) : null}

          {orderPlaced ? (
            <div className="mt-12 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 p-8 rounded-3xl shadow-xl text-center">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-emerald-500 mb-3" />
              <h2 className="text-2xl font-extrabold mb-2">Order placed successfully!</h2>
              <p className="text-gray-700 mb-6">
                You placed an order for {totalItemsOrdered} {totalItemsOrdered > 1 ? "items" : "item"}.
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
          ) : null}

          {/* Mobile sticky checkout */}
          {showMobileCheckoutBar ? (
            <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-gray-200">
              <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-lg font-semibold text-gray-900" aria-live="polite">
                    {INR(calc.total)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentDetails(true)}
                  className="rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 px-5 py-2.5 text-white font-semibold shadow hover:opacity-95"
                >
                  Checkout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
