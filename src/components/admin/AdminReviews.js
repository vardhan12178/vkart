import React, { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Star } from "lucide-react";
import axiosInstance from "../axiosInstance";
import usePermission from "./usePermission";
import { showToast } from "../../utils/toast";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";

// Moderation for reviews written by verified buyers. Hiding a review removes it from the
// product page and from the product's rating; it can be shown again at any time.

const TABS = [
  { key: "", label: "All" },
  { key: "published", label: "Published" },
  { key: "hidden", label: "Hidden" },
];

export default function AdminReviews() {
  const { canWrite } = usePermission("reviews");
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["admin", "reviews", status, page],
    queryFn: () =>
      axiosInstance
        .get("/api/admin/v2/reviews", { params: { status: status || undefined, page, limit: 20 } })
        .then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const setReviewStatus = useMutation({
    mutationFn: ({ id, next }) =>
      axiosInstance.patch(`/api/admin/v2/reviews/${id}`, { status: next }),
    onSuccess: (_r, { next }) => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      showToast(next === "hidden" ? "Review hidden" : "Review published");
    },
    onError: (e) => showToast(e?.response?.data?.message || "Could not update the review", "error"),
  });

  const data = list.data;
  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Reviews written by shoppers whose order was delivered
            {data ? ` · ${data.total} total` : ""}.
          </p>
        </div>
        <div
          className="flex gap-1 rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Filter reviews"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={status === t.key}
              onClick={() => {
                setStatus(t.key);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${status === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {list.isLoading && (
          <SkeletonRegion label="Loading reviews">
            <TableSkeleton rows={6} cols={4} />
          </SkeletonRegion>
        )}
        {list.isError && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Could not load reviews.
          </p>
        )}
        {data && data.reviews.length === 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white py-14 text-center">
            <p className="text-base font-bold text-slate-900">No reviews yet</p>
            <p className="mt-1 text-sm text-slate-500">
              They appear here once buyers review a delivered order.
            </p>
          </div>
        )}
        <ul className="space-y-3">
          {data?.reviews.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border bg-white p-4 ${r.status === "hidden" ? "border-amber-200 bg-amber-50/40" : "border-slate-200/70"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-0.5 rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {r.stars}
                    <Star
                      className="h-2.5 w-2.5 fill-amber-300 text-amber-300"
                      aria-hidden="true"
                    />
                  </span>
                  <Link
                    to={`/products/${r.slug}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {r.product}
                  </Link>
                  <span className="text-xs text-slate-500">
                    by {r.name} · {r.date} · {r.helpful} helpful
                  </span>
                  {r.status === "hidden" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      Hidden
                    </span>
                  )}
                </div>
                {canWrite && (
                  <button
                    type="button"
                    disabled={setReviewStatus.isPending}
                    onClick={() =>
                      setReviewStatus.mutate({
                        id: r.id,
                        next: r.status === "hidden" ? "published" : "hidden",
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {r.status === "hidden" ? (
                      <>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Show
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        Hide
                      </>
                    )}
                  </button>
                )}
              </div>
              {r.title && <p className="mt-2 text-sm font-semibold text-slate-900">{r.title}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{r.body}</p>
            </li>
          ))}
        </ul>

        {data?.pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {data.pages}
            </span>
            <button
              type="button"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
