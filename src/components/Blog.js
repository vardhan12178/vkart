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

// --- Mock posts (replace with API later) ------------------------------------
const MOCK_POSTS = [
  {
    id: "1",
    title: "Summer Tech Essentials: Gadgets Under ₹5,000",
    summary:
      "Budget-friendly accessories to level up your daily carry — chargers, earbuds, stands, and more.",
    author: "Vkart Editorial",
    date: "2025-07-28",
    tags: ["Guides", "Electronics"],
    image:
      "data:image/svg+xml;utf8,\
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0%' stop-color='%23ffedd5'/><stop offset='100%' stop-color='%23fed7aa'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='220' cy='180' r='120' fill='%23fdba74' opacity='0.6'/><circle cx='900' cy='420' r='160' fill='%23fb923c' opacity='0.5'/></svg>",
    readingMinutes: 5,
  },
  {
    id: "2",
    title: "How To Pick the Right 4K Monitor in 2025",
    summary:
      "Refresh rate vs. color accuracy vs. HDR — here’s what actually matters for work and play.",
    author: "Priya Sharma",
    date: "2025-07-15",
    tags: ["Buying Guide", "Displays"],
    image:
      "data:image/svg+xml;utf8,\
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g2' x1='0' x2='1'><stop offset='0%' stop-color='%23e0e7ff'/><stop offset='100%' stop-color='%23c7d2fe'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g2)'/><rect x='120' y='120' width='960' height='390' rx='20' fill='%23a5b4fc' opacity='0.6'/></svg>",
    readingMinutes: 7,
  },
  {
    id: "3",
    title: "5 Ways To Organize Cables (That Actually Stick)",
    summary:
      "From Velcro wraps to under-desk trays — clean setup tips the internet swears by.",
    author: "Vkart Editorial",
    date: "2025-06-30",
    tags: ["Setups", "Workspace"],
    image:
      "data:image/svg+xml;utf8,\
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g3' x1='0' x2='1'><stop offset='0%' stop-color='%23fce7f3'/><stop offset='100%' stop-color='%23fbcfe8'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g3)'/><path d='M0 400 Q 300 300, 600 420 T 1200 380 V 630 H 0 Z' fill='%23f472b6' opacity='0.4'/></svg>",
    readingMinutes: 4,
  },
  {
    id: "4",
    title: "The Minimal Desk Starter Pack",
    summary:
      "Keyboard, mouse, mat, and a monitor arm — start simple and scale.",
    author: "Arjun Patel",
    date: "2025-06-20",
    tags: ["Setups", "Minimal"],
    image:
      "data:image/svg+xml;utf8,\
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g4' x1='0' x2='1'><stop offset='0%' stop-color='%23dcfce7'/><stop offset='100%' stop-color='%23bbf7d0'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g4)'/><circle cx='600' cy='315' r='220' fill='%2386efac' opacity='0.5'/></svg>",
    readingMinutes: 3,
  },
  {
    id: "5",
    title: "Weekly Drop: New Accessories You’ll Love",
    summary:
      "Highlights from this week’s arrivals — smart plugs, stands, and cable kits.",
    author: "Vkart Editorial",
    date: "2025-06-10",
    tags: ["New", "Arrivals"],
    image:
      "data:image/svg+xml;utf8,\
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><defs><linearGradient id='g5' x1='0' x2='1'><stop offset='0%' stop-color='%23fee2e2'/><stop offset='100%' stop-color='%23fecaca'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g5)'/><rect x='200' y='160' width='800' height='320' rx='28' fill='%23fca5a5' opacity='0.5'/></svg>",
    readingMinutes: 4,
  },
];

// Small utilities
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

// --- Component ---------------------------------------------------------------
const Blog = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");

  const categories = useMemo(() => [
    "All",
    ...Array.from(
      new Set(MOCK_POSTS.flatMap((p) => p.tags)).values()
    ).sort(),
  ], []);

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
      sort === "Latest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [query, category, sort]);

  const hasPosts = filtered.length > 0;
  const featured = hasPosts ? filtered[0] : null;
  const rest = hasPosts ? filtered.slice(1) : [];

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* background blobs */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* Hero */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Vkart <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="mt-3 text-lg text-gray-700">
              Stories, tips, and product highlights — fresh drops every week.
            </p>
          </motion.div>

          {/* Controls */}
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
                {[
                  { v: "Latest", l: "Newest first" },
                  { v: "Oldest", l: "Oldest first" },
                ].map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Empty state */}
        {!hasPosts && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">No posts yet</h2>
                <p className="mt-1 text-gray-600">
                  We’re brewing content. Meanwhile, discover our curated picks in the catalog.
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

        {/* Featured post */}
        {hasPosts && featured && (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-10 overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow"
          >
            <div className="grid md:grid-cols-2">
              {/* image */}
              <div className="relative">
                <img
                  src={featured.image}
                  alt="featured"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent" />
              </div>
              {/* content */}
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
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm">
                    <Stat icon={User}>{featured.author}</Stat>
                    <Stat icon={Calendar}>{formatDate(featured.date)}</Stat>
                    <span className="text-gray-500">· {featured.readingMinutes} min read</span>
                  </div>
                  <Link
                    to={`/blog/${featured.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-gray-900 hover:border-gray-400"
                  >
                    Read article <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>
        )}

        {/* Grid */}
        {hasPosts && rest.length > 0 && (
          <section className="mt-10">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800">
              <Sparkles className="h-4 w-4" /> More stories
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                  className="group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow hover:shadow-md"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={p.image}
                      alt="cover"
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
                      <div className="flex items-center gap-3">
                        <Stat icon={User}>{p.author}</Stat>
                        <Stat icon={Calendar}>{formatDate(p.date)}</Stat>
                      </div>
                      <span className="text-gray-500">{p.readingMinutes} min</span>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/blog/${p.id}`}
                        className="inline-flex items-center gap-2 text-orange-700 hover:underline"
                      >
                        Read more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="mt-12">
          <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Get the weekly drop</h3>
                <p className="mt-1 text-gray-700">New stories, guides, and product picks straight to your inbox.</p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed — you'll hear from us soon! ✉️");
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

        {/* Footer pager (placeholder) */}
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
};

export default Blog;
