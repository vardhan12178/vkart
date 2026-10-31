import { removeFromWishlist, toggleWishlist, wishlistItemKey } from "../../redux/wishlistSlice";

// Shapes catalog products into wishlist entries and toggles them.
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

// Links to the saved option when the item has one
export const productPath = (item) =>
  item?.catalog === "v2" ? `/products/${item.slug}${item.sku ? `?variant=${encodeURIComponent(item.sku)}` : ""}` : null;

/** Cart entry for a saved item, or null when it can't be ordered yet (bundled data, no sku). */
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

// Variant choice shared by the product page and the listing's quick-add sheet.
// opts: { [optionName]: value }
export const matchVariant = (p, opts) =>
  p?.variants.find((v) => Object.entries(opts).every(([k, val]) => v.options[k] === val));

/** True when some variant has this value together with the other current choices. */
export const optionExists = (p, opts, name, value) =>
  p.variants.some((v) => v.options[name] === value &&
    Object.entries(opts).every(([k, val]) => k === name || v.options[k] === val));

/** New choices after picking a value; jumps to a variant that has it when the combination doesn't exist. */
export function pickOption(p, opts, name, value) {
  const next = { ...opts, [name]: value };
  return matchVariant(p, next) ? next : p.variants.find((v) => v.options[name] === value).options;
}

/** Options worth showing (hides single "Standard"/"Default" values). */
export const visibleOptions = (p) =>
  (p.variantOptions || []).filter((o) => o.values.length > 1 || !/^(standard|default|one size)$/i.test(o.values[0]?.value || ""));

export const isAvailable = (v) => Boolean(v && v.inStock !== false && v.keySpecs?.available !== false);

/** Cart line for a product detail + chosen variant. Cart and checkout re-price it from the server. */
export function cartLineFrom(p, variant, thumbnail, quantity = 1) {
  const label = variantLabel(variant);
  return {
    catalog: "v2",
    productId: p.id,
    sku: variant.sku,
    slug: p.slug,
    title: p.title,
    price: variant.price,
    thumbnail: thumbnail || "",
    category: p.category,
    discountPercentage: variant.discountPercent || 0,
    selectedVariants: label || undefined,
    quantity,
  };
}
