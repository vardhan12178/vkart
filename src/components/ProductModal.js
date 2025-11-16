import React from "react";
import { FaStar, FaCartPlus } from "react-icons/fa";

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={index} className="text-yellow-500 text-lg" />
        ))}
        {halfStar === 1 && <FaStar className="text-yellow-500 text-lg" />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaStar key={index} className="text-gray-300 text-lg" />
        ))}
      </div>
    );
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="modal-content max-w-2xl w-full mx-auto rounded-3xl bg-white/95 border border-gray-100 shadow-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
          {product.title}
        </h2>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg leading-none hover:bg-gray-200 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Image */}
      <div className="mb-5 flex justify-center items-center">
        <div className="w-full max-h-96 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-80 w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 text-sm sm:text-base text-gray-700 leading-relaxed">
        <p>{product.description}</p>
      </div>

      {/* Rating + Price */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
        <div className="flex items-center">
          {renderStars(product.rating.rate)}
          <span className="ml-2 text-sm font-semibold text-gray-700">
            {product.rating.rate.toFixed(1)}
          </span>
        </div>
        <div className="text-2xl font-extrabold text-orange-600">
          ₹{(product.price * 75).toFixed(2)}
        </div>
      </div>

      {/* CTA – matches card style */}
      <div className="flex justify-center">
        <button
          onClick={handleAddToCart}
          className="inline-flex w-full max-w-xs items-center justify-center gap-2
                     rounded-full bg-orange-500 px-8 py-3 text-sm sm:text-base font-semibold text-white
                     shadow-[0_8px_20px_rgba(249,115,22,0.35)]
                     transition-all duration-150
                     hover:bg-orange-600 hover:-translate-y-0.5
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80"
        >
          <FaCartPlus className="text-base" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
