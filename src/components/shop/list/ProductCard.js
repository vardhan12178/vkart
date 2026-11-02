import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { findSaved, toggleSaved, wishlistItemFrom, variantLabel } from "../shopItems";
import { addToCart, cartItemKey } from "../../../redux/cartSlice";
import { openMiniCart } from "../../../redux/uiSlice";
import { showToast } from "../../../utils/toast";
import { RatingChip } from "../Reviews";
import { formatPrice } from "../catalogApi";

export default function ProductCard({ p, onChooseOptions }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist);
  const liked = Boolean(findSaved(wishlist, p.slug));
  const img = p.image;
  const off = p.discountPercent;
  const colors = p.colors || [];
  const price = p.priceRange?.min ?? p.price;
  const multi = p.priceRange && p.priceRange.max > p.priceRange.min;
  // Fashion photos are styled shots: fill the frame. Product renders sit on a soft background.
  const fit = p.category === "fashion" ? "object-cover" : "object-contain p-4 mix-blend-multiply";
  // Add to cart adds the variant the tile shows (default storage/colour). Clothing with
  // several sizes asks for the size in the quick-add sheet instead of guessing one.
  const pickSize =
    p.needsSize || (p.needsSize === undefined && p.category === "fashion" && p.variantCount > 1);
  const pickOther = !pickSize && p.defaultInStock === false; // shown variant sold out, others aren't
  const label = variantLabel({ options: p.options });
  const add = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pickSize || pickOther) return onChooseOptions(p.slug);
    if (!p.id)
      return showToast(
        "Ordering is paused while the store reconnects. Please try again in a moment.",
        "error"
      );
    const line = {
      catalog: "v2",
      productId: p.id,
      sku: p.sku,
      slug: p.slug,
      title: p.title,
      price: p.price,
      thumbnail: img?.md || "",
      category: p.category,
      discountPercentage: off || 0,
      selectedVariants: label || undefined,
      quantity: 1,
    };
    dispatch(addToCart(line));
    dispatch(openMiniCart(cartItemKey(line)));
  };
  return (
    <Link
      to={`/products/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(29,28,25,0.25)]"
    >
      <div
        className={`relative overflow-hidden bg-[#f6f3ed] ${p.category === "fashion" ? "aspect-[4/5]" : "aspect-square"}`}
      >
        {img && (
          <img
            src={img.md}
            alt={img.alt || p.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full ${fit} transition-transform duration-500 group-hover:scale-[1.03]`}
          />
        )}
        {(off >= 5 || p.sale) && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${p.sale ? "bg-accent" : "bg-ink"}`}
          >
            {p.sale ? `${p.sale.name} · ${off}% OFF` : `${off}% OFF`}
          </span>
        )}
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          onClick={(e) => {
            e.preventDefault();
            const saved = toggleSaved(dispatch, wishlist, wishlistItemFrom(p));
            showToast(saved ? "Saved to wishlist" : "Removed from wishlist", "success");
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:scale-110"
        >
          <FiHeart className={liked ? "fill-accent text-accent" : ""} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-light">{p.brand}</p>
        <h2 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-ink">
          {p.title.replace(`${p.brand} `, "")}
        </h2>
        {p.rating && (
          <div className="mt-1.5">
            <RatingChip rating={p.rating} />
          </div>
        )}
        {colors.length > 1 && (
          <div className="mt-2 flex items-center gap-1">
            {colors.slice(0, 5).map((c) => (
              <span
                key={c.value}
                title={c.value}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ background: c.hex || "#ddd" }}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[11px] text-muted-light">+{colors.length - 5}</span>
            )}
          </div>
        )}
        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            {multi && <span className="text-xs text-muted-light">From</span>}
            <span className="text-base font-bold text-ink">{formatPrice(price)}</span>
            {off > 0 && (
              <span className="text-xs text-muted-light line-through">{formatPrice(p.mrp)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={add}
            disabled={p.inStock === false}
            aria-label={
              p.inStock === false
                ? `Out of stock, ${p.title}`
                : pickSize
                  ? `Select size, ${p.title}`
                  : pickOther
                    ? `See options, ${p.title}`
                    : `Add to cart, ${p.title}`
            }
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-ink py-2 text-xs font-bold text-ink transition hover:bg-ink hover:text-white disabled:border-line-strong disabled:text-muted-faint disabled:hover:bg-transparent sm:text-sm"
          >
            {p.inStock === false ? (
              "Out of stock"
            ) : pickSize ? (
              "Select size"
            ) : pickOther ? (
              "See options"
            ) : (
              <>
                <FiShoppingCart /> Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
