import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import Slider from "react-slick";
import axios from "./axiosInstance";
import { Helmet } from "react-helmet-async";

import ReviewModal from "./ReviewModal";

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
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wish, setWish] = useState(false);
  const [zoom, setZoom] = useState({ enabled: false, x: 0, y: 0 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

  const buyBoxRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = useCallback(async (signal) => {
    try {
      setError("");
      setLoading(true);
      const res = await axios.get(`/api/products/${id}`, { signal });
      const data = res.data;
      setProduct(data);

      let relatedList = [];
      try {
        const relRes = await axios.get("/api/products", {
          params: { category: data.category, limit: 8 },
          signal,
        });
        relatedList = relRes.data.products || [];
      } catch { relatedList = []; }

      setRelated(relatedList.filter((p) => p._id !== data._id));
    } catch (e) {
      if (e.name !== "AbortError") setError("Could not load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const ac = new AbortController();
    fetchProduct(ac.signal);
    return () => ac.abort();
  }, [fetchProduct]);

  useEffect(() => {
    setNav1(null);
    setNav2(null);
    setQuantity(1);
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
    dispatch(addToCart({ ...product, quantity }));
    showToast(`Added ${quantity} to cart`, "success");
  };

  const handleWish = () => {
    setWish((w) => {
      const next = !w;
      showToast(next ? "Added to wishlist" : "Removed from wishlist", next ? "success" : "error");
      return next;
    });
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
    fetchProduct(new AbortController().signal);
    showToast(`Review added! New rating: ${data.newRating}⭐`, "success");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  const { title, brand, category, discountPercentage, rating, stock, description } = product;
  const { imgs, selling, mrp, reviewsList, reviewCount } = computed;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      <AnimStyles />

      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {product && (
        <Helmet>
          <title>{product.title} | VKart</title>
          <meta name="description" content={product.description} />
          <link rel="canonical" href={`https://vkart.balavardhan.dev/product/${product._id}`} />
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

          {/* ------------------------------------------
            LEFT COLUMN: Images 
            FIX: Changed from col-span-7 to col-span-6 to prevent 
            the image from getting too tall on laptops.
            ------------------------------------------
          */}
          <div className="lg:col-span-6 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative">

              {/* FIX: Main Display Area
                 Added max-h-[600px] to ensure it doesn't take up the whole screen height.
                 Kept aspect-square for consistency.
              */}
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
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">
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

          {/* ------------------------------------------
            RIGHT COLUMN: Details
            FIX: Changed from col-span-5 to col-span-6 (50/50 split)
            ------------------------------------------
          */}
          <div className="lg:col-span-6 space-y-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>

            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {category}
                </span>
                {discountPercentage > 0 && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    Save {Math.round(discountPercentage)}%
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
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
            <div ref={buyBoxRef} className="space-y-6">
              <div className="flex gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl h-14 w-32 shadow-sm">
                  <button onClick={() => changeQty(-1)} className="flex-1 h-full font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-l-xl transition">–</button>
                  <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => changeQty(1)} className="flex-1 h-full font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-r-xl transition">+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={stock === 0}
                  className={`flex-1 h-14 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 ${stock === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-gray-900 text-white hover:bg-black hover:shadow-xl"
                    }`}
                >
                  <FaCartPlus /> {stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleWish}
                  className={`flex-1 h-12 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all text-sm ${wish ? "border-rose-200 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {wish ? <FaHeart /> : <FaRegHeart />} Wishlist
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 h-12 rounded-xl font-bold border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <FaShareAlt /> Share
                </button>
              </div>
            </div>

            {/* FIX: IMPROVED TRUST BADGES
               Horizontal layout, better icons, cleaner look.
            */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 my-6 bg-gray-50/50 rounded-2xl px-4">
              {[
                { icon: <FaTruck />, title: "Free Delivery", sub: "By Wed, 12th" },
                { icon: <FaShieldAlt />, title: "1 Year Warranty", sub: "Brand Assured" },
                { icon: <FaUndoAlt />, title: "7 Day Returns", sub: "No Questions Asked" },
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

            {/* FIX: SMART DESCRIPTION LIST
               Converts plain text to nice bullet points automatically.
            */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                Product Highlights
              </h3>

              <div className="space-y-3">
                {description.split(/(?=[•\-])|\n/).map((line, index) => {
                  const cleanedLine = line.replace(/^[•\-]\s*/, '').trim();
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
              <div className="grid gap-4">
                {reviewsList.length > 0 ? reviewsList.map((r, i) => (
                  <ReviewCard key={i} review={r} />
                )) : (
                  [1, 2, 3].map((_, i) => (
                    <ReviewCard key={i} review={{
                      userId: null,
                      reviewerName: ["Alice M.", "John D.", "Sarah K."][i],
                      rating: [5, 4, 5][i],
                      date: new Date().toISOString(),
                      comment: [
                        "Absolutely love this product! The quality is outstanding for the price.",
                        "Good value, fast delivery. Would recommend.",
                        "Exceeded my expectations. The finish is premium."
                      ][i]
                    }} />
                  ))
                )}
              </div>
              <button className="mt-8 text-gray-900 font-bold hover:underline text-sm w-full text-center">
                View all reviews
              </button>
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
      </div>

      {/* Sticky Mobile Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-40 transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Total</div>
            <div className="text-xl font-black text-gray-900 leading-none">{formatPrice(selling * quantity)}</div>
          </div>
          <button
            onClick={handleAdd}
            disabled={stock === 0}
            className="px-8 h-12 bg-gray-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
          >
            <FaCartPlus /> {stock === 0 ? "No Stock" : "Add"}
          </button>
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
        <div className="flex items-center gap-4">
          <button onClick={handleAdd} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition shadow-md">
            Add to Cart
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