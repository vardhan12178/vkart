import React, { useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaCartPlus, FaTimes, FaCheckCircle, FaTag } from "react-icons/fa";

/* ---------- UTILS ---------- */
const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount ?? 0));
};

const ProductModal = ({ product, onClose, onAddToCart }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!product) return null;

  const renderStars = (rating) => {
    const validRating = rating?.rate || 0;
    const fullStars = Math.floor(validRating);
    const halfStar = validRating % 1 >= 0.5 ? 1 : 0;
    
    return (
      <div className="flex items-center gap-0.5 text-amber-400 text-sm">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) return <FaStar key={index} />;
          if (index === fullStars && halfStar) return <FaStarHalfAlt key={index} />;
          return <FaRegStar key={index} className="text-gray-200" />;
        })}
      </div>
    );
  };

  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
        >
          <FaTimes size={18} />
        </button>

        {/* Left Column: Image */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[300px] md:max-h-[400px] w-full object-contain mix-blend-multiply"
            loading="lazy"
          />
          {/* Discount Badge (Dummy logic for visual) */}
          <span className="absolute top-6 left-6 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
            New Arrival
          </span>
        </div>

        {/* Right Column: Details */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white flex flex-col">
          
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              <FaTag size={10} /> {product.category}
            </span>
            <div className="flex items-center gap-2">
               {renderStars(product.rating)}
               <span className="text-xs font-bold text-gray-500">
                 ({product.rating?.count || 0} Reviews)
               </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
            {product.title}
          </h2>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <FaCheckCircle size={10} /> In Stock
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-gray-600 leading-relaxed mb-8">
            <p>{product.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <FaCartPlus /> Add to Cart
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Free shipping on all orders • 30-day return policy
            </p>
          </div>

        </div>
      </div>

      {/* Animation Styles (Embedded) */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ProductModal;