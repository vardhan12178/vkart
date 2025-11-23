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
  BookOpen,
  Filter
} from "lucide-react";

/* ---------- MOCK DATA (KEPT AS IS) ---------- */
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
];

/* ---------- ANIMATION STYLES ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const TagPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
    <Tag size={10} /> {label}
  </span>
);

const Stat = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
    <Icon size={12} /> {children}
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
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <AnimStyles />
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="mb-16 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-4">
            <BookOpen size={12} /> The Journal
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight mb-4">
            Stories & Insights
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Deep dives into tech trends, setup guides, and the latest from the VKart editorial team.
          </p>
        </header>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-200 shadow-sm animate-fade-up" style={{ animationDelay: "0.1s" }}>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search articles..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-none text-sm font-medium text-gray-900 focus:ring-2 focus:ring-orange-500/20 placeholder:text-gray-400 transition-all" 
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat 
                    ? "bg-gray-900 text-white shadow-md" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- FEATURED POST --- */}
        {hasPosts && featured && (
          <section className="mb-16 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link to={`/blog/${featured.id}`} className="group relative block rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img 
                src={featured.image} 
                alt={featured.title} 
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Featured</span>
                  <span className="text-xs font-medium text-gray-300">{featured.readTime}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4 max-w-3xl group-hover:text-orange-100 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-lg text-gray-200 max-w-2xl line-clamp-2 mb-6">
                  {featured.summary}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <User size={14} />
                    </div>
                    <span className="font-bold">{featured.author}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(featured.date)}</span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* --- GRID POSTS --- */}
        {hasPosts && rest.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="text-orange-500" size={20} />
              <h3 className="text-xl font-bold text-gray-900">Latest Stories</h3>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col gap-4">
                  
                  {/* Image Card */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-800">
                        {post.tags[0]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span>{formatDate(post.date)}</span>
                      <span>•</span>
                      <span>{post.readingMinutes} min read</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-600 group-hover:gap-2 transition-all">
                      Read Article <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* --- NEWSLETTER --- */}
        <section className="mt-24 mb-12 animate-fade-up">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 px-6 py-16 sm:px-16 sm:py-20 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                Get the Weekly Drop
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Curated tech news, setup inspiration, and exclusive deals sent straight to your inbox. No spam, ever.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-md"
                />
                <button className="px-8 py-3.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 transition-all hover:scale-105">
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