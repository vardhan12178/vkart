import React from 'react';
import { FaStar, FaCartPlus } from 'react-icons/fa';

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
    <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto modal-content">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ×
        </button>
      </div>
      <div className="flex justify-center items-center mb-4">
        <img
          src={product.image}
          alt={product.title}
          className="max-h-96 object-contain"
          loading="lazy"
        />
      </div>
      <div className="text-gray-700 mb-6">
        <p>{product.description}</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center mb-6 space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex items-center">
          {renderStars(product.rating.rate)}
          <span className="text-gray-700 text-sm font-semibold ml-2">{product.rating.rate.toFixed(1)}</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">₹{(product.price * 75).toFixed(2)}</div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleAddToCart}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
        >
          <FaCartPlus /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductModal;