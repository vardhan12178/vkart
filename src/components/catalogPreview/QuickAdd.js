import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiX, FiShoppingCart, FiZap } from "react-icons/fi";
import { addToCart } from "../../redux/cartSlice";
import { showToast } from "../../utils/toast";
import { fetchProduct, defaultVariant, imagesFor, formatPrice } from "./catalogApi";
import { matchVariant, optionExists, pickOption, visibleOptions, isAvailable, cartLineFrom, variantLabel } from "./v2Items";

// Quick-add sheet for listing tiles that need a choice (clothing sizes, or a sold-out default variant)
// Bottom sheet on phones, centred dialog from sm up.
export default function QuickAdd({ slug, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [status, setStatus] = useState("loading");
  const [opts, setOpts] = useState({});

  useEffect(() => {
    let live = true;
    fetchProduct(slug)
      .then((prod) => {
        if (!live) return;
        if (!prod) return setStatus("error");
        setP(prod);
        setOpts(defaultVariant(prod).options);
        setStatus("ready");
      })
      .catch(() => live && setStatus("error"));
    return () => { live = false; };
  }, [slug]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const variant = matchVariant(p, opts);
  const available = isAvailable(variant);
  const image = p ? imagesFor(p, opts[p.media?.groupBy])[0] : null;

  const buy = (kind) => {
    if (!variant || !available) return;
    if (!p.id) {
      showToast("Ordering works once this site's backend serves the v2 API.", "error");
      return;
    }
    dispatch(addToCart(cartLineFrom(p, variant, image?.md)));
    onClose();
    if (kind === "buy") navigate("/cart");
    else showToast(`Added to cart${variantLabel(variant) ? ` · ${variantLabel(variant)}` : ""}`, "success");
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={p ? `Choose options for ${p.title}` : "Choose options"}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf8] p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        <button type="button" aria-label="Close" onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#6f6b62] hover:bg-black/5">
          <FiX />
        </button>

        {status === "loading" && (
          <div className="flex gap-4">
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-[#f1ece3]" />
            <div className="flex-1 space-y-2 pt-2"><div className="h-4 w-4/5 rounded bg-[#f1ece3]" /><div className="h-5 w-1/3 rounded bg-[#f1ece3]" /></div>
          </div>
        )}
        {status === "error" && <p className="py-6 text-center text-sm text-[#1d1c19]">Couldn't load this product. Please try again.</p>}

        {status === "ready" && p && (
          <>
            <div className="flex gap-4 pr-8">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f6f3ed]">
                {image && <img src={image.thumb} alt={image.alt || p.title} referrerPolicy="no-referrer" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b867d]">{p.brand}</p>
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-[#1d1c19]">{p.title}</h2>
                {variant && (
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-lg font-bold text-[#1d1c19]">{formatPrice(variant.price)}</span>
                    {variant.discountPercent > 0 && (
                      <>
                        <span className="text-xs text-[#8b867d] line-through">{formatPrice(variant.mrp)}</span>
                        <span className="text-xs font-bold text-ok">{variant.discountPercent}% off</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {visibleOptions(p).map((o) => (
              <div key={o.name} className="mt-5">
                <p className="text-sm font-semibold text-[#1d1c19]">
                  {o.name}: <span className="font-normal text-[#6f6b62]">{opts[o.name]}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {o.values.map((val) => {
                    const active = opts[o.name] === val.value;
                    const ok = optionExists(p, opts, o.name, val.value);
                    if (o.name === "Color" && val.hex) {
                      return (
                        <button key={val.value} type="button" title={val.value} aria-label={val.value} aria-pressed={active}
                          onClick={() => setOpts(pickOption(p, opts, o.name, val.value))}
                          className={`h-8 w-8 rounded-full border-2 border-white ring-2 ring-offset-1 ${active ? "ring-[#a85d37]" : "ring-[#e4ddd0]"} ${ok ? "" : "opacity-40"}`}
                          style={{ background: val.hex }} />
                      );
                    }
                    return (
                      <button key={val.value} type="button" aria-pressed={active}
                        onClick={() => setOpts(pickOption(p, opts, o.name, val.value))}
                        className={`min-w-[2.75rem] rounded-lg border px-3 py-1.5 text-sm transition ${active ? "border-[#1d1c19] bg-[#1d1c19] text-white" : "border-[#d9d2c5] bg-white text-[#1d1c19] hover:border-[#1d1c19]"} ${ok ? "" : "text-gray-400 line-through opacity-60"}`}>
                        {val.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!available && <p className="mt-4 text-sm font-semibold text-alert">This option is out of stock.</p>}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={!available} onClick={() => buy("cart")}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1d1c19] py-2.5 text-sm font-bold text-[#1d1c19] transition hover:bg-[#1d1c19] hover:text-white disabled:opacity-40">
                <FiShoppingCart /> Add to cart
              </button>
              <button type="button" disabled={!available} onClick={() => buy("buy")}
                className="flex items-center justify-center gap-2 rounded-full bg-[#a85d37] py-2.5 text-sm font-bold text-white transition hover:bg-[#8f4e2d] disabled:opacity-40">
                <FiZap /> Buy now
              </button>
            </div>
            <Link to={`/catalog-preview/${p.slug}`} onClick={onClose}
              className="mt-4 block text-center text-xs font-semibold text-[#a85d37] underline underline-offset-4">
              View full details
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
