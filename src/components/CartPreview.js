import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faLock } from "@fortawesome/free-solid-svg-icons";

export default function CartPreview() {
  return (
    <div className="min-h-screen bg-[#f9fafb] py-10 sm:py-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-8 sm:p-10 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white shadow-md grid place-items-center ring-4 ring-white">
              <FontAwesomeIcon icon={faShoppingCart} className="text-orange-600 text-4xl" />
            </div>

            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
              Your Cart
            </h1>

            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Sign in to view items in your cart and proceed to checkout.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-10 bg-white text-center">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Add products to your cart and continue shopping seamlessly once you log in.
            Your cart will automatically sync with your account.
          </p>

          <Link
            to="/login?redirect=/cart"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 text-white px-6 py-3 text-sm sm:text-base font-semibold shadow hover:bg-orange-700 transition"
          >
            <FontAwesomeIcon icon={faLock} /> Sign In to Access Cart
          </Link>

          <div className="mt-4">
            <Link
              to="/products"
              className="text-orange-600 font-semibold text-sm sm:text-base hover:underline"
            >
              Continue browsing products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
