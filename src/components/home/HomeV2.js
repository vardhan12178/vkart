import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  FiSmartphone, FiMonitor, FiTablet, FiTv, FiHeadphones, FiWatch, FiDroplet, FiUser, FiShoppingBag,
  FiHome, FiCoffee, FiScissors, FiActivity, FiCpu, FiChevronRight, FiChevronLeft, FiTruck, FiRotateCcw,
  FiShield, FiCheckCircle, FiZap,
} from "react-icons/fi";
import { openChat } from "../../redux/uiSlice";
import { fetchProducts, formatPrice } from "../catalogPreview/catalogApi";
import { CATEGORIES } from "../catalogPreview/catalogData";
import { RatingChip } from "../catalogPreview/Reviews";
import TwoFactorNudge from "./TwoFactorNudge";

// Shop-style home page on catalog v2 (category strip, hero carousel, deals, category cards,
// product rails). Every number shown comes from the catalog; nothing is a made-up offer.

const ACCENT = "#a85d37";
const ICONS = {
  mobiles: FiSmartphone, laptops: FiCpu, tablets: FiTablet, tvs: FiTv, monitors: FiMonitor, audio: FiHeadphones,
  wearables: FiWatch, skincare: FiDroplet, "fashion-men": FiUser, "fashion-women": FiShoppingBag,
  appliances: FiHome, "kitchen-appliances": FiCoffee, grooming: FiScissors, sports: FiActivity,
};
const catLink = (cat, extra = "") => `/products?cat=${cat}${extra}`;
const productLink = (p) => `/products/${p.slug}`;

function useProducts(key, params) {
  return useQuery({
    queryKey: ["home-v2", key],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------ Small pieces ------------ */
function Section({ title, subtitle, to, children, className = "" }) {
  return (
    <section className={`mx-auto max-w-7xl px-3 sm:px-4 ${className}`}>
      <div className="rounded-2xl bg-paper p-4 ring-1 ring-line sm:p-5">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
            {subtitle && <p className="text-xs text-muted-light sm:text-sm">{subtitle}</p>}
          </div>
          {to && (
            <Link to={to} className="flex flex-none items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black">
              View all <FiChevronRight />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function Tile({ p, showOff = true }) {
  const fashion = p.category === "fashion";
  return (
    <Link to={productLink(p)} className="group flex w-36 flex-none flex-col sm:w-44">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f4f0e8]">
        {p.image && (
          <img src={p.image.thumb} alt={p.image.alt || p.title} loading="lazy" referrerPolicy="no-referrer"
            className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.04] ${fashion ? "object-cover" : "object-contain p-3 mix-blend-multiply"}`} />
        )}
        {showOff && p.discountPercent >= 5 && (
          <span className="absolute left-2 top-2 rounded-full bg-ok px-2 py-0.5 text-[10px] font-bold text-white">{p.discountPercent}% off</span>
        )}
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-light">{p.brand}</p>
      <p className="line-clamp-2 text-xs font-medium leading-snug text-ink sm:text-sm">{p.title.replace(`${p.brand} `, "")}</p>
      {p.rating && <div className="mt-1"><RatingChip rating={p.rating} /></div>}
      <p className="mt-0.5 text-sm">
        <span className="font-bold text-ink">{formatPrice(p.priceRange?.min ?? p.price)}</span>
        {p.discountPercent > 0 && <span className="ml-1.5 text-[11px] text-muted-light line-through">{formatPrice(p.mrp)}</span>}
      </p>
    </Link>
  );
}

function Rail({ query }) {
  const items = query.data?.products || [];
  if (query.isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="w-36 flex-none sm:w-44">
            <div className="aspect-square animate-pulse rounded-xl bg-tint" />
            <div className="mt-2 h-3 w-2/3 rounded bg-tint" />
            <div className="mt-1.5 h-3 w-1/2 rounded bg-tint" />
          </div>
        ))}
      </div>
    );
  }
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-light">Nothing to show here right now.</p>;
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
      {items.map((p) => <Tile key={p.slug} p={p} />)}
    </div>
  );
}

/* ------------ Hero carousel ------------ */
function Hero({ slides }) {
  const [idx, setIdx] = useState(0);
  const strip = useRef(null);
  const paused = useRef(false);
  const settle = useRef(null);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setInterval(() => { if (!paused.current) setIdx((i) => (i + 1) % slides.length); }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => () => clearTimeout(settle.current), []);

  useEffect(() => {
    const el = strip.current;
    if (el && el.clientWidth) el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, [idx]);

  // Sync the dots after a swipe once scrolling settles; reading mid-scroll positions would undo arrow/auto moves
  const onScroll = (e) => {
    const el = e.currentTarget;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const w = el.clientWidth;
      const i = w ? Math.round(el.scrollLeft / w) : idx;
      if (i !== idx) setIdx(i);
    }, 150);
  };

  if (!slides.length) return <div className="aspect-[16/9] animate-pulse rounded-2xl bg-[#ebe4d8] sm:aspect-[3/1]" />;

  return (
    <div className="relative" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <div ref={strip} className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={onScroll}>
        {slides.map((s) => (
          <Link key={s.key} to={s.to} className={`relative grid w-full flex-none snap-center grid-cols-[1.1fr_1fr] items-center overflow-hidden sm:grid-cols-2 ${s.bg}`}>
            <div className="z-10 px-5 py-6 sm:px-12 sm:py-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs" style={{ color: s.accent }}>{s.eyebrow}</p>
              <h2 className="mt-2 text-xl font-bold leading-tight sm:text-4xl" style={{ color: s.ink }}>{s.title}</h2>
              <p className="mt-1.5 text-xs sm:mt-3 sm:text-base" style={{ color: s.sub }}>{s.copy}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold sm:mt-6 sm:px-6 sm:py-2.5 sm:text-sm"
                style={{ background: s.ink, color: s.bgHex }}>
                {s.cta} <FiChevronRight />
              </span>
            </div>
            {s.dark ? (
              // Dark banners: product on a light panel (multiply blending would turn it black)
              <div className="relative mr-4 h-36 rounded-2xl bg-[#f4f0e8] sm:mr-10 sm:h-60">
                {s.image && <img src={s.image.md} alt={s.image.alt || s.title} referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply sm:p-5" />}
              </div>
            ) : (
              <div className="relative h-44 sm:h-72">
                {s.image && <img src={s.image.md} alt={s.image.alt || s.title} referrerPolicy="no-referrer"
                  className={`absolute inset-0 h-full w-full ${s.cover ? "object-cover" : "object-contain p-4 sm:p-6 mix-blend-multiply"}`} />}
              </div>
            )}
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow md:flex"><FiChevronLeft /></button>
          <button type="button" aria-label="Next slide" onClick={() => setIdx((idx + 1) % slides.length)}
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow md:flex"><FiChevronRight /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button key={s.key} type="button" aria-label={`Slide ${i + 1}`} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${slides[idx]?.dark
                  ? (i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40")
                  : (i === idx ? "w-6 bg-ink" : "w-1.5 bg-black/25")}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------ Category card (4 thumbnails, Amazon style) ------------ */
function CategoryCard({ title, cat, query }) {
  const items = (query.data?.products || []).slice(0, 4);
  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-paper p-3 ring-1 ring-line sm:p-4">
      <h3 className="text-sm font-bold text-ink sm:text-base">{title}</h3>
      <div className="mt-2 grid flex-1 grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2.5">
        {(items.length ? items : Array.from({ length: 4 }, () => null)).map((p, i) => (
          p ? (
            <Link key={p.slug} to={productLink(p)} className="group">
              <div className="aspect-square overflow-hidden rounded-lg bg-[#f4f0e8]">
                {p.image && <img src={p.image.thumb} alt={p.image.alt || p.title} loading="lazy" referrerPolicy="no-referrer"
                  className={`h-full w-full transition group-hover:scale-105 ${p.category === "fashion" ? "object-cover" : "object-contain p-2 mix-blend-multiply"}`} />}
              </div>
              <p className="mt-1 line-clamp-1 hidden text-[11px] text-[#5f5b52] sm:block">{p.title.replace(`${p.brand} `, "")}</p>
            </Link>
          ) : <div key={i} className="aspect-square animate-pulse rounded-lg bg-tint" />
        ))}
      </div>
      <Link to={catLink(cat)} className="mt-2 text-[11px] font-semibold sm:mt-3 sm:text-xs" style={{ color: ACCENT }}>See more →</Link>
    </div>
  );
}

const maxOff = (q) => Math.max(0, ...(q.data?.products || []).map((p) => p.discountPercent || 0));
const minPriceOf = (q) => q.data?.facets?.price?.min;
const firstImage = (q, i = 0) => q.data?.products?.[i]?.image || q.data?.products?.[0]?.image;

/* ------------ Page ------------ */
export default function HomeV2() {
  const dispatch = useDispatch();

  const deals = useProducts("deals", { sort: "discount", minDiscount: 10, limit: 12 });
  const phones = useProducts("phones", { category: "mobiles", limit: 12 });
  const laptops = useProducts("laptops", { category: "laptops", limit: 12 });
  const audio = useProducts("audio", { category: "audio", sort: "discount", limit: 12 });
  const women = useProducts("women", { category: "fashion-women", limit: 8 });
  const men = useProducts("men", { category: "fashion-men", limit: 8 });
  const skincare = useProducts("skincare", { category: "skincare", sort: "price-asc", limit: 12 });
  const home = useProducts("appliances", { category: "appliances", limit: 8 });
  const tvs = useProducts("tvs", { category: "tvs", sort: "price-asc", limit: 8 });
  const newest = useProducts("newest", { sort: "newest", limit: 12 });

  const slides = [
    phones.data?.products?.length && {
      key: "phones", to: catLink("mobiles"), bg: "bg-[#e9e3d8]", bgHex: "#e9e3d8", ink: "#1d1c19", sub: "#5f5b52", accent: ACCENT,
      eyebrow: "New season phones", title: "Flagships to everyday 5G", copy: `${phones.data.total} phones from top brands, from ${formatPrice(minPriceOf(phones))}.`,
      cta: "Shop phones", image: firstImage(phones),
    },
    audio.data?.products?.length && {
      key: "audio", to: catLink("audio", ""), dark: true, bg: "bg-ink", bgHex: "#1d1c19", ink: "#fffdf8", sub: "#cfc7b8", accent: "#e0a37f",
      eyebrow: "Sound, upgraded", title: maxOff(audio) ? `Earbuds & headphones up to ${maxOff(audio)}% off` : "Earbuds & headphones",
      copy: "Noise cancelling, all-day battery, studio sound.", cta: "Explore audio", image: firstImage(audio),
    },
    women.data?.products?.length && {
      key: "women", to: catLink("fashion-women"), bg: "bg-[#f1e4da]", bgHex: "#f1e4da", ink: "#3b2a22", sub: "#75483b", accent: ACCENT,
      eyebrow: "The festive edit", title: "Sarees, kurtas & jewellery", copy: `From ${formatPrice(minPriceOf(women))}. Handpicked from Indian labels.`,
      cta: "Shop women", image: firstImage(women), cover: true,
    },
    laptops.data?.products?.length && {
      key: "laptops", to: catLink("laptops"), bg: "bg-[#e4e7e1]", bgHex: "#e4e7e1", ink: "#1f2a1f", sub: "#4e5c47", accent: "#4e5c47",
      eyebrow: "Work & play", title: "Laptops for every desk", copy: `Thin-and-light to gaming, from ${formatPrice(minPriceOf(laptops))}.`,
      cta: "Shop laptops", image: firstImage(laptops),
    },
  ].filter(Boolean);

  const trust = [
    { icon: FiTruck, title: "Free delivery", text: "On orders over ₹499" },
    { icon: FiRotateCcw, title: "7-day returns", text: "Easy, no-fuss returns" },
    { icon: FiShield, title: "Secure payments", text: "UPI, cards & netbanking" },
    { icon: FiCheckCircle, title: "Genuine brands", text: "Sourced from official stores" },
  ];

  return (
    <main className="min-h-screen bg-[#f2eee6] pb-12">
      <Helmet>
        <title>VKart | Phones, fashion, beauty & more</title>
        <meta name="description" content="Shop phones, laptops, audio, fashion, skincare and home appliances from top brands on VKart." />
      </Helmet>
      <TwoFactorNudge />

      {/* Category strip */}
      <nav aria-label="Shop by category" className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-between sm:px-4">
          {Object.entries(CATEGORIES).map(([k, name]) => {
            const Icon = ICONS[k] || FiShoppingBag;
            return (
              <Link key={k} to={catLink(k)} className="group flex w-[72px] flex-none flex-col items-center gap-1.5 sm:w-[80px]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-xl text-[#5f5b52] transition group-hover:bg-ink group-hover:text-white">
                  <Icon />
                </span>
                <span className="text-center text-[11px] leading-tight text-ink-soft">{name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-4 sm:pt-4">
        <Hero slides={slides} />
      </div>

      {/* Trust strip */}
      <div className="mx-auto mt-3 grid max-w-7xl grid-cols-2 gap-2 px-3 sm:mt-4 sm:grid-cols-4 sm:px-4">
        {trust.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl bg-paper px-3 py-3 ring-1 ring-line">
            <Icon className="flex-none text-xl" style={{ color: ACCENT }} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink sm:text-sm">{title}</p>
              <p className="truncate text-[11px] text-muted-light">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        <Section title="Top deals" subtitle="The biggest discounts across the store">
          <Rail query={deals} />
        </Section>

        {/* Category cards */}
        <section className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-3 sm:gap-4 sm:px-4 lg:grid-cols-4">
          <CategoryCard title="Smartphones" cat="mobiles" query={phones} />
          <CategoryCard title="Women's fashion" cat="fashion-women" query={women} />
          <CategoryCard title="Men's fashion" cat="fashion-men" query={men} />
          <CategoryCard title="Home appliances" cat="appliances" query={home} />
        </section>

        <Section title="Best of smartphones" subtitle={phones.data ? `${phones.data.total} models from top brands` : undefined} to={catLink("mobiles")}>
          <Rail query={phones} />
        </Section>

        {/* Ask VKart banner */}
        <section className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e0a37f]"><FiZap /> Ask VKart</p>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">Not sure what to buy? Just ask.</h2>
              <p className="mt-1 text-sm text-[#cfc7b8]">"Gaming phone under 40k with a big battery" · "Serum for dark spots" · "Saree for a wedding"</p>
            </div>
            <button type="button" onClick={() => dispatch(openChat())}
              className="flex-none rounded-full bg-paper px-6 py-3 text-sm font-bold text-ink transition hover:bg-white">
              Ask our AI
            </button>
          </div>
        </section>

        <Section title="Laptops for work & play" to={catLink("laptops")}>
          <Rail query={laptops} />
        </Section>

        <Section title="Audio at its best" subtitle="Earbuds, headphones & speakers" to={catLink("audio")}>
          <Rail query={audio} />
        </Section>

        <Section title="Skincare under ₹500" subtitle="Serums, moisturisers & sunscreens" to={catLink("skincare")}>
          <Rail query={{ ...skincare, data: skincare.data && { ...skincare.data, products: skincare.data.products.filter((p) => (p.priceRange?.min ?? p.price) <= 500) } }} />
        </Section>

        <Section title="TVs for every room" to={catLink("tvs")}>
          <Rail query={tvs} />
        </Section>

        <Section title="New arrivals" subtitle="The latest additions to the catalog" to="/products">
          <Rail query={newest} />
        </Section>
      </div>
    </main>
  );
}
