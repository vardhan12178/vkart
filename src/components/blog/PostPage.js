import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, User, Tag as TagIcon, ArrowLeft, ArrowRight, Clock, Share2 } from "lucide-react";
import POSTS from "./data";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const TagPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm ring-1 ring-gray-200">
    <TagIcon size={10} className="text-orange-500" /> {label}
  </span>
);

export default function PostPage() {
  const { id } = useParams();
  const index = useMemo(() => POSTS.findIndex((p) => p.id === id), [id]);
  const post = index >= 0 ? POSTS[index] : null;
  const prev = index > 0 ? POSTS[index - 1] : null;
  const next = index < POSTS.length - 1 ? POSTS[index + 1] : null;

  if (!post) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-6 bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Article Not Found</h2>
          <Link to="/blog" className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-white font-bold shadow-lg hover:scale-105 transition-transform">
            <ArrowLeft size={16} /> Back to Journal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 font-sans text-gray-800 selection:bg-orange-100 selection:text-orange-900 pb-20">
      <AnimStyles />

      {/* --- IMMERSIVE HEADER --- */}
      <header className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10" />
        
        <img 
          src={post.image} 
          alt={post.title} 
          className="h-full w-full object-cover object-center animate-fade-up"
          style={{ animationDuration: '1.5s' }} 
        />

        {/* Navbar Placeholder (Back Button) */}
        <div className="absolute top-8 left-4 sm:left-8 z-20">
          <Link to="/blog" className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-bold text-gray-900 shadow-lg hover:bg-white transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </header>

      {/* --- ARTICLE CONTENT --- */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-32 sm:-mt-40">
        <div className="max-w-3xl mx-auto">
          
          {/* Title Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-gray-200/50 border border-white/60 animate-fade-up">
            <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
              {post.tags.map((t) => <TagPill key={t} label={t} />)}
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-6 text-center sm:text-left">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500 justify-center sm:justify-start border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <User size={14} />
                </div>
                <span className="text-gray-900 font-bold">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{post.readingMinutes} min read</span>
              </div>
            </div>
          </div>

          {/* Body Text */}
          <div className="mt-12 px-2 sm:px-4 prose prose-lg prose-orange max-w-none text-gray-600 leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {post.content.map((para, i) => (
              <p key={i} className="mb-6 first:first-letter:text-5xl first:first-letter:font-black first:first-letter:text-gray-900 first:first-letter:mr-3 first:first-letter:float-left">
                {para}
              </p>
            ))}
          </div>

          {/* Share / Actions */}
          <div className="mt-12 flex justify-center py-8 border-y border-gray-200">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <Share2 size={16} /> Share this story
            </button>
          </div>

          {/* --- NAVIGATION --- */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            {prev ? (
              <Link
                to={`/blog/${prev.id}`}
                className="group flex flex-col items-start p-6 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ArrowLeft size={12} /> Previous
                </span>
                <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {prev.title}
                </span>
              </Link>
            ) : <div />}
            
            {next ? (
              <Link
                to={`/blog/${next.id}`}
                className="group flex flex-col items-end text-right p-6 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  Next <ArrowRight size={12} />
                </span>
                <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {next.title}
                </span>
              </Link>
            ) : <div />}
          </div>

        </div>
      </article>

      {/* --- RELATED POSTS --- */}
      <section className="container mx-auto px-4 mt-24 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Keep Reading</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.filter((p) => p.id !== post.id)
            .slice(0, 3)
            .map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.id}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-2 flex gap-2">
                    {p.tags.slice(0, 1).map(t => <TagPill key={t} label={t} />)}
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <div className="mt-3 text-xs font-medium text-gray-500">
                    {p.readingMinutes} min read
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

    </main>
  );
}