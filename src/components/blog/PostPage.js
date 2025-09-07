import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, User, Tag as TagIcon, ArrowLeft, ArrowRight } from "lucide-react";
import POSTS from "./data";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

const TagPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-xs text-gray-700">
    <TagIcon className="h-3.5 w-3.5" /> {label}
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
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-gray-200 text-center">
          <p className="text-lg font-semibold text-gray-900">Post not found</p>
          <Link to="/blog" className="mt-3 inline-block rounded-xl bg-orange-600 px-4 py-2 text-white">
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <header className="relative">
        <div className="h-[280px] w-full overflow-hidden">
          <div className="relative h-full">
            <img src={post.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white" />
          </div>
        </div>
      </header>

      <article className="container mx-auto -mt-24 px-6 lg:px-10 pb-14">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white/90 p-6 md:p-8 ring-1 ring-gray-200 backdrop-blur">
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.map((t) => <TagPill key={t} label={t} />)}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(post.date)}</span>
            <span className="text-gray-500">· {post.readingMinutes} min read</span>
          </div>

          <div className="mt-6 max-w-none">
            {post.content.map((para, i) => (
              <p key={i} className="text-gray-800 leading-7">{para}</p>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-gray-900 hover:border-gray-400"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
            <div className="flex items-center gap-2">
              {prev && (
                <Link
                  to={`/blog/${prev.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-gray-900 hover:border-gray-400"
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </Link>
              )}
              {next && (
                <Link
                  to={`/blog/${next.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-gray-900 hover:border-gray-400"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="mx-auto mt-8 max-w-5xl">
          <h3 className="mb-3 text-sm font-medium text-gray-800">You might also like</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.filter((p) => p.id !== post.id)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.id}`}
                  className="group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white hover:shadow"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-1 flex flex-wrap gap-2">
                      {p.tags.slice(0, 2).map((t) => <TagPill key={t} label={t} />)}
                    </div>
                    <div className="line-clamp-2 font-semibold text-gray-900">{p.title}</div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </article>
    </main>
  );
}
