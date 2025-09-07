import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Tag as TagIcon, Calendar, User, Sparkles } from "lucide-react";
import POSTS from "./data";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

const TagPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-xs text-gray-700">
    <TagIcon className="h-3.5 w-3.5" /> {label}
  </span>
);

const Stat = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-gray-600">
    <Icon className="h-4 w-4" /> {children}
  </span>
);

export default function BlogIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort()],
    []
  );

  const filtered = useMemo(() => {
    let list = [...POSTS];
    if (category !== "All") list = list.filter((p) => p.tags.includes(category));
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
            <p className="mt-3 text-lg text-gray-700">Stories, tips, and product highlights.</p>
          </motion.div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
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
                  <option key={c} value={c}>{c}</option>
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
                <p className="mt-1 text-gray-600">We’re brewing content. Meanwhile, discover our curated picks.</p>
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

        {hasPosts && featured && (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-10 overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative">
                <img src={featured.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent" />
              </div>
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {featured.tags.map((t) => <TagPill key={t} label={t} />)}
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
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {p.tags.map((t) => <TagPill key={t} label={t} />)}
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
                      <Link to={`/blog/${p.id}`} className="inline-flex items-center gap-2 text-orange-700 hover:underline">
                        Read more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Get the weekly drop</h3>
                <p className="mt-1 text-gray-700">New stories, guides, and picks straight to your inbox.</p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed!");
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
      </div>
    </main>
  );
}
