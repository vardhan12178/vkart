import React, { useState } from "react";
import { FaStar, FaTimes, FaPen } from "react-icons/fa";
import axios from "./axiosInstance";
import { showToast } from "../utils/toast";

const RATING_LABELS = {
  1: "Poor (1/5)",
  2: "Fair (2/5)",
  3: "Good (3/5)",
  4: "Very Good (4/5)",
  5: "Excellent (5/5)",
};

export default function ReviewModal({ isOpen, onClose, productId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    if (comment.trim().length < 10) {
      showToast("Comment must be at least 10 characters", "error");
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(`/api/products/${productId}/reviews`, {
        rating,
        comment: comment.trim(),
      });

      showToast(res.data.message || "Review added successfully!", "success");

      // Reset form
      setRating(0);
      setComment("");

      // Notify parent to refresh reviews
      if (onReviewAdded) {
        onReviewAdded(res.data);
      }

      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit review";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 max-w-md w-full p-5 sm:p-7 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Write a Review
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Share your genuine feedback with other shoppers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shrink-0"
            title="Close"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Star Rating Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              {currentDisplayRating > 0 && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 animate-fade-in">
                  {RATING_LABELS[currentDisplayRating]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl sm:text-3xl transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                    title={`${star} Star${star > 1 ? "s" : ""}`}
                  >
                    <FaStar
                      className={`transition-colors duration-150 ${
                        active ? "text-amber-400 drop-shadow-2xs" : "text-slate-200 hover:text-amber-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Your Review <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] font-medium ${comment.length >= 10 ? "text-slate-400" : "text-amber-600"}`}>
                {comment.length}/500 {comment.length < 10 ? `(min 10 chars)` : ""}
              </span>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product? (Fit, material, build quality, etc.)"
              rows={4}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none text-xs sm:text-sm resize-none placeholder:text-slate-400 leading-relaxed transition"
              maxLength={500}
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-black transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}