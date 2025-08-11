import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} from "../redux/cartSlice";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTrash,
  faHeart,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import CheckoutForm from "./CheckoutForm";
import OrderStages from "./OrderStages";
import axios from "./axiosInstance";

// helpers
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const TAX_RATE = 0.18;
const isValidObjectId = (v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);
// single source of truth for cart keys
const cartKey = (it) => it._id || it.productId || it.externalId || it.id;

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart);

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [totalItemsOrdered, setTotalItemsOrdered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(null); // {code, pct}

  // derived money values
  const calc = useMemo(() => {
    if (!cartItems?.length) {
      return { mrp: 0, subtotal: 0, savings: 0, tax: 0, total: 0 };
    }
    const lines = cartItems.map((it) => {
      const unitSell = it.price * 83;
      const unitMrp = it.discountPercentage
        ? (it.price / (1 - it.discountPercentage / 100)) * 83
        : unitSell;
      return { mrp: unitMrp * it.quantity, sell: unitSell * it.quantity };
    });
    const mrp = lines.reduce((a, b) => a + b.mrp, 0);
    let subtotal = lines.reduce((a, b) => a + b.sell, 0);

    let promoOff = 0;
    if (promoApplied?.pct) {
      promoOff = subtotal * (promoApplied.pct / 100);
      subtotal -= promoOff;
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { mrp, subtotal, promoOff, tax, total, savings: Math.max(0, mrp - (subtotal + promoOff)) };
  }, [cartItems, promoApplied]);

  // pass the composite key to reducers
  const handleIncrement = (item) => dispatch(incrementQuantity(cartKey(item)));
  const handleDecrement = (item) => dispatch(decrementQuantity(cartKey(item)));
  const handleRemove    = (item) => dispatch(removeFromCart(cartKey(item)));

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === "SAVE10") setPromoApplied({ code, pct: 10 });
    else if (code === "SAVE5") setPromoApplied({ code, pct: 5 });
    else setPromoApplied(null);
  };

  const handleBuyNow = () => setShowPaymentDetails(true);

  const handleOrderPlaced = async (orderDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      const itemsOrdered = cartItems.reduce((t, i) => t + i.quantity, 0);
      setTotalItemsOrdered(itemsOrdered);

      const productsPayload = cartItems.map((it) => {
        const mongoId = it._id || it.productId || null;                         // prefer Mongo
        const extId   = it.externalId || (it.id != null ? String(it.id) : null); // DummyJSON fallback

        // only validate if we intend to send a Mongo id
        if (mongoId && !isValidObjectId(String(mongoId))) {
          throw new Error(`Invalid Mongo product _id for "${it.title}": "${mongoId}"`);
        }

        // include fields conditionally so backend can accept either
        const payload = {
          name: it.title,
          image: it.thumbnail || it.images?.[0],
          quantity: it.quantity,
          price: it.price * 83, // per unit INR
        };
        if (mongoId) payload.productId = String(mongoId);
        if (!mongoId && extId) payload.externalId = extId;

        return payload;
      });

      const orderData = {
        products: productsPayload,
        subtotal: calc.subtotal,
        tax: calc.tax,
        totalPrice: calc.total,
        stage: "Pending",
        shippingAddress: orderDetails.address,
        promo: promoApplied?.code || null,
      };

      await axios.post("/api/orders", orderData);
      dispatch(clearCart());
      setOrderPlaced(true);
    } catch (e) {
      console.error("Order placement error:", e);
      const msg = e?.response?.data?.message || e?.message || "Failed to place the order. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // empty state
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4 mt-16">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
          <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven’t added anything yet.</p>
          <Link to="/products" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => {
            const unitSell = item.price * 83;
            const unitMrp = item.discountPercentage
              ? (item.price / (item.discountPercentage ? 1 - item.discountPercentage / 100 : 1)) * 83
              : unitSell;
            const lineSell = unitSell * item.quantity;
            const lineMrp = unitMrp * item.quantity;
            const key = cartKey(item);

            return (
              <div key={key} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 md:p-6">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center bg-white rounded-xl overflow-hidden ring-1 ring-gray-100">
                    <img src={item.thumbnail || item.images?.[0]} alt={item.title} className="object-contain w-full h-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                      <button
                        onClick={() => setConfirmRemoveId(key)}
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

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      {/* stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden" role="group" aria-label="Quantity selector">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span className="px-4 py-2 text-lg font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="px-3 py-2 hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* prices */}
                      <div className="text-right ml-auto">
                        <div className="text-base md:text-lg font-semibold text-gray-900">{INR(lineSell)}</div>
                        {lineMrp > lineSell ? (
                          <div className="text-sm text-gray-500 line-through">{INR(lineMrp)}</div>
                        ) : null}
                      </div>
                    </div>

                    {/* actions row */}
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <button className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faHeart} /> Save for later
                      </button>
                    </div>
                  </div>
                </div>

                {/* confirm remove */}
                {confirmRemoveId === key && (
                  <div className="mt-4 flex items-center justify-end gap-3 text-sm">
                    <span className="text-gray-600">
                      Remove <strong>{item.title}</strong>?
                    </span>
                    <button
                      onClick={() => {
                        handleRemove(item);
                        setConfirmRemoveId(null);
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
            );
          })}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-orange-50/70 rounded-2xl shadow-sm ring-1 ring-orange-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MRP</span>
                <span className="text-gray-900">{INR(calc.mrp)}</span>
              </div>
              {calc.mrp > calc.subtotal && (
                <div className="flex justify-between text-green-700">
                  <span>You save</span>
                  <span>-{INR(calc.mrp - calc.subtotal)}</span>
                </div>
              )}
              {calc.promoOff ? (
                <div className="flex justify-between text-green-700">
                  <span>Promo ({promoApplied.code})</span>
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
              <div className="flex justify-between pt-3 border-t text-lg font-semibold">
                <span>Total</span>
                <span>{INR(calc.total)}</span>
              </div>
            </div>

            {/* promo code */}
            <div className="mt-4">
              <label className="text-sm text-gray-600">Have a promo?</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="SAVE10"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 rounded-xl bg-white border border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Apply
                </button>
              </div>
              {promoApplied === null && promo && (
                <p className="mt-2 text-xs text-red-600">
                  Invalid code. Try <strong>SAVE10</strong>.
                </p>
              )}
              {promoApplied?.code && (
                <p className="mt-2 text-xs text-green-700">
                  {promoApplied.code} applied! ({promoApplied.pct}% off)
                </p>
              )}
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl mt-6 hover:bg-orange-700"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear cart
            </button>
          </div>
        </aside>
      </div>

      {/* checkout + order states */}
      {showPaymentDetails && (
        <div className="mt-8">
          <CheckoutForm onOrderPlaced={handleOrderPlaced} />
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center mt-4 text-gray-700">
          Placing your order…
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center mt-4 text-red-600">
          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      {orderPlaced && (
        <div className="mt-12 bg-white p-8 rounded-2xl shadow text-center">
          <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-green-500 mb-3" />
          <h2 className="text-2xl font-bold mb-2">Order placed successfully!</h2>
          <p className="text-gray-700 mb-6">
            You placed an order for {totalItemsOrdered} {totalItemsOrdered > 1 ? "items" : "item"}.
          </p>
          <OrderStages currentStage="Shipping" />
          <div className="mt-6">
            <Link to="/products" className="inline-block text-sm px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">
              Keep shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
