import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { removeFromWishlist, clearWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import {
  FaHeart,
  FaTrash,
  FaCartPlus,
  FaShoppingBag,
} from "react-icons/fa";
import { showToast } from "../utils/toast";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const keyOf = (it) => it?._id || it?.productId || it?.externalId || it?.id;

export default function Wishlist() {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist);

  const moveToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    dispatch(removeFromWishlist(keyOf(item)));
    showToast("Moved to cart", "success");
  };

  if (!wishlist.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-gray-50/50">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm mb-6">
          <FaHeart size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Your wishlist is empty</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">
          Save items you love and come back to them anytime.
        </p>
        <Link
          to="/products"
          className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 text-sm mt-1">
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <button
            onClick={() => {
              dispatch(clearWishlist());
              showToast("Wishlist cleared", "success");
            }}
            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((item) => {
            const k = keyOf(item);
            const selling = item.price || 0;
            const mrp = item.discountPercentage
              ? selling / (1 - item.discountPercentage / 100)
              : null;
            return (
              <div
                key={k}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <Link to={`/product/${item._id || item.productId || item.id}`}>
                  <div className="aspect-square bg-gray-50 p-6 relative">
                    <img
                      src={item.thumbnail || item.images?.[0]}
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.discountPercentage > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        -{Math.round(item.discountPercentage)}%
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4 space-y-3">
                  <Link to={`/product/${item._id || item.productId || item.id}`}>
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-snug hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-gray-900">{INR(selling)}</span>
                    {mrp && (
                      <span className="text-xs text-gray-400 line-through">{INR(mrp)}</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-sm"
                    >
                      <FaCartPlus size={12} /> Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        dispatch(removeFromWishlist(k));
                        showToast("Removed from wishlist", "success");
                      }}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaShoppingBag size={14} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
