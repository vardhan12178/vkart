import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux"; // Import useDispatch
import { addToCart } from "../redux/cartSlice"; // Import actions
import { showToast } from "../utils/toast"; // Import toast
import axios from "./axiosInstance";
import ProductQuickView from "./product/ProductQuickView"; // Import Modal

import {
  FaStar,
  FaShoppingBag,
  FaArrowRight,
  FaTimes,
  FaBolt,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaEnvelope,
  FaCheckCircle,
  FaExpand // Import Expand icon
} from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ---------- UTILS & STYLES ---------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    .slick-dots li button:before { font-size: 8px; color: #cbd5e1; opacity: 1; }
    .slick-dots li.slick-active button:before { color: #f97316; }
    .slick-track { display: flex; align-items: stretch; }
    .slick-slide { height: auto; display: flex; justify-content: center; }
    .slick-slide > div { width: 100%; padding: 0 8px; }
    /* Mobile Edge-to-Edge Fix */
    @media (max-width: 640px) {
      .slick-slide > div { padding: 0 6px; } 
      .slick-list { padding-left: 0px !important; } /* Ensure start alignment */
    }
  `}</style>
);

/* ---------- SUB-COMPONENTS ---------- */

function ProductCard({ p, onQuickView, onAdd }) {
  const img = p.images?.[0] || p.thumbnail;
  const [src, setSrc] = useState(img);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd(p);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(p);
  };

  return (
    <Link
      to={`/product/${p._id}`}
      className="group relative flex flex-col h-full bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <img
          src={src}
          alt={p.title}
          onError={() => setSrc(p.thumbnail)}
          className="h-full w-full object-contain mix-blend-multiply p-6 transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {p.discountPercentage > 0 && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-gray-100 text-gray-900 text-[10px] font-bold uppercase tracking-wide shadow-sm">
              -{Math.round(p.discountPercentage)}%
            </span>
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className="hidden lg:flex flex-col gap-2 absolute bottom-3 right-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={handleQuickView}
            className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
            title="Quick View"
          >
            <FaExpand size={14} />
          </button>
          <button
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-black transition-colors"
            title="Add to Cart"
          >
            <FaShoppingBag size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{p.category}</div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors mb-2">
          {p.title}
        </h3>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {p.discountPercentage && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium decoration-gray-300">
                {INR(p.price * (1 + p.discountPercentage / 100))}
              </span>
            )}
            <span className="text-base sm:text-lg font-black text-gray-900">{INR(p.price)}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <FaStar /> <span>{p.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[2rem] bg-white p-4 border border-gray-100 h-full">
      <div className="aspect-[4/3] w-full rounded-2xl bg-gray-50 animate-pulse mb-4" />
      <div className="h-4 w-3/4 bg-gray-100 rounded mb-2 animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

/* ---------- MAIN HOME COMPONENT ---------- */
export default function Home() {
  const dispatch = useDispatch();
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  /* Removed dealEndsAt and nowTick state */

  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [profile, setProfile] = useState(null);
  const [hide2faNudge, setHide2faNudge] = useState(false);

  const [quickView, setQuickView] = useState(null);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    showToast("Added to Cart", "success");
    if (quickView) setQuickView(null);
  };

  /* Removed timer interval effect */

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/profile", { withCredentials: true });
        if (!cancelled) setProfile(res.data);
      } catch (e) { if (!cancelled) setProfile(null); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const categoryPromises = ["beauty", "fragrances", "smartphones", "laptops"].map((cat) =>
          axios.get("/api/products", { params: { category: cat, limit: 5 }, signal: ac.signal }).then((res) => res.data)
        );
        const latestPromise = axios.get("/api/products", {
          params: { limit: 12, sort: "-createdAt" },
          signal: ac.signal,
        }).then((res) => res.data);

        const results = await Promise.allSettled([...categoryPromises, latestPromise]);
        const [c1, c2, c3, c4, latestRes] = results.map((r) => r.status === "fulfilled" ? r.value : { products: [] });

        setFeatured([...(c1.products || []), ...(c2.products || []), ...(c3.products || []), ...(c4.products || [])].slice(0, 16));
        setNewArrivals((latestRes.products || []).slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const brands = useMemo(() => {
    const setB = new Set((featured || []).map((p) => p.brand).filter(Boolean));
    return Array.from(setB).slice(0, 12);
  }, [featured]);

  const productSliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    cssEase: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2.2 } },
      // UPDATED MOBILE SETTINGS
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: false,
          infinite: true
        }
      },
    ],
  };

  const show2faNudge = profile && !profile.twoFactorEnabled && !profile.suppress2faPrompt && !hide2faNudge;

  const dismiss2fa = async () => {
    setHide2faNudge(true);
    try { await axios.post("/api/2fa/suppress", null, { withCredentials: true }); } catch (e) { }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setIsSubscribed(true);
    }
  };

  /* Removed time calculation logic */

  return (
    <main className="bg-[#f8f9fa] font-sans text-gray-800 overflow-x-hidden">
      <AnimStyles />

      {/* 2FA NUDGE (Same as before) */}
      <AnimatePresence>
        {show2faNudge && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 w-[90%] max-w-sm bg-white/90 backdrop-blur-2xl border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-5 flex gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <FaShieldAlt size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">Protect your account</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Enable 2-Factor Authentication for bank-grade security.</p>
              <div className="mt-3 flex gap-3">
                <Link to="/profile" className="text-xs font-bold text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-black transition">Enable</Link>
                <button onClick={dismiss2fa} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2">Later</button>
              </div>
            </div>
            <button onClick={dismiss2fa} className="text-gray-400 hover:text-gray-600 self-start -mt-1"><FaTimes /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION (Same as before) */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white pt-20 lg:pt-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-200/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left animate-fade-up">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                New Collection 2025
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[1] mb-6"
              >
                The Future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">is Here.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-medium"
              >
                Discover curated gadgets, premium fashion, and lifestyle essentials designed for the modern world.
              </motion.p>

              <div className="lg:hidden mb-10 relative">
                <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full scale-75" />
                <img src="hero11.webp" alt="Hero" className="relative z-10 w-full max-w-sm mx-auto drop-shadow-2xl" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 mb-12 lg:mb-0"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg shadow-2xl shadow-gray-900/30 hover:bg-black hover:scale-105 transition-all"
                >
                  Start Shopping <FaArrowRight size={14} />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                >
                  Explore Brands
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="hidden lg:flex relative w-full h-full items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-transparent rounded-full blur-3xl opacity-60 animate-pulse" />
              <img
                src="hero11.webp"
                alt="Premium Shopping"
                className="relative z-10 w-full max-w-lg object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BRANDS MARQUEE */}
      {brands.length > 0 && (
        <div className="py-10 border-y border-gray-100 bg-white overflow-hidden">
          <div className="flex gap-16 whitespace-nowrap animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] items-center">
            {[...brands, ...brands, ...brands].map((b, i) => (
              <span key={i} className="text-2xl font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 transition-colors cursor-default select-none">
                {b}
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>
      )}

      {/* --- FEATURED CAROUSEL (FIXED ALIGNMENT) --- */}
      <section className="py-16 sm:py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Alignment Fix: 
                - items-start on mobile (left align)
                - sm:items-end on desktop (standard alignment)
            */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-orange-600 font-bold uppercase tracking-widest text-xs mb-2 block">Weekly Picks</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Trending Now</h2>
            </div>
            <Link to="/products" className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              View Collection <span className="group-hover:translate-x-1 transition-transform"><FaArrowRight /></span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            /* Slider Wrapper Fix: 
               -mx-4 ensures the slider touches the edges on mobile
               sm:mx-0 brings it back to container width on desktop
            */
            <div className="-mx-4 sm:mx-0">
              <Slider {...productSliderSettings} className="pb-12">
                {featured.map(p => (
                  <div key={p._id} className="px-3 h-full">
                    <ProductCard p={p} onQuickView={setQuickView} onAdd={handleAddToCart} />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </section>

      {/* FLASH SALE (Same) */}
      {/* COLLECTION SHOWCASE */}
      <section className="py-20 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-white text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md">
                <FaStar className="text-yellow-400" /> Premium Catalog
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                Curated <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">Perfection.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto lg:mx-0">
                Browse our complete collection of high-performance gadgets and lifestyle essentials. No clutter, just quality.
              </p>

              <Link to="/products" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105">
                View All Products <FaArrowRight />
              </Link>
            </div>

            <div className="relative w-full max-w-md mx-auto lg:mr-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-orange-500/20 text-orange-400 mb-6">
                    <FaShoppingBag size={32} />
                  </div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Shop The Best</div>
                  <div className="text-5xl font-black text-white tracking-tighter mb-2">100<span className="text-3xl text-orange-500">%</span></div>
                  <div className="text-xl font-bold text-white mb-8">QUALITY GUARANTEE</div>
                  <div className="h-px w-full bg-white/10 mb-8" />
                  <div className="flex justify-center gap-4 text-sm font-medium text-gray-400">
                    <span>Free Shipping</span>
                    <span>•</span>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">Just Dropped</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3 tracking-tight">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />) : newArrivals.map(p => <ProductCard key={p._id} p={p} onQuickView={setQuickView} onAdd={handleAddToCart} />)}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">The VKart Experience</h2>
            <p className="text-gray-500 mt-4 text-lg">Built for speed, security, and scalability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 md:col-span-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-6">
                <FaShieldAlt />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-500 leading-relaxed">
                Secured by <strong>Razorpay</strong> (Test Mode). We use JWT authentication and industry-standard encryption for data protection.
              </p>
            </div>

            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-orange-400 text-2xl mb-6 backdrop-blur-sm">
                  <FaBolt />
                </div>
                <h3 className="text-2xl font-bold mb-3">Blazing Fast</h3>
                <p className="text-gray-400 leading-relaxed">
                  Powered by <strong>Node.js</strong> & <strong>Redis</strong> caching. Images served via <strong>AWS S3</strong> for lightning performance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 text-2xl mb-6">
                <FaTruck />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Express Delivery</h3>
              <p className="text-gray-500 leading-relaxed">
                Order tracking and fast dispatch on all eligible items.
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 md:col-span-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 text-2xl mb-6">
                <FaHeadset />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-500 leading-relaxed">
                Our AI Assistant uses <strong>MongoDB Vector Search</strong> & <strong>RAG</strong> to provide smart, context-aware help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto bg-gray-900 rounded-[3rem] px-6 py-20 sm:px-20 text-center overflow-hidden shadow-2xl shadow-gray-900/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black" />

            <div className="relative z-10">
              {!isSubscribed ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="inline-flex p-4 rounded-full bg-white/5 mb-8 border border-white/10 backdrop-blur-sm">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">Unlock Exclusive Access</h2>
                  <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                    Get exclusive access to new drops, secret sales, and tech news directly to your inbox.
                  </p>

                  <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubscribe}>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-md transition-all"
                    />
                    <button className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105">
                      Subscribe
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                  <div className="inline-flex p-6 rounded-full bg-green-500/20 mb-6 text-green-400 border border-green-500/30">
                    <FaCheckCircle size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome to the Club!</h2>
                  <p className="text-gray-400">You've successfully joined the inner circle. Keep an eye on your inbox.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {quickView && (
        <ProductQuickView
          product={quickView}
          onClose={() => setQuickView(null)}
          onAdd={handleAddToCart}
        />
      )}

    </main>
  );
}