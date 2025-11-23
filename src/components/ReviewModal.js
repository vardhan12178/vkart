import React, { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import axios from "./axiosInstance";
import { showToast } from "../utils/toast";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition"
        >
          <FaTimes size={20} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h2>
        <p className="text-gray-500 text-sm mb-6">Share your thoughts with other customers</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-transform hover:scale-110 active:scale-95"
                >
                  <FaStar
                    className={
                      star <= (hoverRating || rating)
                        ? "text-amber-400"
                        : "text-gray-200"
                    }
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with this product... (minimum 10 characters)"
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none text-sm"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}