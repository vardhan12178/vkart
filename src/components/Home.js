import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Crown,
  Eye,
  Headphones,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { addToCart } from "../redux/cartSlice";
import { showToast } from "../utils/toast";
import axios from "./axiosInstance";
import ProductQuickView from "./product/ProductQuickView";
import { qk } from "../query/queryKeys";

const INR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const categories = [
  {
    number: "01",
    eyebrow: "Pocket technology",
    name: "Smartphones",
    image: "/assets/categories/editorial-smartphones-v2.webp",
    to: "/products?cat=smartphones",
  },
  {
    number: "02",
    eyebrow: "Tools for focus",
    name: "Laptops",
    image: "/assets/categories/editorial-laptops-v2.webp",
    to: "/products?cat=laptops",
  },
  {
    number: "03",
    eyebrow: "Considered details",
    name: "Watches",
    image: "/assets/categories/editorial-watches-v2.webp",
    to: "/products?cat=mens-watches",
  },
  {
    number: "04",
    eyebrow: "Everyday rituals",
    name: "Fragrances",
    image: "/assets/categories/editorial-fragrances-v2.webp",
    to: "/products?cat=fragrances",
  },
];

const trustItems = [
  { icon: Truck, title: "Fast delivery", copy: "Free over ₹499" },
  { icon: RefreshCw, title: "Easy returns", copy: "7-day window" },
  { icon: ShieldCheck, title: "Secure checkout", copy: "Protected payments" },
  { icon: Headphones, title: "Always supported", copy: "Help when you need it" },
];

function ProductCard({ product, onQuickView, onAdd }) {
  const image = product.images?.[0] || product.thumbnail;
  const [src, setSrc] = useState(image);
  const hasDiscount = Number(product.discountPercentage) > 0;
  const previousPrice = hasDiscount
    ? product.price * (1 + product.discountPercentage / 100)
    : null;

  return (
    <article className="group relative min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#f1eee7] border border-black/[0.05]">
          <img
            src={src}
            alt={product.title}
            onError={() => setSrc(product.thumbnail)}
            className="h-full w-full object-contain p-7 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            decoding="async"
          />

          {(hasDiscount || product.onSale) && (
            <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
              {product.onSale && (
                <span className="rounded-full bg-[#1d1c19] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  {product.saleName || "Limited offer"}
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1d1c19] backdrop-blur">
                  {Math.round(product.discountPercentage)}% off
                </span>
              )}
            </div>
          )}

          <Link
            to={`/product/${product._id}`}
            className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b66a3c]"
            aria-label={`View ${product.title}`}
          />

          <div className="absolute inset-x-4 bottom-4 z-20 flex translate-y-3 items-center justify-end gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onQuickView(product);
              }}
              className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-[#1d1c19] shadow-lg transition-colors hover:bg-[#f6f3ed] focus:outline-none focus:ring-2 focus:ring-[#b66a3c] focus:ring-offset-2"
              aria-label={`Quick view ${product.title}`}
            >
              <Eye size={17} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onAdd(product);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1d1c19] px-5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#b66a3c] focus:ring-offset-2"
              aria-label={`Add ${product.title} to cart`}
            >
              <ShoppingBag size={15} /> Add
            </button>
          </div>
      </div>

      <Link to={`/product/${product._id}`} className="block px-1 pt-5" aria-label={`View ${product.title} details`}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c887e]">
              {product.category}
            </span>
            {product.rating && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#706c63]">
                <Star size={12} className="fill-[#b66a3c] text-[#b66a3c]" /> {product.rating}
              </span>
            )}
          </div>
          <h3 className="line-clamp-1 text-base font-semibold tracking-[-0.02em] text-[#1d1c19] transition-colors group-hover:text-[#9b5330]">
            {product.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-[#1d1c19]">{INR(product.price)}</span>
            {previousPrice && (
              <span className="text-xs font-medium text-[#9b978d] line-through">{INR(previousPrice)}</span>
            )}
          </div>
      </Link>

      <button
        type="button"
        onClick={() => onAdd(product)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-xs font-bold text-[#1d1c19] md:hidden"
      >
        <ShoppingBag size={15} /> Add to bag
      </button>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-[1.5rem] bg-[#ebe7de]" />
      <div className="mt-5 h-3 w-1/3 rounded-full bg-[#e4dfd5]" />
      <div className="mt-3 h-5 w-3/4 rounded-full bg-[#e4dfd5]" />
      <div className="mt-3 h-4 w-1/4 rounded-full bg-[#e4dfd5]" />
    </div>
  );
}

function SectionHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#a45a34]">{eyebrow}</p>
        <h2 className="font-editorial text-4xl leading-[0.98] tracking-[-0.035em] text-[#1d1c19] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {copy && <p className="mt-5 max-w-xl text-base leading-7 text-[#6f6b62]">{copy}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [hide2faNudge, setHide2faNudge] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const { data: homeData, isLoading: loading } = useQuery({
    queryKey: qk.home.landing,
    queryFn: async () => {
      const response = await axios.get("/api/home");
      return response.data;
    },
  });

  const featured = useMemo(() => homeData?.featured ?? [], [homeData]);
  const newArrivals = useMemo(() => homeData?.newArrivals ?? [], [homeData]);
  const activeSale = homeData?.activeSale || null;

  const dismiss2faMutation = useMutation({
    mutationFn: async () =>
      axios.post("/api/2fa/suppress", {}, { withCredentials: true, __skipAuthRedirect: true }),
    onSuccess: () => {
      queryClient.setQueryData(qk.profile.root, (previous) =>
        previous ? { ...previous, suppress2faPrompt: true } : previous
      );
    },
  });

  const show2faNudge =
    profile && !profile.twoFactorEnabled && !profile.suppress2faPrompt && !hide2faNudge;

  const dismiss2fa = async () => {
    setHide2faNudge(true);
    const shouldPersistDismiss =
      process.env.NODE_ENV === "production" ||
      process.env.REACT_APP_PERSIST_2FA_NUDGE === "true";
    if (!shouldPersistDismiss || !profile?._id) return;
    try {
      await dismiss2faMutation.mutateAsync();
    } catch {
      // This is intentionally non-blocking; the nudge remains dismissed locally.
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    showToast("Added to your bag", "success");
    if (quickView) setQuickView(null);
  };

  const maxSaleDiscount = activeSale
    ? Math.max(
        0,
        ...(activeSale.categories || []).map((category) => category.discountPercent || 0)
      )
    : 0;

  return (
    <main className="overflow-hidden bg-[#f6f3ed] text-[#1d1c19] selection:bg-[#1d1c19] selection:text-white">
      <style>{`
        .font-editorial { font-family: "DM Serif Display", Georgia, serif; }
        .home-section-title { color: #1d1c19 !important; }
        .editorial-grain::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <AnimatePresence>
        {show2faNudge && (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex gap-3 rounded-[1.15rem] border border-black/10 bg-[#fffdf8]/95 p-4 shadow-[0_20px_55px_rgba(29,28,25,.18)] backdrop-blur-xl sm:left-6 sm:right-auto sm:w-[min(26rem,calc(100vw-3rem))] sm:gap-4 sm:p-5"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1d1c19] text-white sm:h-11 sm:w-11">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="pr-5 text-sm font-bold leading-5 text-[#1d1c19]">Protect your account</h3>
              <p className="mt-1 text-xs leading-5 text-[#706c63]">Enable two-factor authentication for a safer account.</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link to="/profile" className="text-xs font-bold text-[#925033] underline decoration-[#925033]/30 underline-offset-4">Enable 2FA</Link>
                <button type="button" onClick={dismiss2fa} className="text-xs font-semibold text-[#858177]">Maybe later</button>
              </div>
            </div>
            <button type="button" onClick={dismiss2fa} aria-label="Dismiss security suggestion" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-[#858177] transition-colors hover:bg-black/[0.05] hover:text-black">
              <X size={17} />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      <section className="px-3 pb-4 pt-0 sm:px-5 lg:px-7 lg:pb-5">
        {/* Mobile and tablet hero: the copy and photography get their own space. */}
        <div className="mx-auto overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-[#eee8dd] shadow-[0_18px_55px_rgba(29,28,25,.08)] lg:hidden">
          <div className="px-6 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-9 md:px-12 md:py-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.23em] text-[#5e594f] sm:text-[10px]"
            >
              <span className="h-px w-7 bg-[#9b5330]" /> The VKart edit · 2026
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ delay: 0.07, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-[19rem] font-editorial text-[2.9rem] leading-[0.9] tracking-[-0.05em] text-[#1d1c19] min-[420px]:text-[3.25rem] sm:max-w-lg sm:text-[4.25rem]"
            >
              Better things,
              <span className="block italic text-[#9b5330]">beautifully chosen.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ delay: 0.14, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-md text-sm font-medium leading-6 text-[#625e55] sm:text-base sm:leading-7"
            >
              A considered edit of technology, style, and everyday essentials—only the pieces worth bringing home.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ delay: 0.22, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-center"
            >
              <Link
                to="/products"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#1d1c19] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(29,28,25,.18)] transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#9b5330] focus:ring-offset-4 focus:ring-offset-[#eee8dd]"
              >
                Shop the collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products?sort=newest"
                className="group inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-[#1d1c19] min-[430px]:justify-start"
              >
                See what’s new <ArrowUpRight size={15} />
              </Link>
            </motion.div>
          </div>

          <div className="relative h-[18rem] overflow-hidden border-t border-black/[0.06] sm:h-[25rem] md:h-[31rem]">
            <img
              src="/vkart-editorial-hero.png"
              alt="A curated arrangement of headphones, a watch, fragrance, sunglasses, and a leather accessory"
              className="h-full w-full object-cover object-[72%_center] sm:object-[68%_center]"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />
            <div className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-black/40 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:bottom-6 sm:left-6">
              Tech · Style · Life
            </div>
          </div>
        </div>

        {/* Desktop hero keeps the wide editorial composition. */}
        <div className="editorial-grain relative mx-auto hidden min-h-[calc(100vh-8rem)] max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-[#e8e0d4] lg:block">
          <img
            src="/vkart-editorial-hero.png"
            alt="A curated arrangement of headphones, a watch, fragrance, sunglasses, and a leather accessory"
            className="absolute inset-0 h-full w-full object-cover object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0eadf]/95 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-between px-14 py-14">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#555148]"
            >
              <span className="h-px w-8 bg-[#8e5c3f]" /> The VKart edit · 2026
            </motion.div>

            <div className="max-w-[690px] pb-10 pt-20">
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={reveal}
                transition={{ delay: 0.08, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="font-editorial text-[7.25rem] leading-[0.86] tracking-[-0.055em] text-[#1d1c19]"
              >
                Better things,
                <span className="block italic text-[#9b5330]">beautifully chosen.</span>
              </motion.h1>
              <motion.p
                initial="hidden"
                animate="visible"
                variants={reveal}
                transition={{ delay: 0.18, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 max-w-lg text-lg font-medium leading-8 text-[#5f5b52]"
              >
                Technology, style, and everyday essentials—edited down to the pieces worth bringing home.
              </motion.p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={reveal}
                transition={{ delay: 0.28, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="mt-9 flex items-center gap-5"
              >
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#1d1c19] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(29,28,25,.2)] transition-all hover:-translate-y-0.5 hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#9b5330] focus:ring-offset-4 focus:ring-offset-[#eee7db]"
                >
                  Shop the collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/products?sort=newest"
                  className="group inline-flex items-center gap-2 border-b border-[#1d1c19]/30 pb-1 text-sm font-bold text-[#1d1c19] transition-colors hover:border-[#1d1c19]"
                >
                  See what’s new <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            <div className="flex max-w-xl flex-wrap items-center gap-x-6 gap-y-3 border-t border-black/15 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5f5b52]">
              <span className="flex items-center gap-2"><Check size={13} /> Curated weekly</span>
              <span className="flex items-center gap-2"><Check size={13} /> Secure checkout</span>
              <span className="flex items-center gap-2"><Check size={13} /> Easy returns</span>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 hidden border-r border-black/20 pr-5 text-right lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6d675d]">The everyday edit</p>
            <p className="mt-2 font-editorial text-2xl text-[#1d1c19]">Tech · Style · Life</p>
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.08] bg-[#f6f3ed]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-black/[0.08] px-4 lg:grid-cols-4 lg:divide-y-0">
          {trustItems.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-7 sm:px-7">
              <Icon size={19} strokeWidth={1.6} className="shrink-0 text-[#9b5330]" />
              <div>
                <p className="text-xs font-bold text-[#292722]">{title}</p>
                <p className="mt-0.5 text-[11px] text-[#817c72]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-7 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 grid gap-6 border-b border-black/[0.1] pb-8 sm:mb-11 sm:pb-10 lg:grid-cols-[.9fr_1fr] lg:items-end lg:gap-16">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a45a34]">
                Shop the edit
              </p>
              <h2 className="home-section-title max-w-2xl font-editorial text-4xl leading-[0.98] tracking-[-0.035em] sm:text-5xl">
                Four ways into the collection.
              </h2>
            </div>
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
              <p className="max-w-lg text-sm leading-6 text-[#6f6b62] sm:text-[15px] sm:leading-7">
                Technology, timepieces, and everyday rituals—brought together with one quieter point of view.
              </p>
              <Link
                to="/products"
                className="group inline-flex shrink-0 items-center gap-2 border-b border-black/20 pb-1 text-xs font-bold text-[#1d1c19] transition-colors hover:border-black/60"
              >
                View everything
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={category.to}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-black/[0.08] bg-[#ebe4da] transition duration-300 hover:-translate-y-1 hover:border-black/[0.14] hover:shadow-[0_20px_50px_rgba(30,27,22,0.09)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e5ded3]">
                    <img
                      src={category.image}
                      alt={`${category.name} collection`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                    <span className="absolute left-4 top-4 rounded-full border border-black/[0.08] bg-[#f7f3ec]/90 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] text-[#696258] backdrop-blur-sm">
                      {category.number}
                    </span>
                  </div>
                  <div className="flex min-h-[7.5rem] items-center justify-between gap-4 p-5 sm:p-6">
                    <div>
                      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a7667]">{category.eyebrow}</p>
                      <h3 className="font-editorial text-2xl tracking-[-0.03em] text-[#1d1c19] sm:text-[1.7rem]">{category.name}</h3>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/[0.12] bg-[#f6f3ed] text-[#1d1c19] transition-all group-hover:border-[#1d1c19] group-hover:bg-[#1d1c19] group-hover:text-white">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {activeSale && (
        <section className="px-4 pb-20 sm:px-7 sm:pb-32">
          <Link
            to="/products?sale=true"
            className="group relative mx-auto grid max-w-7xl overflow-hidden rounded-[1.25rem] border border-black/[0.09] bg-[#eee7dd] text-[#1d1c19] shadow-[0_18px_60px_rgba(29,28,25,.06)] sm:rounded-[1.5rem] lg:grid-cols-[1fr_19rem]"
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-[#a85d37] sm:w-1.5" />
            <div className="relative px-6 py-7 sm:flex sm:items-start sm:gap-5 sm:px-11 sm:py-10">
              <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-black/[0.08] bg-[#fffdf8] text-[#a85d37] sm:static sm:h-11 sm:w-11 sm:shrink-0"><Zap size={16} strokeWidth={1.8} /></span>
              <div className="pr-12 sm:pr-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a604b] sm:text-[10px] sm:tracking-[0.24em]">
                  <span className="sm:hidden">Limited-time offer</span>
                  <span className="hidden sm:inline">The member edit · Limited time</span>
                </p>
                <h2 className="mt-2 max-w-[13rem] font-editorial text-[2.35rem] leading-[0.94] tracking-[-0.035em] sm:mt-3 sm:max-w-none sm:text-[2.8rem]">{activeSale.name}</h2>
                <p className="mt-4 text-[13px] leading-5 text-[#716b62] sm:text-sm">
                  <span className="sm:hidden">Ends {new Date(activeSale.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</span>
                  <span className="hidden sm:inline">Selected pieces, considered prices · Ends {new Date(activeSale.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</span>
                </p>
              </div>
            </div>
            <div className="relative grid grid-cols-[1fr_auto] items-center gap-3 border-t border-black/[0.09] px-6 py-5 sm:flex sm:justify-between sm:gap-6 sm:px-7 sm:py-6 lg:flex-col lg:items-start lg:justify-center lg:border-l lg:border-t-0 lg:px-9">
              <div className="flex items-end gap-2">
                <span className="font-editorial text-4xl leading-none tracking-[-0.04em] sm:text-5xl">{maxSaleDiscount}%</span>
                <span className="pb-0.5 text-[8px] font-bold uppercase leading-tight tracking-[0.14em] text-[#7d766d] sm:pb-1 sm:text-[9px] sm:tracking-[0.16em]">off<br />selected</span>
              </div>
              <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#1d1c19] px-4 py-2.5 text-[11px] font-bold text-white transition-transform group-hover:-translate-y-0.5 sm:gap-3 sm:px-5 sm:py-3 sm:text-xs">
                Shop now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="bg-[#fffdf8] px-5 py-24 sm:px-7 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="This week’s shortlist"
            title="Trending, for good reason."
            copy="The pieces customers keep coming back to—selected from across the VKart catalogue."
            action={
              <Link to="/products" className="group inline-flex items-center gap-2 text-sm font-bold text-[#1d1c19]">
                Shop all products <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)
              : featured.slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} onQuickView={setQuickView} onAdd={handleAddToCart} />
                ))}
          </div>
        </div>
      </section>

      {!profile?.isPrime && (
        <section className="border-y border-black/[0.06] bg-[#e9e1d5] px-5 py-16 sm:px-7 sm:py-20">
          <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#1d1c19] text-white shadow-[0_28px_80px_rgba(29,28,25,.15)] lg:grid-cols-[1.1fr_.9fr]">
            <div className="relative px-7 py-12 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
              <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#b66a3c]/15 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#d99b72]">
                  <Crown size={14} /> VKart Prime
                </span>
                <h2 className="mt-6 max-w-xl font-editorial text-4xl leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                  A little more, for people who shop less.
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                  Better value, earlier access, and thoughtful benefits across the things you already want.
                </p>
                <Link
                  to="/prime"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#d18a5e] px-6 py-3.5 text-sm font-bold text-[#1d1c19] transition-all hover:-translate-y-0.5 hover:bg-[#e0a37d]"
                >
                  Discover Prime <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="grid border-t border-white/10 lg:border-l lg:border-t-0">
              {[
                ["01", "Member pricing", "Extra savings on selected collections."],
                ["02", "Priority access", "Shop new drops and live sales first."],
                ["03", "Delivery on us", "Free shipping on eligible orders."],
              ].map(([number, title, copy]) => (
                <div key={number} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/10 px-7 py-7 last:border-b-0 sm:px-10 lg:content-center lg:py-6">
                  <span className="font-editorial text-2xl text-[#d18a5e]">{number}</span>
                  <div>
                    <h3 className="text-base font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-5 py-24 sm:px-7 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Recently arrived"
            title="Fresh perspective."
            copy="New additions chosen to make daily routines feel a little more considered."
            action={
              <Link to="/products?sort=newest" className="group inline-flex items-center gap-2 text-sm font-bold text-[#1d1c19]">
                Explore new arrivals <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)
              : newArrivals.slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} onQuickView={setQuickView} onAdd={handleAddToCart} />
                ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.08] bg-[#efe9df] px-5 py-20 sm:px-7 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a45a34]">Why VKart</p>
            <h2 className="home-why-title mt-5 font-editorial text-5xl leading-[0.95] tracking-[-0.035em] sm:text-6xl">Shopping should feel considered.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [Sparkles, "Curated, not crowded", "A sharper catalogue that keeps the good things easy to find."],
              [ShieldCheck, "Confidence at checkout", "Clear pricing and protected payments from bag to doorstep."],
              [Headphones, "Human when it matters", "Helpful support backed by smart tools, without the runaround."],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="border-t border-black/15 pt-6">
                <Icon size={20} strokeWidth={1.5} className="text-[#9b5330]" />
                <h3 className="mt-7 text-sm font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#777269]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {quickView && (
        <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAdd={handleAddToCart} />
      )}
    </main>
  );
}
