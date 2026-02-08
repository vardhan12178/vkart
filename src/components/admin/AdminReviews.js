import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { EyeIcon, EyeOffIcon, TrashIcon, RefreshIcon, ExclamationCircleIcon } from "@heroicons/react/outline";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/reviews");
      setReviews(res?.data?.reviews || []);
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (r) => {
    try {
      await axiosInstance.patch(`/api/admin/reviews/${r.productId}/${r.review._id}/toggle`);
      load();
    } catch {
      // ignore
    }
  };

  const remove = async (r) => {
    try {
      await axiosInstance.delete(`/api/admin/reviews/${r.productId}/${r.review._id}`);
      load();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
            <p className="text-sm text-slate-500 mt-1">Moderate product reviews.</p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium shadow-md hover:bg-slate-800 transition-all"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200">Loading...</div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-red-600 flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5" /> {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-500">
            No reviews found.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Review</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <tr key={`${r.productId}-${r.review._id}`} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.productTitle}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">{r.review.comment || "—"}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {r.review.reviewerName || "Anonymous"} • {r.review.rating}★
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggle(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 mr-2"
                      >
                        {r.review.isHidden ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                        {r.review.isHidden ? "Show" : "Hide"}
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
