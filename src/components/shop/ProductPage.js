import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { FiChevronRight } from "react-icons/fi";
import {
  findSaved,
  toggleSaved,
  wishlistItemFrom,
  matchVariant,
  optionExists,
  pickOption,
  isAvailable,
  cartLineFrom,
} from "./shopItems";
import { addToCart, cartItemKey } from "../../redux/cartSlice";
import { openMiniCart } from "../../redux/uiSlice";
import { showToast } from "../../utils/toast";
import { ReviewsSection } from "./Reviews";
import ShopperReviews from "./ShopperReviews";
import { CATEGORIES, catOf } from "./catalogData";
import { defaultVariant, imagesFor } from "./catalogApi";
import DeliveryCheck from "./DeliveryCheck";
import { addToCompare, compareUrl } from "./compareList";
import OffersEmi from "./OffersEmi";
import { productJsonLd, breadcrumbJsonLd } from "./productJsonLd";
import SizeGuide, { sizeGuideFor } from "./SizeGuide";
import BuyBox from "./product/BuyBox";
import Description from "./product/Description";
import Gallery from "./product/Gallery";
import Highlights from "./product/Highlights";
import MobileBuyBar from "./product/MobileBuyBar";
import OptionPicker from "./product/OptionPicker";
import Policies from "./product/Policies";
import PriceBlock from "./product/PriceBlock";
import ProductHeading from "./product/ProductHeading";
import ProductSkeleton from "./product/ProductSkeleton";
import Rail from "./product/Rail";
import SideColumn from "./product/SideColumn";
import SpecsSection from "./product/SpecsSection";
import useProduct from "./product/useProduct";

// Product page. Data comes from /api/v2 through catalogApi.js,
// which falls back to the bundled copy when the API isn't available.

export default function ProductPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist);
  const navigate = useNavigate();
  const [showSizes, setShowSizes] = useState(false);
  const {
    p,
    status,
    similar,
    recent,
    opts,
    setOpts,
    imgIdx,
    setImgIdx,
    qty,
    setQty,
    notice,
    setNotice,
    retry,
  } = useProduct(slug, params.get("variant"));

  const variant = useMemo(() => matchVariant(p, opts), [p, opts]);

  if (status === "loading") return <ProductSkeleton />;
  if (status !== "ready" || !p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg">
          {status === "error" ? "Couldn't load this product." : "Product not found."}
        </p>
        {status === "error" && (
          <button type="button" onClick={retry} className="mt-4 mr-4 underline">
            Try again
          </button>
        )}
        <Link to="/products" className="mt-4 inline-block underline">
          Back to the catalog
        </Link>
      </div>
    );
  }

  const cat = catOf(p);
  const images = imagesFor(p, opts[p.media.groupBy]);
  const saved = Boolean(findSaved(wishlist, p.slug));
  const off = variant?.discountPercent ?? 0;
  const available = isAvailable(variant);

  const exists = (name, value) => optionExists(p, opts, name, value);
  const pick = (name, value) => {
    const next = pickOption(p, opts, name, value);
    setOpts(next);
    if (name === p.media.groupBy) setImgIdx(0);
    setNotice("");
    const sku = matchVariant(p, next)?.sku;
    if (sku)
      setParams(
        (prev) => {
          const q = new URLSearchParams(prev);
          q.set("variant", sku);
          return q;
        },
        { replace: true }
      );
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && window.matchMedia?.("(pointer: coarse)").matches) {
        await navigator.share({ title: p.title, text: `${p.title} on VKart`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link copied", "success");
    } catch (err) {
      if (err?.name !== "AbortError") showToast("Couldn't share this link", "error");
    }
  };
  const sizeGuide = sizeGuideFor(p);
  // Cart lines store ids + SKU; the cart page and checkout re-price them from the server.
  // The bundled fallback (used when the API is unreachable) has no database ids, so it can't order.
  const buy = (kind) => {
    if (!variant) return;
    if (!p.id) {
      setNotice("Ordering is paused while the store reconnects. Please try again in a moment.");
      return;
    }
    const line = cartLineFrom(p, variant, images[0]?.md, qty);
    dispatch(addToCart(line));
    if (kind === "buy") navigate("/cart");
    else dispatch(openMiniCart(cartItemKey(line)));
  };

  const toggleSave = () => {
    const now = toggleSaved(dispatch, wishlist, wishlistItemFrom(p, variant || defaultVariant(p)));
    showToast(now ? "Saved to wishlist" : "Removed from wishlist", "success");
  };

  const origin = window.location.origin;
  const ldProduct = productJsonLd(p, variant, {
    origin,
    images: images.slice(0, 4).map((im) => im.lg || im.md),
    inStock: available,
  });
  const ldCrumbs = breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: CATEGORIES[cat] || cat, path: `/products?cat=${cat}` },
      { name: p.title, path: `/products/${p.slug}` },
    ],
    origin
  );

  return (
    <div className="bg-sand pb-28 lg:pb-12">
      <Helmet>
        <title>{`${p.title} | VKart`}</title>
        <meta name="description" content={p.shortDescription} />
        <link rel="canonical" href={`${window.location.origin}/products/${p.slug}`} />
        {ldProduct && <script type="application/ld+json">{JSON.stringify(ldProduct)}</script>}
        <script type="application/ld+json">{JSON.stringify(ldCrumbs)}</script>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumbs */}
        <nav
          className="flex flex-wrap items-center gap-1 py-4 text-xs text-muted"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <FiChevronRight />
          <Link to={`/products?cat=${cat}`} className="hover:text-ink">
            {CATEGORIES[cat] || cat}
          </Link>
          <FiChevronRight />
          <span className="text-ink">{p.brand}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-paper p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:p-8 [&>*]:min-w-0">
          <Gallery images={images} idx={imgIdx} setIdx={setImgIdx} />

          {/* Buy box */}
          <div>
            <ProductHeading
              p={p}
              cat={cat}
              saved={saved}
              onShare={share}
              onToggleSave={toggleSave}
              onCompare={() => navigate(compareUrl(addToCompare(p.slug)))}
            />

            <PriceBlock p={p} variant={variant} off={off} />

            <OptionPicker
              p={p}
              opts={opts}
              exists={exists}
              pick={pick}
              hasSizeGuide={Boolean(sizeGuide)}
              onSizeGuide={() => setShowSizes(true)}
            />

            <DeliveryCheck category={cat} price={variant ? variant.price * qty : 0} />

            <BuyBox
              p={p}
              variant={variant}
              available={available}
              qty={qty}
              setQty={setQty}
              notice={notice}
              buy={buy}
            />

            <OffersEmi price={variant?.price} />

            <Policies warranty={p.warranty} />
            <Highlights items={p.highlights} variant={variant} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] [&>*]:min-w-0">
          <div className="space-y-8">
            <SpecsSection key={p.slug} specs={p.specs} />
            <Description text={p.description} />

            {/* Reviews */}
            <ShopperReviews slug={p.slug} />
            <ReviewsSection data={p.reviews} />
          </div>

          <SideColumn p={p} />
        </div>

        <Rail title={`Similar ${CATEGORIES[cat] || "products"}`} items={similar} />
        <Rail title="Recently viewed" items={recent} />
      </div>

      {showSizes && sizeGuide && (
        <SizeGuide guide={sizeGuide} selected={opts.Size} onClose={() => setShowSizes(false)} />
      )}

      <MobileBuyBar variant={variant} off={off} available={available} buy={buy} />
    </div>
  );
}
