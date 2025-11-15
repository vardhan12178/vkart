import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Tag,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const MOCK_POSTS = [
  {
    id: "1",
    title: "Top 10 Smart Desk Upgrades for 2025",
    summary:
      "Wireless chargers, monitor arms, and ergonomic stands — the smartest desk upgrades to boost workflow and cut clutter.",
    author: "VKart Editorial",
    date: "2025-08-02",
    tags: ["Setups", "Productivity"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g1' x1='0' x2='1'><stop offset='0%' stop-color='%23ffedd5'/><stop offset='100%' stop-color='%23fed7aa'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g1)'/><circle cx='280' cy='220' r='150' fill='%23f97316' opacity='0.3'/><circle cx='900' cy='400' r='200' fill='%23fb923c' opacity='0.4'/></svg>",
    readingMinutes: 6,
  },

  {
    id: "2",
    title: "Minimal Workspace Guide: Build a Clean, Calm Desk Setup",
    summary:
      "A step-by-step guide to creating a distraction-free desk layout using minimal accessories and VKart-approved essentials.",
    author: "VKart Editorial",
    date: "2025-07-26",
    tags: ["Minimal", "Workspace"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g2' x1='0' x2='1'><stop offset='0%' stop-color='%23fafaf9'/><stop offset='100%' stop-color='%23f5f5f4'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g2)'/><circle cx='600' cy='315' r='260' fill='%23e5e7eb' opacity='0.45'/></svg>",
    readingMinutes: 5,
  },

  {
    id: "3",
    title: "The Ultimate Everyday Carry (EDC) Starter Kit",
    summary:
      "Daily-use essentials that actually matter — durable cables, PD chargers, compact power banks, and portable stands.",
    author: "VKart Tech Desk",
    date: "2025-07-20",
    tags: ["Everyday Tech", "Guides"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g3' x1='0' x2='1'><stop offset='0%' stop-color='%23fce7f3'/><stop offset='100%' stop-color='%23fbcfe8'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g3)'/><path d='M0 410 Q 280 300, 600 430 T 1200 390 V 630 H 0 Z' fill='%23f472b6' opacity='0.35'/></svg>",
    readingMinutes: 6,
  },

  {
    id: "4",
    title: "Choosing the Best Bluetooth Speakers Under ₹2,000",
    summary:
      "Battery life, bass response, waterproof ratings, and build — a practical guide to picking a great budget speaker.",
    author: "VKart Editorial",
    date: "2025-07-12",
    tags: ["Audio", "Buying Guide"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g4' x1='0' x2='1'><stop offset='0%' stop-color='%23ede9fe'/><stop offset='100%' stop-color='%23ddd6fe'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g4)'/><circle cx='650' cy='330' r='230' fill='%23a78bfa' opacity='0.4'/></svg>",
    readingMinutes: 7,
  },

  {
    id: "5",
    title: "Best Budget Webcams for Work-From-Home in 2025",
    summary:
      "Clear video calls without spending much — here are webcams with good microphones, wide FOV, and sharp low-light performance.",
    author: "VKart Tech Desk",
    date: "2025-07-03",
    tags: ["WFH", "Cameras"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g5' x1='0' x2='1'><stop offset='0%' stop-color='%23e0f2fe'/><stop offset='100%' stop-color='%23bae6fd'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g5)'/><rect x='240' y='180' width='720' height='270' rx='22' fill='%230ea5e9' opacity='0.35'/></svg>",
    readingMinutes: 5,
  },

  {
    id: "6",
    title: "Charging 101: Fast Chargers, GaN Tech & Cable Types Explained",
    summary:
      "A clean breakdown of PD, QC, GaN, wattage ratings, and cable categories — explained without jargon.",
    author: "VKart Editorial",
    date: "2025-06-28",
    tags: ["Accessories", "Tech Basics"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g6' x1='0' x2='1'><stop offset='0%' stop-color='%23fef3c7'/><stop offset='100%' stop-color='%23fde68a'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g6)'/><circle cx='300' cy='310' r='160' fill='%23fcd34d' opacity='0.35'/><circle cx='840' cy='260' r='200' fill='%23facc15' opacity='0.3'/></svg>",
    readingMinutes: 8,
  },

  {
    id: "7",
    title: "Weekly Drops: New Gadgets Worth Checking Out",
    summary:
      "Every Friday we highlight the newest accessories, tools, and desk upgrades added to VKart.",
    author: "VKart Editorial",
    date: "2025-06-21",
    tags: ["New Arrivals", "Highlights"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g7' x1='0' x2='1'><stop offset='0%' stop-color='%23ffedd5'/><stop offset='100%' stop-color='%23fed7aa'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g7)'/><circle cx='600' cy='330' r='260' fill='%23fb923c' opacity='0.35'/></svg>",
    readingMinutes: 4,
  },

  {
    id: "8",
    title: "2025 Home Setup Guide: Affordable Add-ons for Small Spaces",
    summary:
      "Storage racks, cable sleeves, LED strips, and multi-functional organizers to transform any room without overspending.",
    author: "VKart Home Desk",
    date: "2025-06-14",
    tags: ["Home", "Organization"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g8' x1='0' x2='1'><stop offset='0%' stop-color='%23dcfce7'/><stop offset='100%' stop-color='%23bbf7d0'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g8)'/><circle cx='460' cy='330' r='200' fill='%2386efac' opacity='0.45'/></svg>",
    readingMinutes: 6,
  },

  {
    id: "9",
    title: "How to Pick a Good 4K Monitor (Simple Breakdown)",
    summary:
      "A jargon-free guide to choosing the right panel type, refresh rate, size, HDR grade, and stand quality.",
    author: "VKart Tech Desk",
    date: "2025-06-05",
    tags: ["Displays", "Buying Guide"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g9' x1='0' x2='1'><stop offset='0%' stop-color='%23e0e7ff'/><stop offset='100%' stop-color='%23c7d2fe'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g9)'/><rect x='180' y='160' width='840' height='320' rx='28' fill='%23a5b4fc' opacity='0.35'/></svg>",
    readingMinutes: 7,
  },

  {
    id: "10",
    title: "5 Accessories That Make Your Laptop Last Longer",
    summary:
      "A quick guide to cooling pads, protective sleeves, stands, and cleaning kits that extend your laptop’s lifespan.",
    author: "VKart Editorial",
    date: "2025-05-28",
    tags: ["Laptops", "Everyday Tech"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g10' x1='0' x2='1'><stop offset='0%' stop-color='%23fee2e2'/><stop offset='100%' stop-color='%23fecaca'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g10)'/><circle cx='600' cy='310' r='260' fill='%23fca5a5' opacity='0.35'/></svg>",
    readingMinutes: 4,
  },

  {
    id: "11",
    title: "Cable Management for Beginners (No Tools Needed)",
    summary:
      "Simple fixes — Velcro straps, adhesive clips, under-desk sleeves — to instantly clean up your workspace.",
    author: "VKart Editorial",
    date: "2025-05-20",
    tags: ["Workspace", "Setups"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g11' x1='0' x2='1'><stop offset='0%' stop-color='%23faf5ff'/><stop offset='100%' stop-color='%23eee5ff'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g11)'/><path d='M0 350 Q 260 260, 600 380 T 1200 360 V 630 H 0 Z' fill='%23d8b4fe' opacity='0.35'/></svg>",
    readingMinutes: 4,
  },

  {
    id: "12",
    title: "Best Tech Gifts Under ₹1,000",
    summary:
      "Thoughtful, budget-friendly tech gifts — perfect for birthdays, office events, and last-minute surprises.",
    author: "VKart Deals",
    date: "2025-05-14",
    tags: ["Gifts", "Deals"],
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g12' x1='0' x2='1'><stop offset='0%' stop-color='%23fff7ed'/><stop offset='100%' stop-color='%23ffedd5'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g12)'/><circle cx='680' cy='330' r='220' fill='%23fdba74' opacity='0.35'/></svg>",
    readingMinutes: 5,
  },
];


const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const TagPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-xs text-gray-700">
    <Tag className="h-3.5 w-3.5" /> {label}
  </span>
);

const Stat = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-gray-600">
    <Icon className="h-4 w-4" /> {children}
  </span>
);

export default function Blog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(MOCK_POSTS.flatMap((p) => p.tags))).sort()],
    []
  );

  const filtered = useMemo(() => {
    let list = [...MOCK_POSTS];

    if (category !== "All") {
      list = list.filter((p) => p.tags.includes(category));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tags.join(" ").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sort === "Latest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [query, category, sort]);

  const hasPosts = filtered.length > 0;
  const featured = hasPosts ? filtered[0] : null;
  const rest = hasPosts ? filtered.slice(1) : [];

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* HERO + CONTROLS */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              VKart{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="mt-3 text-lg text-gray-700">
              Buying guides, setup ideas, and weekly drops — everything focused on helping you
              build a better everyday setup with VKart products.
            </p>
          </motion.div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, tags, topics..."
                className="w-full rounded-xl border border-gray-200 bg-white/80 pl-10 pr-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              >
                <option value="Latest">Newest first</option>
                <option value="Oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </section>

        {/* EMPTY STATE */}
        {!hasPosts && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">No posts found</h2>
                <p className="mt-1 text-gray-600">
                  Try a different keyword or browse the catalog while we publish more stories.
                </p>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-medium text-white shadow hover:bg-orange-700"
              >
                Explore products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* FEATURED POST */}
        {hasPosts && featured && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-10"
          >
            <Link
              to={`/blog/${featured.id}`}
              className="group block overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              <article className="grid md:grid-cols-2">
                <div className="relative">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent" />
                </div>
                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {featured.tags.map((t) => (
                        <TagPill key={t} label={t} />
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{featured.title}</h2>
                    <p className="mt-2 text-gray-700">{featured.summary}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-4">
                      <Stat icon={User}>{featured.author}</Stat>
                      <Stat icon={Calendar}>{formatDate(featured.date)}</Stat>
                      <span className="text-gray-500">
                        · {featured.readingMinutes} min read
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-gray-900">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        )}

        {/* GRID OF OTHER POSTS */}
        {hasPosts && rest.length > 0 && (
          <section className="mt-10">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800">
              <Sparkles className="h-4 w-4" /> More stories
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                >
                  <Link
                    to={`/blog/${p.id}`}
                    className="group block overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  >
                    <article>
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <div className="mb-2 flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <TagPill key={t} label={t} />
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                        <p className="mt-1 line-clamp-2 text-gray-700">{p.summary}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                          <div className="flex flex-wrap items-center gap-3">
                            <Stat icon={User}>{p.author}</Stat>
                            <Stat icon={Calendar}>{formatDate(p.date)}</Stat>
                          </div>
                          <span className="inline-flex items-center gap-2 text-orange-700">
                            Read <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* NEWSLETTER */}
        <section className="mt-12">
          <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Get the weekly drop</h3>
                <p className="mt-1 text-gray-700">
                  Short, practical emails only — new stories, guides, and VKart picks you can
                  actually use.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed. You’ll get the next VKart weekly drop in your inbox.");
                }}
                className="flex w-full max-w-md items-center gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-medium text-white shadow hover:bg-orange-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* PAGINATION (STATIC FOR NOW) */}
        {hasPosts && (
          <nav className="mt-8 flex items-center justify-between text-sm">
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-500 disabled:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" /> Newer
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-500 disabled:opacity-60"
            >
              Older <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
