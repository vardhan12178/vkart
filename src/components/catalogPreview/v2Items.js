import { removeFromWishlist, toggleWishlist, wishlistItemKey } from "../../redux/wishlistSlice";

// Shapes catalog v2 products into wishlist entries and toggles them.
// Entries carry { catalog: "v2", productId, sku, slug }; the bundled fallback has no
// database ids, so those entries use externalId "v2:<slug>" until the API is live.

export const variantLabel = (v) => Object.values(v?.options || {}).filter(Boolean).join(" · ");

// p: API card ({ id, sku, image, price, ... }) or product detail (with an explicit variant)
export function wishlistItemFrom(p, variant) {
  const sku = variant?.sku ?? p.sku;
  return {
    catalog: "v2",
    ...(p.id ? { productId: p.id } : { externalId: `v2:${p.slug}` }),
    sku,
    slug: p.slug,
    title: p.title,
    price: variant?.price ?? p.price,
    thumbnail: p.image?.md || p.thumbnail || "",
    category: p.category,
    discountPercentage: (variant ? variant.discountPercent : p.discountPercent) || 0,
    ...(variant ? { selectedVariants: variantLabel(variant) || undefined } : {}),
  };
}

export const findSaved = (wishlist, slug) => wishlist.find((w) => w.catalog === "v2" && w.slug === slug);

/** Adds or removes; returns true when the product is now saved. */
export function toggleSaved(dispatch, wishlist, item) {
  const existing = findSaved(wishlist, item.slug);
  if (existing) {
    dispatch(removeFromWishlist(wishlistItemKey(existing)));
    return false;
  }
  dispatch(toggleWishlist(item));
  return true;
}

export const productPath = (item) => (item?.catalog === "v2" ? `/catalog-preview/${item.slug}` : null);

/** Cart entry for a saved v2 item, or null when it can't be ordered yet (bundled data, no sku). */
export function cartItemFromSaved(item, quantity = 1) {
  if (item?.catalog !== "v2" || !item.productId || !item.sku) return null;
  return {
    catalog: "v2",
    productId: item.productId,
    sku: item.sku,
    slug: item.slug,
    title: item.title,
    price: item.price,
    thumbnail: item.thumbnail,
    category: item.category,
    discountPercentage: item.discountPercentage || 0,
    selectedVariants: item.selectedVariants,
    quantity,
  };
}
