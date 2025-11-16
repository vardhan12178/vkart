import React from "react";
import { Link } from "react-router-dom";

export default function CheckoutPreview() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Login Required
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        Please sign in to continue with your checkout and place your order.
      </p>

      <Link
        to="/login"
        className="rounded-xl bg-orange-600 px-6 py-3 text-white font-semibold hover:opacity-95 shadow"
      >
        Sign in to Proceed
      </Link>
    </div>
  );
}
