import React from "react";
import { Link } from "react-router-dom";
import { RatingChip } from "../Reviews";
import { formatPrice } from "../catalogApi";

function MiniCard({ p }) {
  const img = p.image;
  const off = p.discountPercent;
  return (
    <Link
      to={`/products/${p.slug}`}
      className="group flex w-44 flex-none flex-col rounded-xl border border-line bg-white p-3 transition hover:shadow-md sm:w-52"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#faf8f3]">
        {img && (
          <img
            src={img.thumb}
            alt={img.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-2 transition group-hover:scale-105"
          />
        )}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-light">
        {p.brand}
      </p>
      <p className="line-clamp-2 text-sm font-medium text-ink">
        {p.title.replace(`${p.brand} `, "")}
      </p>
      {p.rating && (
        <div className="mt-1">
          <RatingChip rating={p.rating} />
        </div>
      )}
      <p className="mt-1 text-sm">
        <span className="font-bold text-ink">{formatPrice(p.priceRange?.min ?? p.price)}</span>
        {off > 0 && <span className="ml-1.5 text-xs font-semibold text-ok">{off}% off</span>}
      </p>
    </Link>
  );
}

export default function Rail({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => (
          <MiniCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
