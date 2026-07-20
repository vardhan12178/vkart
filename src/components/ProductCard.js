import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlist } from "../redux/wishlistSlice";
import Slider from "react-slick";
import axios from "./axiosInstance";
import { Helmet } from "react-helmet-async";
import { qk } from "../query/queryKeys";

import ReviewModal from "./ReviewModal";

import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
  FaShareAlt,
  FaTruck,
  FaUndoAlt,
  FaShieldAlt,
  FaHeart,
  FaRegHeart,
  FaCartPlus,
  FaPen,
  FaCheckCircle,
  FaUserCircle
} from "react-icons/fa";
import { showToast } from "../utils/toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ---------- Animations & Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .slick-dots li button:before { font-size: 8px; color: #cbd5e1; opacity: 1; }
    .slick-dots li.slick-active button:before { color: #111827; }
    
    .slick-slider { width: 100%; height: 100%; }
    .slick-list { height: 100%; }
    .slick-track { height: 100%; display: flex; align-items: center; }
    .slick-slide { height: 100%; display: flex; justify-content: center; align-items: center; }
    .slick-slide > div { width: 100%; height: 100%; }
  `}</style>
);

/* ---------- Utilities ---------- */
const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount ?? 0));

const Stars = ({ value = 0, size = "text-base", className = "" }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  return (
    <div className={`flex items-center gap-0.5 text-amber-400 ${size} ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <FaStar key={i} />;
        if (i === full && half) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} className="text-gray-200" />;
      })}
    </div>
  );
};

const Arrow = ({ onClick, direction }) => (
  <button
    type="button"
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 ${direction === "next" ? "right-4" : "left-4"
      } h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-900 hover:scale-110 transition-all active:scale-95 hidden md:flex`}
  >
    {direction === "next" ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
  </button>
);

/* ---------- Sub-Components (ReviewCard, ReviewSummary) ---------- */
const ReviewCard = ({ review }) => {
  const user = review.userId;
  const displayName = user?.name || user?.username || review.reviewerName || "Verified Buyer";
  const profileImage = user?.profileImage;

  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <FaUserCircle size={24} />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{displayName}</h4>
            <Stars value={review.rating} size="text-xs" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
          <FaCheckCircle size={10} /> Verified
        </span>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      <div className="mt-2 text-xs text-gray-400">
        {new Date(review.date || Date.now()).toLocaleDateString()}
      </div>
    </div>
  );
};

const ReviewSummary = ({ reviews = [], rating }) => {
  const total = reviews.length;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rounded = Math.round(r.rating);
    if (counts[rounded] !== undefined) counts[rounded]++;
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="text-center md:text-left shrink-0">
        <div className="text-5xl font-black text-gray-900">{rating?.toFixed(1)}</div>
        <Stars value={rating} size="text-lg" className="justify-center md:justify-start my-2" />
        <p className="text-sm text-gray-500">{total} reviews</p>
      </div>
      <div className="flex-1 w-full space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = counts[star];
          const pct = total ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-3 font-bold text-gray-500">{star}</span>
              <FaStar className="text-gray-300 text-xs" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right text-gray-400 text-xs">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */
export default function ProductCard() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const {
    data: product,
    isLoading: loading,
    isError: productError,
  } = useQuery({
    queryKey: qk.products.details(id),
    enabled: Boolean(id),
    retry: false,
    queryFn: async ({ signal }) => {
      const res = await axios.get(`/api/products/${id}`, { signal });
      return res.data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: qk.products.similar(id),
    enabled: Boolean(product?._id),
    queryFn: async ({ signal }) => {
      // Vector-similarity recommendations ("you might also like").
      try {
        const simRes = await axios.get(`/api/products/${product._id}/similar`, {
          params: { limit: 8 },
          signal,
        });
        const items = simRes.data.products || [];
        if (items.length) return items;
      } catch {
        /* fall through to category-based browsing below */
      }
      // Fallback: same-category products if similarity is unavailable.
      if (!product.category) return [];
      const relRes = await axios.get("/api/products", {
        params: { category: product.category, limit: 8 },
        signal,
      });
      return (relRes.data.products || []).filter((p) => p._id !== product._id);
    },
  });

  const { data: recentlyViewed = [] } = useQuery({
    queryKey: qk.products.recent(id),
    enabled: Boolean(id),
    queryFn: async () => {
      try {
        const key = "vkart_recently_viewed";
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        const ids = saved.filter((pid) => pid !== id).slice(0, 6);
        if (!ids.length) return [];
        const results = await Promise.all(
          ids.map((pid) => axios.get(`/api/products/${pid}`).then((r) => r.data).catch(() => null))
        );
        return results.filter(Boolean);
      } catch {
        return [];
      }
    },
  });

  const [quantity, setQuantity] = useState(1);
  // Wishlist from Redux
  const wishlist = useSelector((state) => state.wishlist);
  const isInWishlist = product ? wishlist.some((item) => (item._id || item.id) === product._id) : false;
  const [zoom, setZoom] = useState({ enabled: false, x: 0, y: 0 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

  const buyBoxRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setNav1(null);
    setNav2(null);
    setQuantity(1);
    setSelectedVariants({});
  }, [id]);

  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [buyBoxRef, product]);

  const computed = useMemo(() => {
    if (!product) return null;
    const imgList = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);
    const imgs = imgList.length ? imgList : ["data:image/gif;base64,R0lGODlhAQABAAAAACw="];
    const selling = product.price || 0;
    const mrp = product.discountPercentage
      ? (selling / (1 - product.discountPercentage / 100))
      : null;
    const reviewsList = product.reviews || [];
    const reviewCount = reviewsList.length || Math.max(20, Math.floor((product.rating || 0) * 40));
    return { imgs, selling, mrp, reviewsList, reviewCount };
  }, [product]);

  const changeQty = (d) => setQuantity((q) => Math.max(1, q + d));

  const handleAdd = () => {
    if (!product) return;
    // Require variant selection if product has variants
    const variants = product.variants || [];
    if (variants.length > 0) {
      const missing = variants.find((v) => !selectedVariants[v.type]);
      if (missing) {
        showToast(`Please select a ${missing.type}`, "error");
        return;
      }
    }
    const variantStr = variants.length
      ? variants.map((v) => `${v.type}: ${selectedVariants[v.type]}`).join(", ")
      : undefined;
    dispatch(addToCart({ ...product, quantity, selectedVariants: variantStr }));
    showToast(`Added ${quantity} to cart`, "success");
  };

  const handleWish = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
    const willBeInWishlist = !isInWishlist;
    showToast(willBeInWishlist ? "Added to wishlist" : "Removed from wishlist", willBeInWishlist ? "success" : "error");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }); } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard");
    }
  };

  const handleReviewAdded = (data) => {
    queryClient.invalidateQueries({ queryKey: qk.products.details(id) });
    showToast(`Review added! New rating: ${data.newRating}/5`, "success");
  };

  const handleBuyNow = () => {
    if (!product) return;
    const variants = product.variants || [];
    if (variants.length > 0) {
      const missing = variants.find((v) => !selectedVariants[v.type]);
      if (missing) { showToast(`Please select a ${missing.type}`, "error"); return; }
    }
    const variantStr = variants.length
      ? variants.map((v) => `${v.type}: ${selectedVariants[v.type]}`).join(", ")
      : undefined;
    dispatch(addToCart({ ...product, quantity, selectedVariants: variantStr }));
    navigate("/cart");
  };

  useEffect(() => {
    if (!product) return;
    // Track in localStorage
    try {
      const key = "vkart_recently_viewed";
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = saved.filter((pid) => pid !== product._id);
      filtered.unshift(product._id);
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 12)));
      queryClient.invalidateQueries({ queryKey: qk.products.recent(id) });
    } catch {}
  }, [id, product, queryClient]);

  if (loading) return <div className="premium-page min-h-screen flex items-center justify-center text-gray-500">Preparing the details...</div>;
  if (productError || !product) return <div className="premium-page min-h-screen flex items-center justify-center text-red-500">We could not find this product.</div>;

  const { title, brand, category, discountPercentage, rating, stock, description } = product;
  const { imgs, selling, mrp, reviewsList, reviewCount } = computed;

  return (
    <div className="premium-page premium-product min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] selection:bg-[#1d1c19] selection:text-white overflow-x-hidden">
      <AnimStyles />

      <div className="hidden" />
      <div className="hidden" />

      {product && (
        <Helmet prioritizeSeoTags>
          <title>{product.title} | VKart</title>
          <meta name="description" content={product.description} />
          <link rel="canonical" href={`https://vkart.balavardhan.dev/product/${product._id}`} />
          <meta property="og:type" content="product" />
          <meta property="og:title" content={`${product.title} | VKart`} />
          <meta property="og:description" content={product.description} />
          <meta property="og:url" content={`https://vkart.balavardhan.dev/product/${product._id}`} />
          <meta property="og:image" content={imgs?.[0] || product.thumbnail} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${product.title} | VKart`} />
          <meta name="twitter:description" content={product.description} />
          <meta name="twitter:image" content={imgs?.[0] || product.thumbnail} />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.title,
              image: imgs || [product.thumbnail],
              description: product.description,
              brand: { "@type": "Brand", name: product.brand || "VKart" },
              sku: product._id,
              offers: {
                "@type": "Offer",
                url: `https://vkart.balavardhan.dev/product/${product._id}`,
                priceCurrency: "INR",
                price: selling,
                availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                seller: { "@type": "Organization", name: "VKart" },
              },
              ...(rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating, reviewCount: reviewCount || 1, bestRating: 5 } } : {}),
            })}
          </script>
        </Helmet>
      )}

      <div className="container mx-auto px-4 py-6 sm:py-10 relative z-10 pb-32 lg:pb-10">

        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6 md:mb-8 animate-fade-up">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link to="/products" className="hover:text-gray-900 transition-colors">Collection</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 truncate max-w-[150px] md:max-w-[300px]">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Image gallery */}
          <div className="lg:col-span-6 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative">

              {/* Main display area */}
              <div className="relative group rounded-2xl overflow-hidden bg-gray-50 aspect-square max-h-[350px] lg:max-h-[450px] w-full mx-auto">
                <Slider
                  asNavFor={nav2}
                  ref={(slider) => setNav1(slider)}
                  prevArrow={<Arrow direction="prev" />}
                  nextArrow={<Arrow direction="next" />}
                  fade={true}
                  className="h-full w-full flex items-center"
                >
                  {imgs.map((img, i) => (
                    <div key={i} className="relative w-full h-full outline-none">
                      <div
                        className="w-full h-full flex items-center justify-center cursor-zoom-in p-6"
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
                          src={img}
                          alt="Product"
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
                        />
                        {zoom.enabled && (
                          <div
                            className="hidden lg:block absolute inset-0 bg-no-repeat bg-white pointer-events-none z-10"
                            style={{
                              backgroundImage: `url(${img})`,
                              backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                              backgroundSize: "200%",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </Slider>

                {stock === 0 && (
                  <div className="absolute left-4 top-4 z-20 rounded-full bg-[#75483b] px-3 py-1 text-xs font-bold text-white">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imgs.length > 1 && (
                <div className="mt-4 px-2">
                  <Slider
                    asNavFor={nav1}
                    ref={(slider) => setNav2(slider)}
                    slidesToShow={Math.min(imgs.length, 5)}
                    swipeToSlide={true}
                    focusOnSelect={true}
                    arrows={false}
                    className="thumbnail-slider"
                    responsive={[
                      {
                        breakpoint: 768,
                        settings: {
                          slidesToShow: Math.min(imgs.length, 4)
                        }
                      },
                      {
                        breakpoint: 480,
                        settings: {
                          slidesToShow: Math.min(imgs.length, 3)
                        }
                      }
                    ]}
                  >
                    {imgs.map((img, i) => (
                      <div key={i} className="px-1 md:px-2 cursor-pointer outline-none">
                        <div className="h-16 w-full rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-gray-900 transition-all">
                          <img src={img} className="h-full w-full object-contain p-1 mix-blend-multiply" alt="" />
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
          </div>

          {/* Product details */}
          <div className="lg:col-span-6 space-y-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>

            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {category}
                </span>
                {product.onSale && product.saleName && (
                  <span className="rounded-full bg-[#eee2dc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#75483b]">
                    {product.saleName}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="rounded-full bg-[#e5e8df] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#59634f]">
                    Save {Math.round(discountPercentage)}%
                  </span>
                )}
              </div>
              <h1 className="product-detail-title font-editorial font-normal text-[#1d1c19] leading-[0.98] tracking-[-0.035em] mb-4">
                {title}
              </h1>
              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="font-bold text-gray-500">{brand}</div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Stars value={rating} size="text-sm" />
                  <span className="text-gray-400 font-medium">({reviewCount} Reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pb-6 border-b border-gray-100">
                <div className="text-4xl font-bold text-gray-900">{formatPrice(selling)}</div>
                {mrp && <div className="text-lg text-gray-400 line-through">{formatPrice(mrp)}</div>}
              </div>
            </div>

            {/* Controls */}
            <div ref={buyBoxRef} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
              {/* Variant Selectors */}
              {product.variants?.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((v) => (
                    <div key={v.type}>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        {v.type}{selectedVariants[v.type] ? `: ${selectedVariants[v.type]}` : ""}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(v.options || []).map((opt) => {
                          const active = selectedVariants[v.type] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.type]: opt }))}
                              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                                active
                                  ? "border-[#1d1c19] bg-[#1d1c19] text-white"
                                  : "border-black/10 text-[#6f6b62] hover:border-black/25 hover:text-[#1d1c19]"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`grid grid-cols-1 gap-3 ${
                  stock > 0
                    ? "sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)]"
                    : "sm:grid-cols-[8rem_minmax(0,1fr)]"
                }`}
              >
                <div className="flex h-12 w-full items-center rounded-full border border-black/10 bg-[#f1ede5]">
                  <button
                    onClick={() => changeQty(-1)}
                    className="h-full flex-1 rounded-l-full font-bold text-[#6f6b62] transition-colors hover:bg-[#fffdf8] hover:text-[#1d1c19]"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => changeQty(1)}
                    className="h-full flex-1 rounded-r-full font-bold text-[#6f6b62] transition-colors hover:bg-[#fffdf8] hover:text-[#1d1c19]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={stock === 0}
                  className={`flex h-12 items-center justify-center gap-2 rounded-full text-base font-bold transition-colors ${
                    stock === 0
                      ? "cursor-not-allowed bg-[#ddd8cf] text-[#8b867d]"
                      : "bg-[#1d1c19] text-white hover:bg-black"
                  }`}
                >
                  <FaCartPlus /> {stock === 0 ? "Out of Stock" : "Add to Bag"}
                </button>

                {/* Buy Now */}
                {stock > 0 && (
                  <button
                    onClick={handleBuyNow}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#a85d37] text-base font-bold text-white transition-colors hover:bg-[#874526]"
                  >
                    <FaBolt size={12} /> Buy It Now
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleWish}
                  className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-bold transition-colors ${isInWishlist ? "border-[#c9a58f] bg-[#efe3d9] text-[#874526]" : "border-black/10 text-[#5f5b52] hover:border-[#b98a70] hover:bg-[#f1e8df] hover:text-[#874526]"
                    }`}
                >
                  {isInWishlist ? <FaHeart /> : <FaRegHeart />} {isInWishlist ? "Saved" : "Save item"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-black/10 text-sm font-bold text-[#5f5b52] transition-colors hover:bg-black/[0.04] hover:text-[#1d1c19]"
                >
                  <FaShareAlt /> Share
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 my-6 bg-gray-50/50 rounded-2xl px-4">
              {[
                { icon: <FaTruck />, title: "Free Delivery", sub: "On eligible orders" },
                { icon: <FaShieldAlt />, title: "Protected", sub: "Secure checkout" },
                { icon: <FaUndoAlt />, title: "Easy Returns", sub: "Within 7 days" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center gap-1.5">
                  <div className="text-gray-900 bg-white p-2.5 rounded-full shadow-sm border border-gray-100">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">{item.title}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product highlights */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                Product Highlights
              </h3>

              <div className="space-y-3">
                {description.split(/(?=[\u2022*-])|\n/).map((line, index) => {
                  const cleanedLine = line.replace(/^[\u2022*-]\s*/, "").trim();
                  if (!cleanedLine) return null;

                  const isSpec = cleanedLine.includes(':');

                  return (
                    <div key={index} className="flex items-start gap-3 group">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-amber-500 transition-colors shrink-0" />
                      <p className={`text-sm leading-relaxed ${isSpec ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                        {isSpec ? (
                          <>
                            <span className="font-bold text-gray-900">{cleanedLine.split(':')[0]}:</span>
                            {cleanedLine.split(':')[1]}
                          </>
                        ) : (
                          cleanedLine
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-20 lg:mt-32">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h3>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <ReviewSummary reviews={reviewsList.length ? reviewsList : Array(reviewCount).fill({ rating: rating || 5 })} rating={rating} />
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">Write a Review</h4>
                <p className="text-gray-500 text-sm mb-6">Share your thoughts with other customers.</p>
                <button
                  onClick={() => isAuthenticated ? setShowReviewModal(true) : navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                  className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  {isAuthenticated ? (
                    <>
                      <FaPen size={12} /> Write Review
                    </>
                  ) : (
                    "Login to Review"
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8">
              {/* Sort Controls */}
              {reviewsList.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort by:</span>
                  {[
                    { key: "newest", label: "Newest" },
                    { key: "highest", label: "Highest Rated" },
                    { key: "lowest", label: "Lowest Rated" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setReviewSort(opt.key); setReviewPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reviewSort === opt.key ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-4">
                {(() => {
                  if (!reviewsList.length) return (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-lg font-semibold mb-1">No reviews yet</p>
                      <p className="text-sm">Be the first to review this product.</p>
                    </div>
                  );
                  const sorted = [...reviewsList].sort((a, b) => {
                    if (reviewSort === "highest") return (b.rating || 0) - (a.rating || 0);
                    if (reviewSort === "lowest") return (a.rating || 0) - (b.rating || 0);
                    return new Date(b.date || 0) - new Date(a.date || 0);
                  });
                  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE);
                  const paginated = sorted.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);
                  return (
                    <>
                      {paginated.map((r, i) => <ReviewCard key={i} review={r} />)}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setReviewPage(p)}
                              className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${reviewPage === p ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-20 lg:mt-32 border-t border-gray-100 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">You might also like</h3>
            <Link to="/products" className="text-sm font-bold text-gray-900 hover:underline">View All</Link>
          </div>

          <Slider
            dots={false}
            infinite={false}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            responsive={[
              { breakpoint: 1280, settings: { slidesToShow: 3 } },
              { breakpoint: 1024, settings: { slidesToShow: 2.2 } },
              { breakpoint: 640, settings: { slidesToShow: 1.3, arrows: false } },
            ]}
            className="-mx-2 md:-mx-4"
          >
            {related.map((rp) => (
              <div key={rp._id} className="px-2 md:px-4 py-2 h-full">
                <Link to={`/product/${rp._id}`} className="group block bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all h-full">
                  <div className="aspect-[4/3] bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                    <img src={rp.thumbnail} alt={rp.title} className="w-full h-full object-contain mix-blend-multiply p-4 group-hover:scale-105 transition-transform duration-500" />
                    {rp.discountPercentage > 0 && (
                      <span className="absolute top-2 right-2 bg-white text-gray-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        -{Math.round(rp.discountPercentage)}%
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 truncate text-sm mb-1">{rp.title}</h4>
                  <div className="flex items-baseline gap-2">
                    <div className="font-bold text-gray-900">{formatPrice(rp.price)}</div>
                    <div className="text-xs text-gray-400 line-through">{formatPrice(rp.price * 1.2)}</div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>

        {/* RECENTLY VIEWED */}
        {recentlyViewed.length > 0 && (
          <div className="mt-20 lg:mt-32 border-t border-gray-100 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Recently Viewed</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((rp) => (
                <Link key={rp._id} to={`/product/${rp._id}`} className="group block bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all">
                  <div className="aspect-square bg-gray-50 rounded-xl mb-2 overflow-hidden">
                    <img src={rp.thumbnail} alt={rp.title} className="w-full h-full object-contain mix-blend-multiply p-3 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 truncate text-xs mb-0.5">{rp.title}</h4>
                  <div className="font-bold text-gray-900 text-sm">{formatPrice(rp.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.08] bg-[#fffdf8]/95 p-4 backdrop-blur lg:hidden transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Total</div>
            <div className="text-xl font-black text-gray-900 leading-none">{formatPrice(selling * quantity)}</div>
          </div>
          <button
            onClick={handleAdd}
            disabled={stock === 0}
            className="flex h-12 items-center gap-2 rounded-full bg-[#1d1c19] px-6 font-bold text-white"
          >
            <FaCartPlus /> {stock === 0 ? "No Stock" : "Add"}
          </button>
          {stock > 0 && (
            <button
              onClick={handleBuyNow}
              className="flex h-12 items-center gap-1.5 rounded-full bg-[#a85d37] px-5 font-bold text-white"
            >
              <FaBolt size={11} /> Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Sticky Desktop Bar */}
      <div className={`hidden lg:flex fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 py-3 px-8 z-40 items-center justify-between transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-3">
          <img src={product.thumbnail} className="h-10 w-10 rounded-lg bg-gray-100 object-contain" alt="" />
          <div>
            <div className="font-bold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">{formatPrice(selling)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="rounded-full bg-[#1d1c19] px-6 py-2 font-bold text-white transition-colors hover:bg-black">
            Add to bag
          </button>
          <button onClick={handleBuyNow} className="inline-flex items-center gap-2 rounded-full bg-[#a85d37] px-6 py-2 font-bold text-white transition-colors hover:bg-[#874526]">
            <FaBolt size={11} /> Buy Now
          </button>
        </div>
      </div>
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={id}
        onReviewAdded={handleReviewAdded}
      />

    </div>
  );
}

