import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ShoppingCartIcon } from "../ui/icons";

export default function EmptyBag() {
  return (
    <div className="premium-page premium-cart min-h-screen bg-[#f6f3ed] flex items-center justify-center p-4">
      <div className="text-center animate-fade-up-quick max-w-md">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShoppingCartIcon className="text-3xl text-accent" />
        </div>
        <h2 className="font-editorial text-3xl sm:text-5xl font-normal text-[#1d1c19] mb-2">
          Your bag is waiting.
        </h2>
        <p className="text-[#777269] text-xs sm:text-sm mb-6">
          You haven’t added anything yet. Start with the latest edit.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 bg-[#1d1c19] text-white px-6 py-3 rounded-full text-xs font-bold shadow-lg hover:bg-black transition-colors"
        >
          Explore the collection <ArrowRightIcon size={12} />
        </Link>
      </div>
    </div>
  );
}
