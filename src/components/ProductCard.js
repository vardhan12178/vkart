// src/pages/ProductCard.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import Slider from "react-slick";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDown,
  FaAngleUp,
  FaShareAlt,
  FaTruck,
  FaUndoAlt,
  FaShieldAlt,
  FaTag,
  FaHeart,
  FaRegHeart,
  FaCartPlus,
} from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

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

function ratingBreakdownFromAverage(rating, reviews) {
  const r = Math.max(1, Math.min(5, rating));
  if (r === 5) return [0, 0, 0, 0, reviews];
  const lowStar = Math.floor(r);
  const highStar = lowStar + 1;
  const frac = r - lowStar;
  const counts = [0, 0, 0, 0, 0];
  const lowIdx = lowStar - 1;
  const highIdx = highStar - 1;
  counts[lowIdx] = Math.round((1 - frac) * reviews);
  counts[highIdx] = reviews - counts[lowIdx];
  return counts;
}

const Arrow = ({ onClick, direction }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === "next" ? "Next image" : "Previous image"}
    className={`!z-20 absolute top-1/2 -translate-y-1/2 ${
      direction === "next" ? "right-3" : "left-3"
    } grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:scale-[1.04] hover:bg-white`}
  >
    {direction === "next" ? (
      <FaChevronRight className="text-gray-700" />
    ) : (
      <FaChevronLeft className="text-gray-700" />
    )}
  </button>
);

export default function ProductCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [wish, setWish] = useState(false);
  const [zoom, setZoom] = useState({ enabled: false, x: 0, y: 0 });
  const [descOpen, setDescOpen] = useState(true);
  const [specOpen, setSpecOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [thumbSlider, setThumbSlider] = useState(null);
  const [mainSlider, setMainSlider] = useState(null);

  const buyBoxRef = useRef(null);

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
    } catch {
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

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

  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setShowStickyBar(!entry.isIntersecting);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [buyBoxRef, product]);

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
  const selling = price * 83;
  const mrp = discountPercentage ? (price / (1 - discountPercentage / 100)) * 83 : null;
  const reviews = Math.max(20, Math.floor(rating * 40));
  const dist = ratingBreakdownFromAverage(rating, reviews);
  const pct = dist.map((c) => Math.round((c / reviews) * 100));

  const changeQty = (d) => setQuantity((q) => Math.max(1, q + d));
  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity }));
    navigate("/cart");
  };
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Check this out: ${title}`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const mainSettings = {
    slidesToShow: 1,
    arrows: imgs.length > 1,
    adaptiveHeight: true,
    nextArrow: <Arrow direction="next" />,
    prevArrow: <Arrow direction="prev" />,
  };
  const thumbSettings = {
    asNavFor: mainSlider,
    ref: setThumbSlider,
    slidesToShow: Math.min(imgs.length, 5),
    swipeToSlide: true,
    focusOnSelect: true,
    arrows: false,
    centerMode: imgs.length > 5,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm mb-5">
        <Link to="/" className="text-orange-600 hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/products" className="text-gray-600 hover:underline">
          Products
        </Link>{" "}
        / <span className="font-semibold">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-white to-white/80 ring-1 ring-gray-100 shadow-[0_25px_80px_-35px_rgba(0,0,0,.35)]">
            <div className="p-4">
              <div className="absolute left-4 top-4 z-10">
                <button
                  onClick={() => setWish((w) => !w)}
                  aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium shadow-lg ring-1 ring-gray-200 backdrop-blur transition hover:bg-white"
                >
                  {wish ? (
                    <FaHeart className="text-rose-500" />
                  ) : (
                    <FaRegHeart className="text-gray-500" />
                  )}
                  <span className="hidden sm:block">{wish ? "Wishlisted" : "Wishlist"}</span>
                </button>
              </div>

              <Slider {...mainSettings} asNavFor={thumbSlider} ref={setMainSlider}>
                {imgs.map((u, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] md:aspect-[16/10] flex items-center justify-center relative overflow-hidden rounded-2xl bg-gray-50"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setZoom((z) => ({ ...z, x, y }));
                    }}
                    onMouseEnter={() => setZoom((z) => ({ ...z, enabled: true }))}
                    onMouseLeave={() => setZoom({ enabled: false, x: 0, y: 0 })}
                  >
                    <img src={u} alt={`${title} ${i + 1}`} className="max-h-full object-contain" />
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
                    {stock === 0 && (
                      <div className="absolute top-4 right-4 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        Out of Stock
                      </div>
                    )}
                  </div>
                ))}
              </Slider>

              {imgs.length > 1 && (
                <div className="mt-4">
                  <Slider {...thumbSettings}>
                    {imgs.map((u, i) => (
                      <button key={i} className="px-1 outline-none" aria-label={`View image ${i + 1}`}>
                        <img
                          src={u}
                          alt={`thumb ${i + 1}`}
                          className="h-20 w-full object-contain rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                        />
                      </button>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div
            ref={buyBoxRef}
            className="sticky top-20 space-y-5 rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-gray-100"
          >
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">by <strong>{brand}</strong></span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                    stock > 0
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : "bg-red-50 text-red-700 ring-red-100"
                  }`}
                >
                  {stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
                {discountPercentage > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                    <FaTag /> {discountPercentage.toFixed(0)}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{INR(selling)}</span>
              {mrp && <span className="text-gray-500 line-through">{INR(mrp)}</span>}
            </div>

            <div className="flex items-center gap-3">
              <Stars value={rating} />
              <span className="text-sm font-medium text-gray-800">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">{reviews.toLocaleString()} ratings</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
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
              <span className="inline-flex items-center gap-2">
                <FaShieldAlt /> Secure payments
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center rounded-2xl border border-gray-200 bg-white overflow-hidden"
                role="group"
                aria-label="Quantity selector"
              >
                <button
                  type="button"
                  onClick={() => changeQty(-1)}
                  className="px-3 py-2 hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className="min-w-[2ch] px-5 py-2 text-center text-lg font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQty(1)}
                  className="px-3 py-2 hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={stock === 0}
                className={`group inline-flex items-center gap-2 rounded-2xl px-6 h-12 font-semibold shadow-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  stock > 0
                    ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:brightness-105 hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-22px_rgba(255,122,18,.55)] focus-visible:outline-orange-600"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                <FaCartPlus className="opacity-90" /> Add to Cart
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="h-12 px-4 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <FaShareAlt />
                {copied ? "Link copied" : "Share"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-gray-500">Category</div>
                <div className="font-semibold text-gray-900 capitalize">{category}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-gray-500">Stock</div>
                <div className="font-semibold text-gray-900">{stock}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-gray-100">
            <button
              type="button"
              onClick={() => setDescOpen((o) => !o)}
              className="w-full flex justify-between items-center"
            >
              <span className="text-lg font-semibold text-gray-900">Highlights</span>
              {descOpen ? <FaAngleUp /> : <FaAngleDown />}
            </button>
            {descOpen && (
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>Premium {brand} product in {category}</li>
                <li>Rated {rating.toFixed(1)}/5 by {reviews.toLocaleString()} customers</li>
                <li>Fast delivery and easy returns</li>
                <li>Great value with {discountPercentage?.toFixed?.(0)}% savings</li>
                <li className="text-gray-600">{description}</li>
              </ul>
            )}
          </div>

          <div className="mt-8 rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-gray-100">
            <button
              type="button"
              onClick={() => setSpecOpen((o) => !o)}
              className="w-full flex justify-between items-center"
            >
              <span className="text-lg font-semibold text-gray-900">Specifications</span>
              {specOpen ? <FaAngleUp /> : <FaAngleDown />}
            </button>
            {specOpen && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-gray-500 text-sm">Brand</div>
                  <div className="font-semibold text-gray-900">{brand}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-gray-500 text-sm">Category</div>
                  <div className="font-semibold text-gray-900 capitalize">{category}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-gray-500 text-sm">Stock</div>
                  <div className="font-semibold text-gray-900">{stock}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-gray-500 text-sm">Discount</div>
                  <div className="font-semibold text-gray-900">
                    {discountPercentage ? `${discountPercentage.toFixed(0)}%` : "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-gray-100">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Reviews</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</span>
                  <Stars value={rating} />
                  <span className="text-sm text-gray-500">{reviews.toLocaleString()} ratings</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const idx = star - 1;
                const barPct = Math.max(2, pct[idx]);
                const color =
                  star >= 4 ? "bg-emerald-500" : star === 3 ? "bg-yellow-400" : "bg-red-400";
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-gray-700">{star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${barPct}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs text-gray-500">{barPct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-gray-100">
            <div className="text-lg font-semibold text-gray-900 mb-4">Why shop with VKart</div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-orange-700">1</span>
                Genuine products and secure checkout
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-orange-700">2</span>
                Quick delivery with doorstep returns pickup
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-orange-700">3</span>
                Dedicated support and worry-free warranty
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <Slider
          dots={false}
          infinite
          speed={400}
          slidesToShow={4}
          slidesToScroll={4}
          responsive={[
            { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
          ]}
        >
          {related.map((rp) => (
            <div key={rp.id} className="px-2">
              <Link
                to={`/product/${rp.id}`}
                className={`group block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-lg transition relative h-full ${
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-orange-600 font-bold">{INR(rp.price * 83)}</span>
                  <Stars value={rp.rating} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between">
                  <span className="capitalize">{rp.category}</span>
                  <span className="text-gray-400">View details</span>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>

      <div
        className={`fixed left-0 right-0 z-50 border-t bg-white/90 backdrop-blur transition ${
          showStickyBar ? "bottom-0" : "-bottom-20"
        }`}
      >
        <div className="container mx-auto px-3 py-3 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={imgs[0]}
              alt={title}
              className="h-10 w-10 rounded-lg border border-gray-200 object-contain bg-white"
            />
            <div className="truncate">
              <div className="truncate text-sm font-medium text-gray-900">{title}</div>
              <div className="text-xs text-gray-500 capitalize">{category}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">{INR(selling)}</div>
              {mrp && <div className="text-xs text-gray-500 line-through">{INR(mrp)}</div>}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={stock === 0}
              className={`px-6 h-10 rounded-xl font-semibold transition shadow-sm hover:shadow-md ${
                stock > 0
                  ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
        <div className="container mx-auto px-3 py-3 lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-semibold text-gray-900">{INR(selling * quantity)}</div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={stock === 0}
            className={`px-5 h-10 rounded-xl font-semibold transition shadow-sm ${
              stock > 0
                ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
