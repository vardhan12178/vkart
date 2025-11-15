import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { motion } from "framer-motion";
import axios from "./axiosInstance";

import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaArrowRight,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const categories = [
  { label: "Beauty", slug: "beauty" },
  { label: "Fragrances", slug: "fragrances" },
  { label: "Smartphones", slug: "smartphones" },
  { label: "Laptops", slug: "laptops" },
  { label: "Groceries", slug: "groceries" },
  { label: "Home Decor", slug: "home-decoration" },
];

function StarRow({ rating }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f${i}`} className="text-amber-500" />
      ))}
      {half ? <FaStarHalfAlt className="text-amber-500" /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e${i}`} className="text-gray-300" />
      ))}
    </div>
  );
}

function ProductCard({ p }) {
  const img = p.images?.[0] || p.thumbnail;
  const [src, setSrc] = useState(img);
  return (
    <Link
      to={`/product/${p._id}`}
      className="group relative block rounded-3xl bg-white p-4 ring-1 ring-gray-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white  bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-amber-50 to-white">
        <picture>
          <source srcSet={src} type="image/webp" />
          <img
            src={src}
            alt={p.title}
            width={480}
            height={480}
            className="h-full w-full object-contain transition duration-300 will-change-transform group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setSrc(p.thumbnail)}
          />
        </picture>
        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-800 ring-1 ring-gray-200">
          {p.brand || p.category}
        </span>
      </div>
      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900" itemProp="name">
          {p.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span
            className="text-orange-600 font-bold"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="priceCurrency" content="INR" className="sr-only" />
            <span itemProp="price">{INR(p.price * 83)}</span>
          </span>
          <StarRow rating={p.rating} />
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-gray-100">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#f3f4f6,45%,#ffffff,55%,#f3f4f6)] bg-[length:200%_100%]" />
      </div>
      <div className="mt-3 h-4 w-3/4 rounded bg-gray-100" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
    </div>
  );
}

function TrustCard({ icon, title, text }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-orange-200">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-28 bg-gradient-to-b from-orange-50/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl text-white bg-gradient-to-tr from-orange-600 to-amber-400 shadow-lg ring-4 ring-orange-100">
          {icon}
        </div>
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-600">{text}</p>
        <span className="mt-4 block h-px w-12 mx-auto bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </article>
  );
}

function TestimonialCard({ t }) {
  return (
    <article className="relative h-full rounded-3xl bg-white p-6 ring-1 ring-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:ring-orange-200">
      <div className="pointer-events-none absolute -top-3 left-6 text-5xl font-serif text-orange-200 select-none leading-none">“</div>
      <p className="relative mt-4 text-gray-700 leading-relaxed">{t.text}</p>
      <div className="mt-6 flex items-center gap-3">
        <span className="relative inline-grid h-11 w-11 place-items-center">
          <img
            src={t.image}
            alt={t.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white" />
          <span className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-300/30 to-amber-200/30 blur-md" />
        </span>
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold text-gray-900">
            {t.name}
            <FaCheckCircle className="text-emerald-500" />
          </p>
          <p className="text-xs text-gray-500">{t.role}</p>
        </div>
      </div>
    </article>
  );
}

function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail("");
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-gray-200 p-8">

        {/* SUCCESS STATE */}
        {success ? (
          <div className="flex flex-col items-center text-center py-10 animate-[fadeIn_.35s_ease]">
            <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 text-white shadow ring-4 ring-orange-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              You're Subscribed!
            </h3>

            <p className="mt-2 text-gray-600 max-w-md">
              Thank you for joining VKart. You'll now receive updates about new drops, deals, and exclusive offers.
            </p>

            <button
              onClick={() => setSuccess(false)}
              className="mt-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition"
            >
              Back
            </button>
          </div>
        ) : (
          /* DEFAULT NEWSLETTER FORM */
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 text-white shadow ring-4 ring-orange-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l4-4m-4 4l4 4" />
              </svg>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              Join Our Newsletter
            </h3>

            <p className="mt-2 text-gray-600">
              Get the latest drops, deals, and insider tips — straight to your inbox.
            </p>

            <form onSubmit={subscribe} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </form>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-gray-300" />
              <span>I agree to receive emails and accept the Privacy Policy.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealEndsAt] = useState(() => Date.now() + 1000 * 60 * 60 * 18);
  const [nowTick, setNowTick] = useState(Date.now());
  // 2FA nudge
const [profile, setProfile] = useState(null);
const [hide2faNudge, setHide2faNudge] = useState(false);


  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
  (async () => {
    try {
      const res = await axios.get("/api/profile", { withCredentials: true });
      setProfile(res.data);
    } catch (e) {}
  })();
}, []);

 useEffect(() => {
  const ac = new AbortController();

  (async () => {
    try {
      setLoading(true);

      // Fetch categories in parallel from VKart API
      const categoryPromises = ["beauty", "fragrances", "smartphones", "laptops"].map((cat) =>
        axios
          .get("/api/products", {
            params: { category: cat, limit: 5 },
            signal: ac.signal,
          })
          .then((res) => res.data)
      );

      // Fetch latest products (sorted by createdAt DESC)
      const latestPromise = axios
        .get("/api/products", {
          params: {
            limit: 12,
            sort: "-createdAt",
          },
          signal: ac.signal,
        })
        .then((res) => res.data);

      const results = await Promise.allSettled([...categoryPromises, latestPromise]);

      const [c1, c2, c3, c4, latestRes] = results.map((r) =>
        r.status === "fulfilled" ? r.value : { products: [] }
      );

      // Featured products (first 16 from 4 categories)
      const featuredList = [
        ...(c1.products || []),
        ...(c2.products || []),
        ...(c3.products || []),
        ...(c4.products || []),
      ].slice(0, 16);

      setFeatured(featuredList);

      // Latest products (first 8 from latest fetch)
      const latestList = (latestRes.products || []).slice(0, 8);

      setNewArrivals(latestList);
    } catch (err) {
      console.error(err);
      setFeatured([]);
      setNewArrivals([]);
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

  const productSlider = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 450,
      slidesToShow: 4,
      slidesToScroll: 4,
      arrows: true,
      responsive: [
        { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 3 } },
        { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
        { breakpoint: 520, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      ],
    }),
    []
  );

  const show2faNudge =
  profile &&
  !profile.twoFactorEnabled &&
  !profile.suppress2faPrompt &&
  !hide2faNudge;

const dismiss2fa = async () => {
  setHide2faNudge(true);
  try {
    await axios.post("/api/2fa/suppress", null, { withCredentials: true });
  } catch (e) {
    // ignore
  }
};

  const timeLeft = Math.max(0, Math.floor((dealEndsAt - nowTick) / 1000));
  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <>
    {show2faNudge && (
  <div className="fixed bottom-4 right-4 z-50 w-[min(100%-1.5rem,360px)] rounded-2xl bg-white/95 backdrop-blur border border-orange-100 shadow-2xl p-4 flex gap-3 items-start animate-[fadeIn_.2s_ease]">
    <div className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600">
      <FaShieldAlt className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900">Secure your account</p>
      <p className="mt-1 text-xs text-gray-500">
        Enable two-factor authentication to protect your VKart account.
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-105"
        >
          Enable 2FA
        </Link>
        <button
          type="button"
          onClick={dismiss2fa}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Not now
        </button>
      </div>
    </div>
    <button
      onClick={dismiss2fa}
      className="ml-1 text-gray-300 hover:text-gray-500"
      aria-label="Dismiss"
    >
      <FaTimes className="h-4 w-4" />
    </button>
  </div>
)}

      <section className="relative overflow-hidden  bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-amber-50 to-white">
        <div className="hidden md:block pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200 blur-3xl opacity-50" />
        <div className="hidden md:block pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-100 blur-3xl opacity-60" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-8 md:pt-6 md:pb-20">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10">
            <div className="max-w-2xl order-2 md:order-1">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[32px] leading-[1.15] sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900"
              >
                Discover Top Picks at{" "}
                <span className="bg-gradient-to-r from-orange-600 to-amber-400 bg-clip-text text-transparent">
                  VKart
                </span>
              </motion.h1>
              <p className="mt-3 text-[15px] md:text-lg text-gray-700">
                From electronics to fashion—curated deals, fast delivery, and a seamless experience.
              </p>
              <img
                src="hero11.webp"
                alt="Shopping"
                className="mt-5 block md:hidden w-full max-h-64 object-contain mx-auto"
                loading="eager"
                fetchpriority="high"
                sizes="(max-width: 768px) 100vw, 70vw"
              />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3 text-white text-sm md:text-base font-semibold shadow-sm transition hover:brightness-110"
                >
                  Shop Collection <FaArrowRight />
                </Link>
                <a
                  href="#featured"
                  className="inline-flex items-center rounded-2xl px-5 py-3 ring-1 ring-gray-300 text-sm md:text-base hover:bg-gray-50"
                >
                  Explore Featured
                </a>
                <p className="w-full text-xs text-gray-500">Free shipping over ₹3,999 · Secure payments</p>
              </div>
              <div className="mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/products?cat=${encodeURIComponent(c.slug)}`}
                    className="whitespace-nowrap rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100"
                  >
                    {c.label}
                  </Link>
                ))}
                <style>{`div::-webkit-scrollbar{display:none}`}</style>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative md:mx-auto w-full md:max-w-lg order-1 md:order-2"
            >
              <img
                src="hero11.webp"
                alt="Shopping"
                width={800}
                height={800}
                className="hidden md:block w-full h-auto rounded-2xl object-cover"
                loading="eager"
                fetchpriority="high"
                sizes="50vw"
              />
              <div className="hidden md:block absolute -bottom-4 -right-4 rounded-2xl bg-white p-3 shadow ring-1 ring-gray-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 text-orange-700">
                    <FaTruck />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">3-day Delivery</p>
                    <p className="text-xs text-gray-500">Across major cities</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="bg-white border-y border-gray-100">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div className="relative overflow-hidden group">
              <div className="flex gap-8 whitespace-nowrap motion-safe:animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused]">
                {[...brands, ...brands].map((b, i) => (
                  <span
                    key={`${b}-${i}`}
                    className="flex items-center text-gray-600 text-sm md:text-base font-medium tracking-wide hover:text-orange-600 transition-colors"
                  >
                    {b}
                    <span className="mx-4 h-4 w-px bg-gray-300/50" />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){.motion-safe\\:animate-[marquee_20s_linear_infinite]{animation:none!important}}`}</style>
        </section>
      )}

      <section id="featured" className="bg-white py-12 md:py-16 ">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-orange-600 hover:underline text-sm">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="relative">
              <Slider {...productSlider} className="premium-products">
                {featured.map((p) => (
                <div key={p._id} className="px-2">
                  <ProductCard p={p} />
                </div>
              ))}

              </Slider>
            </div>
          )}
        </div>
        <style>{`
          .premium-products { overflow: visible; }
          .premium-products .slick-list { overflow: visible; }
          .premium-products .slick-prev,
          .premium-products .slick-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            background: #fff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 10px rgba(0,0,0,.06);
            z-index: 5;
          }
          .premium-products .slick-prev { left: -0.75rem; }
          .premium-products .slick-next { right: -0.75rem; }
          @media (min-width:768px){
            .premium-products .slick-prev { left: -1.25rem; }
            .premium-products .slick-next { right: -1.25rem; }
          }
          @media (min-width:1024px){
            .premium-products .slick-prev { left: -1.5rem; }
            .premium-products .slick-next { right: -1.5rem; }
          }
          .premium-products .slick-prev:before,
          .premium-products .slick-next:before{
            color:#64748b;
            font-size:18px;
            line-height:36px;
            opacity:1;
          }
          .premium-products .slick-prev:hover:before,
          .premium-products .slick-next:hover:before{ color:#fb923c; }
        `}</style>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-orange-100 to-orange-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-14">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
            <div className="order-last text-center md:order-none md:text-left">
              <h3 className="text-2xl leading-tight sm:text-3xl md:text-4xl font-extrabold text-gray-900">
                Limited Time Offer — Up to 50% OFF
              </h3>
              <p className="mt-2 text-gray-700 text-base md:text-lg">Don’t wait — popular items are selling out fast.</p>
              <div className="mt-4 md:mt-5 flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2 text-gray-900" aria-live="polite">
                <span className="rounded-lg bg-white px-2.5 py-1.5 text-base md:text-lg font-bold tabular-nums">{hours}</span>
                <span className="px-1 md:px-1.5">:</span>
                <span className="rounded-lg bg-white px-2.5 py-1.5 text-base md:text-lg font-bold tabular-nums">{minutes}</span>
                <span className="px-1 md:px-1.5">:</span>
                <span className="rounded-lg bg-white px-2.5 py-1.5 text-base md:text-lg font-bold tabular-nums">{seconds}</span>
              </div>
              <Link
                to="/products"
                className="mt-5 md:mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-white font-semibold shadow hover:opacity-95"
              >
                Shop Now <FaArrowRight />
              </Link>
            </div>
            <div className="order-first md:order-none">
              <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-none">
                <img
                  src="hero3.webp"
                  alt="Sale 50% banner"
                  width={900}
                  height={600}
                  className="w-full rounded-2xl shadow-lg object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {newArrivals.map((p) => (
              <ProductCard p={p} key={p._id} />
            ))}

            </div>
          )}
        </div>
      </section>

      <section className="relative bg-gray-50 py-14">
        <div className="pointer-events-none absolute -top-24 left-6 h-44 w-44 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-6 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <TrustCard icon={<FaTruck className="text-xl" />} title="Free Shipping" text="On orders over ₹3,999" />
            <TrustCard icon={<FaShieldAlt className="text-xl" />} title="Secure Payments" text="UPI • Cards • Netbanking" />
            <TrustCard icon={<FaHeadset className="text-xl" />} title="24/7 Support" text="We’re here to help" />
          </div>
        </div>
      </section>

      <section className="relative bg-white py-16">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Slider
            dots
            arrows
            infinite
            speed={500}
            slidesToShow={2}
            slidesToScroll={2}
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            ]}
            className="testimonial-slider"
          >
            {[
              {
                text: "Amazing experience! Quality exceeded expectations.",
                name: "Alice Johnson",
                role: "Verified Buyer",
                image: "https://randomuser.me/api/portraits/women/1.jpg",
              },
              {
                text: "Great selection and super fast delivery.",
                name: "Michael Smith",
                role: "Verified Buyer",
                image: "https://randomuser.me/api/portraits/men/2.jpg",
              },
              {
                text: "Site is so easy to use. Love the variety.",
                name: "Sarah Lee",
                role: "Verified Buyer",
                image: "https://randomuser.me/api/portraits/women/2.jpg",
              },
              {
                text: "Prices are solid and support is helpful.",
                name: "Vikram Rao",
                role: "Verified Buyer",
                image: "https://randomuser.me/api/portraits/men/3.jpg",
              },
            ].map((t, i) => (
              <div key={i} className="px-3">
                <TestimonialCard t={t} />
              </div>
            ))}
          </Slider>
        </div>
        <style>{`
          .testimonial-slider { overflow: visible; }
          .testimonial-slider .slick-list { overflow: visible; }
          .testimonial-slider .slick-dots li button:before{font-size:10px;color:#cbd5e1;opacity:1}
          .testimonial-slider .slick-dots li.slick-active button:before{color:#fb923c}
          .testimonial-slider .slick-prev,
          .testimonial-slider .slick-next{
            position:absolute;
            top:50%;
            transform:translateY(-50%);
            width:36px;height:36px;border-radius:9999px;background:#fff;border:1px solid #e5e7eb;
            box-shadow:0 4px 10px rgba(0,0,0,.06); z-index:5;
          }
          .testimonial-slider .slick-prev{left:-0.75rem}
          .testimonial-slider .slick-next{right:-0.75rem}
          @media (min-width:768px){
            .testimonial-slider .slick-prev{left:-1.25rem}
            .testimonial-slider .slick-next{right:-1.25rem}
          }
          @media (min-width:1024px){
            .testimonial-slider .slick-prev{left:-1.5rem}
            .testimonial-slider .slick-next{right:-1.5rem}
          }
          .testimonial-slider .slick-prev:before,
          .testimonial-slider .slick-next:before{color:#64748b;font-size:18px;line-height:36px;opacity:1}
          .testimonial-slider .slick-prev:hover:before,
          .testimonial-slider .slick-next:hover:before{color:#fb923c}
        `}</style>
      </section>

      <section className="relative bg-gray-50 py-16">
      <div className="pointer-events-none absolute -top-24 left-10 h-52 w-52 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-10 h-60 w-60 rounded-full bg-orange-100/80 blur-3xl" />

      <NewsletterBox />
    </section>

    </>
  );
}
