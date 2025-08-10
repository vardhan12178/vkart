import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { motion } from "framer-motion";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

/** Utilities **/
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

/** Subcomponents **/
const StarRow = ({ rating }) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f${i}`} className="text-yellow-500" />
      ))}
      {half ? <FaStarHalfAlt className="text-yellow-500" /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e${i}`} className="text-gray-300" />
      ))}
    </div>
  );
};

const RatingA11y = ({ rating }) => (
  <span className="sr-only">{Number(rating).toFixed(1)} out of 5</span>
);

const ProductCard = ({ p }) => {
  const img = p.images?.[0] || p.thumbnail;
  const [src, setSrc] = useState(img);
  return (
    <Link
      to={`/product/${p.id}`}
      className="group relative block rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
        <picture>
          <source srcSet={src} type="image/webp" />
          <img
            src={src}
            alt={p.title}
            width={480}
            height={480}
            className="h-full w-full object-contain transition will-change-transform group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setSrc(p.thumbnail)}
          />
        </picture>
        {/* Quick Add hover */}
        {/* <button
          type="button"
          className="pointer-events-none absolute inset-x-6 bottom-4 grid h-10 place-items-center rounded-xl bg-orange-600/90 text-white text-sm font-semibold opacity-0 shadow-md transition group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:opacity-100"
          aria-hidden
        >
          Quick View
        </button> */}
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700 ring-1 ring-orange-100">
          {p.brand || p.category}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900" itemProp="name">
          {p.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-orange-600 font-bold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span itemProp="priceCurrency" content="INR" className="sr-only" />
            <span itemProp="price">{INR(p.price * 75)}</span>
          </span>
          <div className="flex items-center gap-1">
            <StarRow rating={p.rating} />
            <RatingA11y rating={p.rating} />
          </div>
        </div>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
    <div className="aspect-square w-full rounded-xl bg-gray-100 animate-pulse" />
    <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
    <div className="mt-2 h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
  </div>
);

const TrustCard = ({ icon, title, text }) => (
  <article
    className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-orange-200"
    aria-label={title}
  >
    <div className="pointer-events-none absolute inset-x-0 -top-24 h-28 bg-gradient-to-b from-orange-50/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="p-6 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl text-white bg-gradient-to-tr from-orange-600 to-amber-400 shadow-lg ring-4 ring-orange-100">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
      <span className="mt-4 block h-px w-12 mx-auto bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  </article>
);

const TestimonialCard = ({ t }) => (
  <article className="relative h-full rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:ring-orange-200">
    <div className="pointer-events-none absolute -top-3 left-6 text-5xl font-serif text-orange-200 select-none leading-none">“</div>
    <p className="relative mt-4 text-slate-700 leading-relaxed">{t.text}</p>
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
        <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
          {t.name}
          <FaCheckCircle className="text-emerald-500" aria-hidden />
          <span className="sr-only">Verified buyer</span>
        </p>
        <p className="text-xs text-slate-500">{t.role}</p>
      </div>
    </div>
  </article>
);

/** Main Component **/
const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealEndsAt] = useState(() => Date.now() + 1000 * 60 * 60 * 18); // 18 hours
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const catFetches = ["beauty", "fragrances", "smartphones", "laptops"].map((c) =>
          fetch(`https://dummyjson.com/products/category/${c}?limit=5`, { signal: ac.signal }).then((r) => r.json())
        );
        const latest = fetch(
          "https://dummyjson.com/products?limit=12&select=id,title,price,rating,thumbnail,images,brand,category",
          { signal: ac.signal }
        ).then((r) => r.json());

        const results = await Promise.allSettled([...catFetches, latest]);
        const [c1, c2, c3, c4, latestRes] = results.map((res) => (res.status === "fulfilled" ? res.value : { products: [] }));

        const f = [...(c1.products || []), ...(c2.products || []), ...(c3.products || []), ...(c4.products || [])].slice(0, 16);
        setFeatured(f);
        setNewArrivals((latestRes.products || []).sort((a, b) => b.id - a.id).slice(0, 8));
      } catch (e) {
        console.error(e);
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

  const timeLeft = Math.max(0, Math.floor((dealEndsAt - nowTick) / 1000));
  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <>
      {/* HERO */}
    <section className="relative overflow-hidden">
  {/* gradient blobs – only show on md+ so they don’t crowd mobile */}
  <div className="hidden md:block pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200 blur-3xl opacity-50" />
  <div className="hidden md:block pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-100 blur-3xl opacity-60" />

  <div className="container mx-auto px-4 pt-12 pb-6 md:pt-4 md:pb-20">
    <div className="grid items-center gap-8 md:gap-10 md:grid-cols-2">
      {/* TEXT BLOCK */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900"
        >
          Discover Top Picks at{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">VKart</span>
        </motion.h1>

        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-700">
          From electronics to fashion—curated deals, fast delivery, and a seamless experience.
        </p>

        <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 sm:px-6 text-white font-semibold hover:bg-orange-700"
          >
            Shop Collection <FaArrowRight />
          </Link>
          <a
            href="#featured"
            className="inline-flex items-center rounded-xl px-5 py-3 sm:px-6 ring-1 ring-gray-300 hover:bg-gray-50"
          >
            Explore Featured
          </a>
          <p className="w-full text-xs text-gray-500">Free shipping over ₹3,999 · Secure payments</p>
        </div>

        {/* category chips – horizontal scroll with safe gutters */}
        <div className="mt-6 sm:mt-8 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/products?category=${encodeURIComponent(c.slug)}`}
              className="whitespace-nowrap rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

    <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1 }}
  className="relative md:mx-auto w-full md:max-w-lg"
>
  {/* Mobile: smaller, centered image */}
  {/* <img
    src="hero11.png"
    alt="Shopping"
    width={800}
    height={800}
    className="block md:w-full md:h-auto object-contain mx-auto max-h-64 md:max-h-none px-4 md:px-0"
    loading="eager"
    fetchpriority="high"
  /> */}

  <img
    src="hero11.png"
    alt="Shopping"
    width={800}
    height={800}
    className="hidden md:block w-full h-auto object-cover"
    loading="eager"
    fetchpriority="high"
  />
 

  {/* Floating badge — desktop only */}
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

      {/* BRANDS MARQUEE */}
      {brands.length > 0 && (
        <section className="bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 py-6">
            <div className="relative overflow-hidden group">
              <div className="flex gap-8 whitespace-nowrap motion-safe:animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused]">
                {[...brands, ...brands].map((b, i) => (
                  <span
                    key={`${b}-${i}`}
                    className="flex items-center text-gray-600 text-sm md:text-base font-medium tracking-wide hover:text-orange-600 transition-colors duration-200"
                  >
                    {b}
                    <span className="mx-4 h-4 w-px bg-gray-300/50" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .motion-safe\\:animate-\[marquee_20s_linear_infinite\] { animation: none !important; }
            }
          `}</style>
        </section>
      )}

      {/* FEATURED */}
      <section id="featured" className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-orange-600 hover:underline text-sm">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <Slider {...productSlider}>
              {featured.map((p) => (
                <div key={p.id} className="px-2">
                  <ProductCard p={p} />
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section>

      {/* DEAL BANNER */}
<section className="relative overflow-hidden bg-gradient-to-r from-orange-100 to-orange-200">
  <div className="container mx-auto px-4 py-8 md:py-14">
    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-10">
      
      {/* Text + CTA */}
      <div className="text-center md:text-left">
        <h3 className="text-2xl leading-tight sm:text-3xl md:text-4xl font-extrabold text-gray-900">
          Limited Time Offer — Up to 50% OFF
        </h3>

        <p className="mt-2 text-gray-700 text-base md:text-lg">
          Don’t wait — popular items are selling out fast.
        </p>

        {/* Countdown */}
        <div
          className="mt-4 md:mt-5 flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2 text-gray-900"
          aria-live="polite"
          aria-label="Deal ends in"
        >
          <span className="rounded-lg bg-white px-2.5 py-1.5 text-base md:text-lg font-bold tabular-nums">
            {hours}
          </span>
          <span className="px-1 md:px-1.5">:</span>
          <span className="rounded-lg bg-white px-2.5 py-1.5 text-base md:text-lg font-bold tabular-nums">
            {minutes}
          </span>
          <span className="px-1 md:px-1.5">:</span>
          <span className="rounded-lg bg-white px-2.5 py-1.5 text-base md:text-lg font-bold tabular-nums">
            {seconds}
          </span>
        </div>

        <Link
          to="/products"
          className="mt-5 md:mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 md:px-6 md:py-3 text-white font-semibold hover:bg-orange-700"
        >
          Shop Now <FaArrowRight />
        </Link>
      </div>

      {/* Image */}
      <div className="order-first md:order-none">
        <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-none">
          <img
            src="hero3.png"
            alt="Sale 50% banner"
            width={900}
            height={600}
            className="w-full rounded-2xl shadow-lg object-contain md:object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </div>
</section>


      {/* NEW ARRIVALS GRID */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newArrivals.map((p) => (
                <ProductCard p={p} key={p.id} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TRUST ROW */}
      <section className="relative bg-gray-50 py-14">
        <div className="pointer-events-none absolute -top-24 left-6 h-44 w-44 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-6 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <TrustCard icon={<FaTruck className="text-xl" />} title="Free Shipping" text="On orders over ₹3,999" />
            <TrustCard icon={<FaShieldAlt className="text-xl" />} title="Secure Payments" text="Razorpay / UPI / Cards protected" />
            <TrustCard icon={<FaHeadset className="text-xl" />} title="24/7 Support" text="We’re here to help" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative bg-white py-16">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="container mx-auto px-4">
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

        {/* slick overrides */}
        <style>{`
          .testimonial-slider .slick-dots li button:before { font-size: 10px; color: #cbd5e1; opacity: 1; }
          .testimonial-slider .slick-dots li.slick-active button:before { color: #fb923c; }
          .testimonial-slider .slick-prev:before, .testimonial-slider .slick-next:before { color: #94a3b8; font-size: 24px; }
          .testimonial-slider .slick-prev:hover:before, .testimonial-slider .slick-next:hover:before { color: #fb923c; }
        `}</style>
      </section>

      {/* NEWSLETTER */}
      <section className="relative bg-gray-50 py-16">
        <div className="pointer-events-none absolute -top-24 left-10 h-52 w-52 rounded-full bg-orange-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-10 h-60 w-60 rounded-full bg-orange-100/80 blur-3xl" />

        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-gray-200">
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 text-white shadow ring-4 ring-orange-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l4-4m-4 4l4 4" />
                </svg>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Join Our Newsletter</h3>
              <p className="mt-2 text-gray-600">Get the latest drops, deals, and insider tips — straight to your inbox.</p>

              <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button type="submit" className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition">
                  Subscribe
                </button>
              </form>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                <input id="consent" type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300" defaultChecked />
                <label htmlFor="consent">I agree to receive emails and accept the Privacy Policy.</label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
