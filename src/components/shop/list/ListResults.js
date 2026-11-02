import React from "react";
import { useDispatch } from "react-redux";
import { openChat } from "../../../redux/uiSlice";
import { Dots, GridSkeleton, SkeletonRegion } from "../../ui/Skeleton";
import { ACCENT } from "./theme";
import ProductCard from "./ProductCard";

export default function ListResults({
  error,
  retry,
  loading,
  page,
  setPage,
  items,
  data,
  total,
  q,
  chips,
  clearAll,
  onChooseOptions,
}) {
  const dispatch = useDispatch();
  return (
    <>
      {error ? (
        <div className="rounded-2xl bg-paper p-10 text-center ring-1 ring-line">
          <p className="font-semibold text-ink">{error}</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-3 text-sm font-semibold underline"
            style={{ color: ACCENT }}
          >
            Retry
          </button>
        </div>
      ) : loading && page === 1 ? (
        <SkeletonRegion label="Loading products">
          <GridSkeleton
            count={8}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          />
        </SkeletonRegion>
      ) : items.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.slug} p={p} onChooseOptions={onChooseOptions} />
            ))}
          </div>
          {data && page < data.pages && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-xs text-muted-light">
                You've seen {items.length} of {total} products
              </p>
              <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${Math.min(100, (items.length / total) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => setPage(page + 1)}
                className="rounded-full border-2 border-ink px-8 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white disabled:opacity-50"
              >
                {loading ? <Dots /> : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-paper p-10 text-center ring-1 ring-line">
          {q && !chips.length ? (
            <>
              <p className="font-semibold text-ink">No matches for "{q}".</p>
              <p className="mt-1 text-sm text-muted">
                Try fewer or different words, or describe what you need to our AI assistant.
              </p>
              <button
                type="button"
                onClick={() => dispatch(openChat())}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
              >
                Ask VKart
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">No products match these filters.</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-3 text-sm font-semibold underline"
                style={{ color: ACCENT }}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
