// ProductCard.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import Slider from "react-slick";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDown,
  FaAngleUp,
  FaShareAlt,
  FaTruck,
  FaUndoAlt,
} from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

/** Small star row */
const Stars = ({ value, className = "" }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f${i}`} className="text-yellow-500" />
      ))}
      {half === 1 && <FaStarHalfAlt className="text-yellow-500" />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e${i}`} className="text-gray-300" />
      ))}
    </div>
  );
};

/** Click-outside hook */
function useClickOutside(ref, onClose, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    }
    function onEsc(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ref, onClose, enabled]);
}

// Put this helper above your component
function ratingBreakdownFromAverage(rating, reviews) {
  // clamp to [1,5]
  const r = Math.max(1, Math.min(5, rating));
  if (r === 5) return [0, 0, 0, 0, reviews]; // all 5★

  const lowStar = Math.floor(r);        // 1..4
  const highStar = lowStar + 1;         // 2..5
  const frac = r - lowStar;             // share to highStar

  const counts = [0, 0, 0, 0, 0];       // idx 0..4 => 1★..5★
  const lowIdx = lowStar - 1;
  const highIdx = highStar - 1;

  counts[lowIdx]  = Math.round((1 - frac) * reviews);
  counts[highIdx] = reviews - counts[lowIdx]; // ensure sum == reviews
  return counts;
}

// Replace your RatingPopover with this version
const RatingPopover = ({ rating }) => {
  // keep the same review-count logic you used before
  const reviews = Math.max(20, Math.floor(rating * 40));

  const dist = ratingBreakdownFromAverage(rating, reviews); // [1★..5★]
  const pct = dist.map((c) => Math.round((c / reviews) * 100));

  return (
    <div className="w-72 p-4 rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900">{rating.toFixed(1)}</div>
          <div className="text-xs text-gray-500">out of 5</div>
        </div>
        <div className="flex items-center gap-1">
          {/* keep your Stars component */}
          <Stars value={rating} />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        {reviews.toLocaleString()} ratings
        <span className="ml-1 text-[10px] text-gray-400">(estimated split)</span>
      </div>

      <div className="mt-4 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const idx = star - 1; // 0..4
          const barPct = Math.max(2, pct[idx]); // show at least a sliver
          const color =
            star >= 4 ? "bg-emerald-500" : star === 3 ? "bg-yellow-400" : "bg-red-400";
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-4 text-xs text-gray-600">{star}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${barPct}%` }} />
              </div>
              <span className="w-10 text-right text-[11px] text-gray-500">{barPct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProductCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descOpen, setDescOpen] = useState(true);
  const [specOpen, setSpecOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mainSlider, setMainSlider] = useState(null);
  const [thumbSlider, setThumbSlider] = useState(null);
  const [copied, setCopied] = useState(false);

  // zoom
  const [zoom, setZoom] = useState({ enabled: false, x: 0, y: 0 });

  // rating popover
  const [showRating, setShowRating] = useState(false);
  const ratingRef = useRef(null);
  useClickOutside(ratingRef, () => setShowRating(false), showRating);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://dummyjson.com/products/${id}`);
      const data = await res.json();
      setProduct(data);
      const rel = await fetch(
        `https://dummyjson.com/products/category/${encodeURIComponent(data.category)}?limit=8`
      ).then((r) => r.json());
      setRelated(rel.products.filter((p) => p.id !== +id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // JSON-LD schema for SEO
  useEffect(() => {
    if (!product) return;
    const mrp = product.discountPercentage
      ? (product.price / (1 - product.discountPercentage / 100)) * 83
      : product.price * 83;
    const data = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.title,
      image: product.images?.length ? product.images : [product.thumbnail],
      brand: product.brand,
      category: product.category,
      description: product.description,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: Math.max(20, Math.floor(product.rating * 40)),
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: Math.round(product.price * 83),
        availability:
          product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: window.location.href,
        priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        msrp: Math.round(mrp),
      },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const {
    title,
    brand,
    category,
    images,
    thumbnail,
    price,
    discountPercentage,
    rating,
    stock,
    description,
  } = product;

  const imgs = images?.length > 1 ? images : [thumbnail];

  // share
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Check this out: ${title}`, url });
      } catch (e) {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // sliders
  const mainSettings = {
    asNavFor: imgs.length > 1 ? thumbSlider : null,
    ref: (s) => setMainSlider(s),
    slidesToShow: 1,
    arrows: imgs.length > 1,
    nextArrow: (
      <FaChevronRight className="slick-next text-2xl text-gray-600 hover:text-gray-800" />
    ),
    prevArrow: (
      <FaChevronLeft className="slick-prev text-2xl text-gray-600 hover:text-gray-800" />
    ),
  };
  const thumbSettings = {
    asNavFor: mainSlider,
    ref: (s) => setThumbSlider(s),
    slidesToShow: Math.min(imgs.length, 5),
    focusOnSelect: true,
    arrows: false,
    centerMode: imgs.length > 5,
  };

  // qty
  const changeQty = (d) => setQuantity((q) => Math.max(1, q + d));
  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity }));
    navigate("/cart");
  };

  // price calc (proper MRP)
  const selling = price * 83;
  const mrp = discountPercentage ? (price / (1 - discountPercentage / 100)) * 83 : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4">
        <Link to="/" className="text-orange-600 hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/products" className="text-gray-600 hover:underline">
          Products
        </Link>{" "}
        / <span className="font-semibold">{title}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 p-6 flex flex-col lg:flex-row gap-10">
        {/* Images */}
        <div className="lg:w-1/2 relative">
          {/* Out-of-Stock overlay */}
          {stock === 0 && (
            <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center text-2xl font-bold text-red-600 backdrop-blur-sm">
              Out of Stock
            </div>
          )}

          {imgs.length > 1 ? (
            <>
              <Slider {...mainSettings}>
                {imgs.map((u, i) => (
                  <div
                    key={i}
                    className="h-96 flex items-center justify-center group relative overflow-hidden rounded-2xl bg-gray-50"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setZoom((z) => ({ ...z, x, y }));
                    }}
                    onMouseEnter={() => setZoom((z) => ({ ...z, enabled: true }))}
                    onMouseLeave={() => setZoom({ enabled: false, x: 0, y: 0 })}
                  >
                    <img
                      src={u}
                      alt={`${title} ${i + 1}`}
                      className="max-h-full object-contain transition duration-300"
                    />
                    {/* hover zoom */}
                    {zoom.enabled && (
                      <div
                        className="hidden lg:block absolute inset-0 pointer-events-none rounded-2xl"
                        style={{
                          backgroundImage: `url(${u})`,
                          backgroundSize: "200%",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                          filter: "brightness(1.02)",
                        }}
                      />
                    )}
                  </div>
                ))}
              </Slider>
              <div className="mt-4">
                <Slider {...thumbSettings}>
                  {imgs.map((u, i) => (
                    <button
                      key={i}
                      className="px-1 outline-none"
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={u}
                        alt={`thumb ${i + 1}`}
                        className="h-20 w-full object-contain rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                      />
                    </button>
                  ))}
                </Slider>
              </div>
            </>
          ) : (
            <div
              className="h-96 flex items-center justify-center relative overflow-hidden rounded-2xl bg-gray-50"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoom((z) => ({ ...z, x, y }));
              }}
              onMouseEnter={() => setZoom((z) => ({ ...z, enabled: true }))}
              onMouseLeave={() => setZoom({ enabled: false, x: 0, y: 0 })}
            >
              <img src={imgs[0]} alt={title} className="max-h-full object-contain" />
              {zoom.enabled && (
                <div
                  className="hidden lg:block absolute inset-0 pointer-events-none rounded-2xl"
                  style={{
                    backgroundImage: `url(${imgs[0]})`,
                    backgroundSize: "200%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-sm text-gray-600">
                by <strong>{brand}</strong>
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
                  stock > 0
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                    : "bg-red-50 text-red-800 ring-red-100"
                }`}
              >
                {stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              {discountPercentage > 0 && (
                <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-orange-100">
                  {discountPercentage.toFixed(0)}% OFF
                </span>
              )}
            </div>

            {/* Rating row (click to open details) */}
            <div className="relative mt-3" ref={ratingRef}>
              <button
                onClick={() => setShowRating((s) => !s)}
                className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 hover:bg-gray-50 transition"
                aria-expanded={showRating}
                aria-label="Show rating details"
              >
                <Stars value={rating} />
                <span className="text-gray-700 font-medium">{rating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm group-hover:text-gray-500">
                  (tap to view)
                </span>
              </button>

              {showRating && (
                <div className="absolute z-30 mt-2">
                  <RatingPopover rating={rating} />
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mt-5">
              <span className="text-3xl font-bold text-gray-900">{INR(selling)}</span>
              {mrp && <span className="text-gray-500 line-through">{INR(mrp)}</span>}
            </div>

            {/* trust row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <FaTruck /> Free delivery by{" "}
                <strong>
                  {new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <FaUndoAlt /> 7-day easy returns
              </span>
            </div>

            {/* qty + actions */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div
                className="flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-white"
                role="group"
                aria-label="Quantity selector"
              >
                <button
                  onClick={() => changeQty(-1)}
                  className="px-3 py-2 hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  <FaChevronDown />
                </button>
                <span className="px-5 py-2 text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => changeQty(1)}
                  className="px-3 py-2 hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  <FaChevronUp />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={stock === 0}
                className={`px-6 py-3 rounded-2xl font-semibold transition shadow-sm hover:shadow-md ${
                  stock > 0
                    ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:brightness-105"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {stock > 0 ? "Add to Cart" : "Unavailable"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <FaShareAlt /> {copied ? "Link copied!" : "Share"}
              </button>
            </div>

            {/* accordions */}
            <div className="mt-8 space-y-4">
              <div className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setDescOpen((o) => !o)}
                  className="w-full flex justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
                >
                  <span className="font-medium">Description</span>
                  {descOpen ? <FaAngleUp /> : <FaAngleDown />}
                </button>
                {descOpen && <div className="p-4 text-gray-700 leading-relaxed">{description}</div>}
              </div>
              <div className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setSpecOpen((o) => !o)}
                  className="w-full flex justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
                >
                  <span className="font-medium">Specifications</span>
                  {specOpen ? <FaAngleUp /> : <FaAngleDown />}
                </button>
                {specOpen && (
                  <ul className="p-4 text-gray-700 space-y-2 list-disc list-inside">
                    <li>
                      <strong>Brand:</strong> {brand}
                    </li>
                    <li>
                      <strong>Category:</strong> {category}
                    </li>
                    <li>
                      <strong>Stock:</strong> {stock}
                    </li>
                    <li>
                      <strong>Discount:</strong> {discountPercentage.toFixed(0)}%
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <Slider
          dots={false}
          infinite
          speed={400}
          slidesToShow={4}
          slidesToScroll={4}
          responsive={[
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
          ]}
        >
          {related.map((rp) => (
            <div key={rp.id} className="px-2">
              <Link
                to={`/product/${rp.id}`}
                className={`group block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition relative h-full ${
                  rp.stock === 0 ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {rp.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
                    Out of Stock
                  </div>
                )}
                <div className="h-40 flex items-center justify-center mb-4">
                  <img
                    src={rp.images[0]}
                    alt={rp.title}
                    className="max-h-full object-contain transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                  {rp.title}
                </h3>

                {/* Price */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-orange-600 font-bold">{INR(rp.price * 83)}</span>
                  <Stars value={rp.rating} />
                </div>

                {/* Rating footer pinned at bottom */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    {rp.rating.toFixed(1)} / 5
                  </span>
                  <span className="text-gray-400">View details</span>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t p-3 lg:hidden">
        <div className="container mx-auto px-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-lg font-semibold text-gray-900">
              {INR(selling * quantity)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-white"
              role="group"
              aria-label="Quantity selector"
            >
              <button onClick={() => changeQty(-1)} className="px-3 py-2" aria-label="Decrease">
                <FaChevronDown />
              </button>
              <span className="px-3">{quantity}</span>
              <button onClick={() => changeQty(1)} className="px-3 py-2" aria-label="Increase">
                <FaChevronUp />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={stock === 0}
              className={`px-5 py-3 rounded-2xl font-semibold transition shadow-sm ${
                stock > 0
                  ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:brightness-105"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              {stock > 0 ? "Add to Cart" : "Unavailable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
