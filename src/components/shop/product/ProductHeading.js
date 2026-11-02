import React from "react";
import { Link } from "react-router-dom";
import { FiColumns, FiHeart, FiShare2 } from "react-icons/fi";
import { RatingChip } from "../Reviews";
import { ACCENT } from "./theme";

export default function ProductHeading({ p, cat, saved, onShare, onToggleSave, onCompare }) {
  return (
    <>
      <Link to={`/products?cat=${cat}`} className="text-sm font-semibold" style={{ color: ACCENT }}>
        Visit the {p.brand} store
      </Link>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="min-w-0 break-words text-2xl font-bold leading-snug text-ink sm:text-3xl">
          {p.title}
        </h1>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            aria-label="Share"
            onClick={onShare}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-white text-ink transition hover:border-ink"
          >
            <FiShare2 />
          </button>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={onToggleSave}
            className={`flex h-11 w-11 flex-none items-center justify-center rounded-full border transition ${saved ? "border-accent bg-accent/10 text-accent" : "border-line-strong bg-white text-ink hover:border-ink"}`}
          >
            <FiHeart className={saved ? "fill-accent" : ""} />
          </button>
        </div>
      </div>
      {p.rating?.average ? (
        <a
          href="#reviews"
          className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:underline"
        >
          <RatingChip rating={p.rating} size="md" showCount={false} />
          {p.rating.count.toLocaleString("en-IN")} ratings
          {p.reviews ? ` & ${p.reviews.reviewCount.toLocaleString("en-IN")} reviews` : ""}
        </a>
      ) : (
        <p className="mt-2 text-sm text-muted-light">No ratings yet</p>
      )}
      <button
        type="button"
        onClick={onCompare}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
      >
        <FiColumns /> Compare with other products
      </button>
    </>
  );
}
