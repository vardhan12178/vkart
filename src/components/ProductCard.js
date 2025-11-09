import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import Slider from "react-slick";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaShareAlt,
  FaTruck,
  FaUndoAlt,
  FaShieldAlt,
  FaTag,
  FaHeart,
  FaRegHeart,
  FaCartPlus,
} from "react-icons/fa";
import { showToast } from "../utils/toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ---------- Utilities ---------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n ?? 0));

const Stars = ({ value = 0, className = "" }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const aria = `${value.toFixed ? value.toFixed(1) : value} out of 5 stars`;
  return (
    <div className={`flex items-center space-x-1 ${className}`} role="img" aria-label={aria}>
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

const Arrow = ({ onClick, direction }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === "next" ? "Next image" : "Previous image"}
    className={`!z-20 absolute top-1/2 -translate-y-1/2 ${
      direction === "next" ? "right-3" : "left-3"
    } grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:scale-[1.04] hover:bg-white`}
  >
    {direction === "next" ? <FaChevronRight className="text-gray-700" /> : <FaChevronLeft className="text-gray-700" />}
  </button>
);

export default function ProductCard() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wish, setWish] = useState(false);
  const [zoom, setZoom] = useState({ enabled: false, x: 0, y: 0 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [thumbSlider, setThumbSlider] = useState(null);
  const [mainSlider, setMainSlider] = useState(null);

  const buyBoxRef = useRef(null);

  const fetchProduct = useCallback(
    async (signal) => {
      try {
        setError("");
        setLoading(true);

        const res = await fetch(`https://dummyjson.com/products/${id}`, { signal });
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        const data = await res.json();
        setProduct(data);

        const relRes = await fetch(
          `https://dummyjson.com/products/category/${encodeURIComponent(data.category)}?limit=8`,
          { signal }
        );
        if (relRes.ok) {
          const rel = await relRes.json();
          setRelated((rel.products || []).filter((p) => p.id !== +id));
        } else {
          setRelated([]);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Could not load this product. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchProduct(ac.signal);
    return () => ac.abort();
  }, [fetchProduct]);

  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, [buyBoxRef, product]);

  const computed = useMemo(() => {
    if (!product) return null;
    const imgList = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);
    const imgs = imgList.length ? imgList : ["data:image/gif;base64,R0lGODlhAQABAAAAACw="];
    const selling = (product.price || 0) * 83;
    const mrp = product.discountPercentage
      ? ((product.price || 0) / (1 - product.discountPercentage / 100)) * 83
      : null;
    const reviews = Math.max(20, Math.floor((product.rating || 0) * 40));
    return { imgs, selling, mrp, reviews };
  }, [product]);

  const changeQty = (d) => setQuantity((q) => Math.max(1, q + d));

  const handleAdd = () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    showToast(`Added ${quantity} to cart`);
  };

  const handleWish = () => {
    setWish((w) => {
      const next = !w;
      showToast(next ? "Added to wishlist" : "Removed from wishlist");
      return next;
    });
  };

  const handleShare = async (title) => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Check this out: ${title}`, url });
        showToast("Share sheet opened");
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied");
      }
    } catch {
      showToast("Could not share");
    }
  };

  const mainSettings = {
    slidesToShow: 1,
    arrows: (computed?.imgs?.length || 0) > 1,
    adaptiveHeight: true,
    nextArrow: <Arrow direction="next" />,
    prevArrow: <Arrow direction="prev" />,
  };
  const thumbSettings = {
    slidesToShow: Math.min(computed?.imgs?.length || 0, 5),
    swipeToSlide: true,
    focusOnSelect: true,
    arrows: false,
    centerMode: (computed?.imgs?.length || 0) > 5,
  };

  if (loading || !product || !computed)
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">Loading product...</div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-16 text-center text-red-600 font-medium">{error}</div>
    );

  const { title, brand, category, discountPercentage, rating, stock, description } = product;
  const { imgs, selling, mrp, reviews } = computed;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 self-start">
            <div className="relative overflow-hidden rounded-[28px] bg-gray-50 p-4">
              <Slider {...mainSettings} asNavFor={thumbSlider} ref={setMainSlider}>
                {imgs.map((u, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] md:aspect-[16/10] flex items-center justify-center relative overflow-hidden rounded-2xl bg-white"
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
                      className="max-h-full object-contain"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
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
                  <Slider {...thumbSettings} asNavFor={mainSlider} ref={setThumbSlider}>
                    {imgs.map((u, i) => (
                      <button key={i} className="px-1 outline-none" aria-label={`View image ${i + 1}`}>
                        <img
                          src={u}
                          alt={`thumb ${i + 1}`}
                          className="h-20 w-full object-contain rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-5 space-y-6">
            <nav className="text-sm">
              <Link to="/" className="text-orange-600 hover:underline">Home</Link> /{" "}
              <Link to="/products" className="text-gray-600 hover:underline">Products</Link> /{" "}
              <span className="font-semibold text-gray-800">{title}</span>
            </nav>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={rating} />
                <span className="text-xs text-gray-600">({reviews.toLocaleString()})</span>
              </div>
              <span className="text-sm text-gray-600">
                by <strong className="font-semibold text-gray-800">{brand}</strong>
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">{INR(selling)}</span>
              {mrp && <span className="text-gray-500 line-through font-medium text-lg">{INR(mrp)}</span>}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-gray-800">
                  <FaTruck className="text-lg" />
                  <div className="font-semibold">Delivery</div>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  by <strong>{new Date(Date.now() + 259200000).toLocaleDateString("en-IN")}</strong>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-gray-800">
                  <FaUndoAlt className="text-lg" />
                  <div className="font-semibold">Returns</div>
                </div>
                <div className="mt-1 text-xs text-gray-600">7-day easy returns</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-gray-800">
                  <FaShieldAlt className="text-lg" />
                  <div className="font-semibold">Payments</div>
                </div>
                <div className="mt-1 text-xs text-gray-600">Secure checkout</div>
              </div>
            </div>

            <div ref={buyBoxRef} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button onClick={() => changeQty(-1)} className="px-3 py-2 h-12 hover:bg-gray-50">–</button>
                  <span className="px-5 py-2 text-lg font-semibold">{quantity}</span>
                  <button onClick={() => changeQty(1)} className="px-3 py-2 h-12 hover:bg-gray-50">+</button>
                </div>
                <span className="text-gray-500 text-sm">
                  x {INR(selling)} ={" "}
                  <strong className="text-gray-800 font-semibold">{INR(selling * quantity)}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={(stock || 0) === 0}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-12 font-semibold shadow-sm transition ${
                  (stock || 0) > 0
                    ? "bg-gradient-to-tr from-orange-600 to-yellow-600 text-white hover:brightness-105"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                <FaCartPlus /> Add to Cart
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleWish}
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                >
                  {wish ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}{" "}
                  {wish ? "In Wishlist" : "Add to Wishlist"}
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(title)}
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                >
                  <FaShareAlt /> Share
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="text-base font-semibold uppercase text-gray-500 tracking-wider">Highlights</div>
              <ul className="mt-4 space-y-2 text-gray-700 list-disc list-outside pl-5">
                <li>{description}</li>
                <li>Signature {brand} design with refined {category} aesthetics</li>
                <li>Balanced performance; rated {rating?.toFixed?.(1)}★ by {reviews.toLocaleString()} users</li>
                <li>Thoughtfully detailed, premium finish</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
            {/* Related Products Section */}
      <div className="py-16 bg-amber-50/50 border-t border-amber-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <Slider
            dots={false}
            infinite
            speed={400}
            slidesToShow={3}
            slidesToScroll={3}
            responsive={[
              { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 3 } },
              { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
              { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            ]}
          >
            {related.map((rp) => (
              <div key={rp.id} className="px-4">
                <Link
                  to={`/product/${rp.id}`}
                  className={`group block rounded-2xl bg-white p-4 shadow-sm hover:shadow-lg transition relative h-full ${
                    (rp.stock || 0) === 0 ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  {(rp.stock || 0) === 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
                      Out of Stock
                    </div>
                  )}
                  <div className="h-40 flex items-center justify-center mb-4">
                    <img
                      src={rp.images?.[0] || rp.thumbnail || "data:image/gif;base64,R0lGODlhAQABAAAAACw="}
                      alt={rp.title}
                      className="max-h-full object-contain transition group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                    {rp.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-orange-700 font-semibold">{INR((rp.price || 0) * 83)}</span>
                    <Stars value={rp.rating || 0} />
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
      </div>

      {/* Sticky Add-to-Cart Bar */}
      <div
        className={`fixed left-0 right-0 z-50 border-t bg-white/90 backdrop-blur transition ${
          showStickyBar ? "bottom-0" : "-bottom-20"
        }`}
      >
        {/* Desktop Sticky Bar */}
        <div className="container mx-auto px-3 py-3 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={product.images?.[0] || product.thumbnail || "data:image/gif;base64,R0lGODlhAQABAAAAACw="}
              alt={title}
              className="h-10 w-10 rounded-lg border border-gray-200 object-contain bg-white"
              loading="lazy"
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
              disabled={(stock || 0) === 0}
              className={`px-6 h-10 rounded-xl font-semibold transition shadow-sm hover:shadow-md ${
                (stock || 0) > 0
                  ? "bg-gradient-to-tr from-orange-600 to-yellow-600 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Mobile Sticky Bar */}
        <div className="container mx-auto px-3 py-3 lg:hidden flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden"
              role="group"
              aria-label="Quantity selector (sticky)"
            >
              <button
                type="button"
                onClick={() => changeQty(-1)}
                className="px-3 py-1.5 hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="min-w-[2ch] px-3 py-1.5 text-center font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => changeQty(1)}
                className="px-3 py-1.5 hover:bg-gray-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-semibold text-gray-900" aria-live="polite">
              {INR(selling * quantity)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={(stock || 0) === 0}
            className={`px-5 h-10 rounded-xl font-semibold transition shadow-sm ${
              (stock || 0) > 0
                ? "bg-gradient-to-tr from-orange-600 to-yellow-600 text-white"
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

