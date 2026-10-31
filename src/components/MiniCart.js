import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { closeMiniCart } from "../redux/uiSlice";
import { cartItemKey, decrementQuantity, incrementQuantity, removeFromCart } from "../redux/cartSlice";
import { productPath } from "./shop/shopItems";
import { formatPrice } from "./shop/catalogApi";
import { FREE_SHIPPING_THRESHOLD } from "../utils/shipping";

export function FreeDeliveryProgress({ subtotal, className = "" }) {
  const left = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Truck className={`h-4 w-4 flex-none ${left ? "text-muted" : "text-ok"}`} strokeWidth={1.8} />
        {left
          ? <span>Add <span className="font-semibold text-ink">{formatPrice(left)}</span> more for free delivery</span>
          : <span className="font-semibold text-ok">You've unlocked free delivery</span>}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Progress to free delivery"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className={`h-full rounded-full transition-all duration-500 ${left ? "bg-accent" : "bg-ok"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Slide-out cart, opened after "Add to cart" so shoppers can keep browsing or go straight to checkout
export default function MiniCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { open, lastKey } = useSelector((s) => s.ui.miniCart || {});
  const items = useSelector((s) => s.cart);
  const closeRef = useRef(null);
  const close = () => dispatch(closeMiniCart());

  // Close when the shopper moves to another page (not on the first render)
  const lastPath = useRef(location.pathname);
  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    if (open) close();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Newest first, so the line just added sits at the top
  const lines = [...items].reverse();
  const count = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * it.quantity, 0);
  const added = lastKey && items.some((it) => cartItemKey(it) === lastKey);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95]">
          <motion.div className="absolute inset-0 bg-black/40" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside role="dialog" aria-modal="true" aria-label="Shopping cart"
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}>
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              {added ? (
                <p className="flex items-center gap-2 text-base font-bold text-ink"><CheckCircle2 className="h-5 w-5 text-ok" strokeWidth={2} />Added to cart</p>
              ) : (
                <p className="text-base font-bold text-ink">Your cart{count ? ` (${count})` : ""}</p>
              )}
              <button ref={closeRef} type="button" onClick={close} aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink">
                <X className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-tint text-ink-soft"><ShoppingBag className="h-6 w-6" strokeWidth={1.6} /></span>
                <p className="font-semibold text-ink">Your cart is empty</p>
                <Link to="/products" onClick={close} className="text-sm font-semibold text-accent underline underline-offset-4">Continue shopping</Link>
              </div>
            ) : (
              <>
                <FreeDeliveryProgress subtotal={subtotal} className="border-b border-line px-5 py-4" />
                <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
                  {lines.map((it) => {
                    const key = cartItemKey(it);
                    const href = productPath(it);
                    const title = <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{it.title}</span>;
                    return (
                      <li key={key} className={`flex gap-3 py-4 ${key === lastKey ? "-mx-5 bg-tint/50 px-5" : ""}`}>
                        <span className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-[#f6f3ed]">
                          {it.thumbnail && <img src={it.thumbnail} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          {href ? <Link to={href} onClick={close} className="hover:underline">{title}</Link> : title}
                          {it.selectedVariants && <span className="mt-0.5 truncate text-xs text-muted">{it.selectedVariants}</span>}
                          {it.unavailable && <span className="mt-0.5 text-xs font-semibold text-alert">Currently unavailable</span>}
                          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                            <div className="flex items-center rounded-full border border-line-strong">
                              <button type="button" aria-label={`Decrease quantity of ${it.title}`} onClick={() => dispatch(decrementQuantity(key))}
                                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:text-ink">
                                <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-ink" aria-label="Quantity">{it.quantity}</span>
                              <button type="button" aria-label={`Increase quantity of ${it.title}`} onClick={() => dispatch(incrementQuantity(key))}
                                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:text-ink">
                                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-ink">{formatPrice((Number(it.price) || 0) * it.quantity)}</span>
                          </div>
                        </div>
                        <button type="button" aria-label={`Remove ${it.title}`} onClick={() => dispatch(removeFromCart(key))}
                          className="grid h-8 w-8 flex-none place-items-center self-start rounded-full text-muted-light transition hover:bg-alert/10 hover:text-alert">
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <footer className="border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Subtotal ({count} {count === 1 ? "item" : "items"})</span>
                    <span className="text-lg font-bold text-ink">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-light">Inclusive of taxes. Coupons and delivery are applied at checkout.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link to="/cart" onClick={close}
                      className="flex items-center justify-center rounded-full border-2 border-ink py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white">
                      View cart
                    </Link>
                    <button type="button" onClick={() => { close(); navigate("/cart?checkout=1"); }}
                      className="rounded-full bg-accent py-2.5 text-sm font-bold text-white transition hover:bg-[#8f4e2d]">
                      Checkout
                    </button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
