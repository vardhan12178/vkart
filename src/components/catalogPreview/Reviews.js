import React, { useState } from "react";
import { FiStar, FiThumbsUp } from "react-icons/fi";

// Ratings for catalog v2: the green chip used on tiles, and the product page section.
// The reviews come from the API as sample content for this demo store, and the section says so.

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const chipColour = (stars) => (stars >= 4 ? "bg-green-700" : stars >= 3 ? "bg-amber-500" : "bg-red-600");

export function RatingChip({ rating, size = "sm", showCount = true }) {
  if (!rating?.average) return null;
  const small = size === "sm";
  return (
    <span className={`inline-flex items-center gap-1.5 ${small ? "text-[11px]" : "text-sm"}`}>
      <span className={`inline-flex items-center gap-0.5 rounded font-bold text-white ${chipColour(rating.average)} ${small ? "px-1.5 py-0.5" : "px-2 py-0.5"}`}>
        {rating.average.toFixed(1)} <FiStar className="fill-white" size={small ? 9 : 12} />
      </span>
      {showCount && rating.count > 0 && <span className="text-[#8b867d]">({fmt(rating.count)})</span>}
    </span>
  );
}

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function ReviewCard({ r }) {
  const [voted, setVoted] = useState(false);
  return (
    <article className="border-t border-[#efe9df] py-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-bold text-white ${chipColour(r.stars)}`}>
          {r.stars} <FiStar className="fill-white" size={9} />
        </span>
        <h3 className="text-sm font-semibold text-[#1d1c19]">{r.title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#3d3a35]">{r.body}</p>
      {r.variant && <p className="mt-2 text-xs text-[#8b867d]">{r.variant}</p>}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b867d]">
        <span><span className="font-semibold text-[#5f5b52]">{r.name}</span>, {r.city} · {formatDate(r.date)}</span>
        <button type="button" aria-pressed={voted} onClick={() => setVoted(!voted)}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition ${voted ? "border-[#1d1c19] text-[#1d1c19]" : "border-[#e4ddd0] hover:border-[#1d1c19]"}`}>
          <FiThumbsUp size={12} /> Helpful{(r.helpful + (voted ? 1 : 0)) > 0 ? ` (${r.helpful + (voted ? 1 : 0)})` : ""}
        </button>
      </div>
    </article>
  );
}

export function ReviewsSection({ data }) {
  if (!data) {
    return (
      <section id="reviews" className="rounded-3xl bg-[#fffdf8] p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-[#1d1c19]">Ratings & reviews</h2>
        <p className="mt-3 text-sm text-[#6f6b62]">No reviews yet.</p>
      </section>
    );
  }
  const max = Math.max(...data.stars.map((s) => s.count), 1);
  return (
    <section id="reviews" className="scroll-mt-24 rounded-3xl bg-[#fffdf8] p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-[#1d1c19]">Ratings & reviews</h2>
        {data.sample && <span className="text-[11px] text-[#a39e94]">Sample reviews for this demo store</span>}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 text-4xl font-bold text-[#1d1c19]">
            {data.average.toFixed(1)} <FiStar className="fill-[#1d1c19]" size={26} />
          </p>
          <p className="mt-1 text-xs text-[#8b867d]">{fmt(data.count)} ratings and {fmt(data.reviewCount)} reviews</p>
        </div>
        <div className="space-y-1.5">
          {data.stars.map((s) => (
            <div key={s.stars} className="flex items-center gap-2 text-xs text-[#6f6b62]">
              <span className="w-7 shrink-0">{s.stars} ★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#efe9df]">
                <div className={`h-full rounded-full ${chipColour(s.stars)}`} style={{ width: `${(s.count / max) * 100}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right text-[#8b867d]">{fmt(s.count)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 border-t border-[#efe9df] pt-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#8b867d]">Top reviews</h3>
        {data.reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
      </div>
    </section>
  );
}
