import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import {
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  RefreshIcon,
  ExclamationCircleIcon,
  StarIcon,
  ChatAlt2Icon,
  SearchIcon
} from "@heroicons/react/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/solid";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("reviews");
  const [search, setSearch] = useState("");

  const reviewsQuery = useQuery({
    queryKey: qk.admin.reviews,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/reviews");
      return res?.data?.reviews || [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (r) => axiosInstance.patch(`/api/admin/reviews/${r.productId}/${r.review._id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.reviews });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (r) => axiosInstance.delete(`/api/admin/reviews/${r.productId}/${r.review._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.reviews });
    },
  });

  const reviews = reviewsQuery.data || [];
  const loading = reviewsQuery.isLoading;
  const error = reviewsQuery.isError ? "Failed to load reviews" : "";

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) =>
      (r.productTitle || "").toLowerCase().includes(q) ||
      (r.review?.comment || "").toLowerCase().includes(q) ||
      (r.review?.reviewerName || "").toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const toggle = async (r) => {
    try {
      await toggleMutation.mutateAsync(r);
    } catch {
      // ignore
    }
  };

  const remove = async (r) => {
    try {
      await deleteMutation.mutateAsync(r);
    } catch {
      // ignore
    }
  };

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header Section */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">Moderate customer product reviews.</p>
          </div>
          <button
            onClick={() => reviewsQuery.refetch()}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:bg-slate-50 transition-all active:scale-95 shrink-0"
          >
            <RefreshIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${reviewsQuery.isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-1 sm:p-1.5 rounded-2xl border border-slate-200/70 shadow-xs flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-xs sm:text-sm font-medium"
              placeholder="Search by product, review text, or reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 px-3 shrink-0">
            {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-xs space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-2xl border border-red-100 text-red-600 flex items-center gap-2 shadow-xs text-xs sm:text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/70 shadow-xs text-center">
            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-slate-300">
              <ChatAlt2Icon className="h-6 w-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">No reviews found</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">No reviews match your current search.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
            {/* Mobile Cards (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredReviews.map((r) => (
                <div key={`${r.productId}-${r.review._id}`} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors">
                  {/* Top line: Product Title & Rating */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 flex-1">
                      {r.productTitle}
                    </h4>
                    <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md shrink-0">
                      <StarSolidIcon className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-black text-amber-800">{r.review.rating || 5}</span>
                    </div>
                  </div>

                  {/* Comment body */}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    "{r.review.comment || "No comment provided."}"
                  </p>

                  {/* Reviewer info and actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-slate-600 truncate">{r.review.reviewerName || "Anonymous"}</span>
                      {r.review.isHidden && (
                        <span className="bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.2 rounded font-bold">
                          Hidden
                        </span>
                      )}
                    </div>

                    {canWrite && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggle(r)}
                          disabled={toggleMutation.isPending}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            r.review.isHidden
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {r.review.isHidden ? <EyeIcon className="h-3 w-3" /> : <EyeOffIcon className="h-3 w-3" />}
                          <span>{r.review.isHidden ? "Show" : "Hide"}</span>
                        </button>
                        <button
                          onClick={() => remove(r)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Review</th>
                    {canWrite && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredReviews.map((r) => (
                    <tr key={`${r.productId}-${r.review._id}`} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs truncate">{r.productTitle}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800 leading-relaxed">{r.review.comment || "—"}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span className="font-semibold text-slate-600">{r.review.reviewerName || "Anonymous"}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-amber-600 font-bold">
                            <StarSolidIcon className="h-3.5 w-3.5 mr-0.5" />
                            {r.review.rating}
                          </span>
                          {r.review.isHidden && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Hidden
                            </span>
                          )}
                        </div>
                      </td>
                      {canWrite && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggle(r)}
                            disabled={toggleMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 mr-2 transition-colors"
                          >
                            {r.review.isHidden ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                            <span>{r.review.isHidden ? "Show" : "Hide"}</span>
                          </button>
                          <button
                            onClick={() => remove(r)}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
