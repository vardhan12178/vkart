import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import CartPreview from "./CartPreview";
import CheckoutForm from "./CheckoutForm";
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  cartItemKey,
} from "../redux/cartSlice";
import { clearWishlist, wishlistItemKey } from "../redux/wishlistSlice";
import { CircleXIcon, ShoppingBagIcon } from "./ui/icons";
import CartLine from "./cart/CartLine";
import EmptyBag from "./cart/EmptyBag";
import MobileCheckoutBar from "./cart/MobileCheckoutBar";
import OrderSummary from "./cart/OrderSummary";
import ProcessingOverlay from "./cart/ProcessingOverlay";
import SavedForLater from "./cart/SavedForLater";
import { cartTotals } from "./cart/cartMath";
import useCartMoves from "./cart/useCartMoves";
import useCartRefresh from "./cart/useCartRefresh";
import useOrderPlacement from "./cart/useOrderPlacement";
import usePromo from "./cart/usePromo";

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart);
  const wishlistItems = useSelector((s) => s.wishlist);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [showPayment, setShowPayment] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const checkoutRef = useRef(null);

  useCartRefresh(cartItems);

  const hasCartItems = cartItems.length > 0;
  const hasWishlistItems = wishlistItems.length > 0;

  // The coupon is validated against the bag total before any discount
  const rawSell = useMemo(() => cartTotals(cartItems).rawSell, [cartItems]);
  const promo = usePromo(rawSell);
  const totals = useMemo(
    () => cartTotals(cartItems, promo.applied?.discount || 0),
    [cartItems, promo.applied]
  );

  const { placeOrder, placing, error } = useOrderPlacement(cartItems, promo.applied?.code);
  const { moveToWishlist, moveToCart } = useCartMoves();

  const proceedToCheckout = () => {
    setShowPayment(true);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  // "Checkout" in the mini cart lands here with ?checkout=1: open the payment step straight away
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (!isAuthenticated || params.get("checkout") !== "1") return;
    setParams({}, { replace: true });
    if (hasCartItems) proceedToCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return <CartPreview />;
  if (!hasCartItems && !hasWishlistItems) return <EmptyBag />;

  return (
    <div className="premium-page premium-cart min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] pb-32 lg:pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1d1c19] tracking-tight">
            Your bag.
          </h1>
          {hasCartItems && (
            <span className="bg-white border border-black/10 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#5c574e] shadow-sm whitespace-nowrap">
              {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12">
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {hasCartItems ? (
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => {
                  // The reducer's own key: lines loaded from the server also carry a database _id
                  // that is not the product's id, so a key built from it would never match.
                  const k = cartItemKey(item);
                  return (
                    <CartLine
                      key={k}
                      item={item}
                      confirming={confirmRemoveId === k}
                      onAskRemove={() => setConfirmRemoveId(k)}
                      onCancelRemove={() => setConfirmRemoveId(null)}
                      onRemove={() => dispatch(removeFromCart(k))}
                      onIncrement={() => dispatch(incrementQuantity(k))}
                      onDecrement={() => dispatch(decrementQuantity(k))}
                      onSaveForLater={() => moveToWishlist(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-line-strong">
                <div className="w-12 h-12 bg-sand rounded-full flex items-center justify-center mx-auto mb-3 text-muted-light">
                  <ShoppingBagIcon size={20} />
                </div>
                <h3 className="text-base font-bold text-ink">Your cart is empty</h3>
                <p className="text-xs text-muted mb-3">You have items saved for later!</p>
                <Link to="/products" className="text-xs font-bold text-accent hover:underline">
                  Continue Shopping
                </Link>
              </div>
            )}

            {hasWishlistItems && (
              <SavedForLater
                items={wishlistItems}
                hasCartItems={hasCartItems}
                keyOf={wishlistItemKey}
                onClear={() => dispatch(clearWishlist())}
                onMoveToCart={moveToCart}
              />
            )}
          </div>

          <div className="lg:col-span-4">
            {hasCartItems ? (
              <OrderSummary totals={totals} promo={promo} onCheckout={proceedToCheckout} />
            ) : (
              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] sticky top-24">
                <h3 className="font-bold text-[#1d1c19] text-sm mb-1.5">Need Help?</h3>
                <p className="text-xs text-[#6f6b62] mb-3">
                  If you are looking for items you previously added, try checking your order
                  history.
                </p>
                <Link to="/profile" className="text-xs font-bold text-[#a85d37] hover:underline">
                  Go to Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {showPayment && hasCartItems && (
          <div ref={checkoutRef} className="mt-6 pt-6 sm:mt-10 sm:pt-10 border-t border-black/10">
            <h2 className="text-lg sm:text-2xl font-editorial font-bold text-[#1d1c19] mb-3 sm:mb-6 text-center">
              Secure Checkout
            </h2>
            <div className="max-w-6xl mx-auto">
              <CheckoutForm onOrderPlaced={placeOrder} totalAmount={totals.total} />
            </div>
          </div>
        )}

        {placing && <ProcessingOverlay />}

        {error && (
          <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 bg-alert/10 text-alert px-5 py-2.5 rounded-full shadow-xl font-bold flex items-center gap-2 animate-fade-up-quick border border-alert/30 z-50 text-xs w-max">
            <CircleXIcon /> {error}
          </div>
        )}
      </div>

      {!showPayment && hasCartItems && (
        <MobileCheckoutBar total={totals.total} onCheckout={proceedToCheckout} />
      )}
    </div>
  );
}
