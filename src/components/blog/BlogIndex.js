import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Tag as TagIcon,
  Calendar,
  User,
  Sparkles,
  BookOpen
} from "lucide-react";
import POSTS from "./data";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const TagPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm ring-1 ring-gray-200">
    <TagIcon size={10} className="text-orange-500" /> {label}
  </span>
);

const Stat = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
    <Icon size={12} /> {children}
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
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      <AnimStyles />
      
      {/* Ambient Background Blobs - Fixed Z-Index to stay behind */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 relative z-10">
        
        {/* --- PAGE TITLE (Changed to div to fix styling) --- */}
        <div className="mb-16 text-center animate-fade-up relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <BookOpen size={12} /> The Journal
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
            Stories & Insights
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Deep dives into tech trends, setup guides, and the latest from the VKart editorial team.
          </p>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-white/60 backdrop-blur-xl p-2 rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search articles..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-transparent text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500/20 placeholder:text-gray-400 transition-all outline-none" 
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide px-2">
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat 
                    ? "bg-gray-900 text-white shadow-lg" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- FEATURED POST --- */}
        {hasPosts && featured && (
          <section className="mb-20 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link to={`/blog/${featured.id}`} className="group relative block rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-900/10 h-[500px] md:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
              <img 
                src={featured.image} 
                alt={featured.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Featured Story</span>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{featured.readingMinutes} min read</span>
                </div>
                <h2 className="text-3xl md:text-6xl font-black leading-tight mb-6 max-w-4xl group-hover:text-orange-100 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl line-clamp-2 mb-8 opacity-90 leading-relaxed">
                  {featured.summary}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-gray-300 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
                      <User size={16} />
                    </div>
                    <span className="font-bold text-white">{featured.author}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  <span>{formatDate(featured.date)}</span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* --- GRID POSTS --- */}
        {hasPosts && rest.length > 0 ? (
          <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Sparkles size={20} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Latest Stories</h3>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col gap-5">
                  
                  {/* Image Card */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-gray-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-orange-500/10 transition-all duration-500 group-hover:-translate-y-1">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {post.tags.slice(0, 2).map(t => <TagPill key={t} label={t} />)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 px-1">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>{formatDate(post.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{post.readingMinutes} min read</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                      {post.summary}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-wide group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={12} className="text-orange-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          /* Empty State */
          <div className="text-center py-24 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-gray-200 animate-fade-up">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 shadow-inner">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No articles found</h3>
            <p className="text-gray-500 text-sm mt-2">Try searching for a different keyword or category.</p>
          </div>
        )}

        {/* --- NEWSLETTER --- */}
        <section className="mt-32 mb-20 animate-fade-up">
          <div className="relative overflow-hidden rounded-[3rem] bg-[#050505] px-6 py-20 sm:px-20 text-center shadow-2xl shadow-gray-900/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                Get the Weekly Drop
              </h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Curated tech news, setup inspiration, and exclusive deals sent straight to your inbox. No spam, ever.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 outline-none backdrop-blur-md transition-all"
                />
                <button className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
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