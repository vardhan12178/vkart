import React from "react";
import { Link } from "react-router-dom";
import ProductRail from "./product/ProductRail";
import { useQuery } from "@tanstack/react-query";
import axios from "./axiosInstance";
import { qk } from "../query/queryKeys";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

/**
 * "Recommended for You" storefront row. Pulls from /api/recommendations/for-you,
 * which returns a personalised feed for logged-in users (taste vector from their
 * orders/cart/wishlist) and trending picks for everyone else. Hidden entirely
 * when there aren't enough items to make a meaningful row.
 */
export default function RecommendedForYou() {
  const { data } = useQuery({
    queryKey: qk.recommendations.forYou,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const res = await axios.get("/api/recommendations/for-you", {
        params: { limit: 12 },
        signal,
      });
      return res.data;
    },
  });

  const products = data?.products || [];
  const personalized = data?.personalized;

  if (products.length < 4) return null;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">
              {personalized ? "Picked for you" : "Trending now"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 tracking-tight">
              {personalized ? "Recommended for You" : "Popular Picks"}
            </h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-gray-900 hover:underline shrink-0">
            View All
          </Link>
        </div>

        <ProductRail
          label={personalized ? "Recommended for you" : "Popular picks"}
          items={products}
          className="-mx-2"
          slideClassName="basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 px-2 py-2"
          renderItem={(p) => (
                  <Link
                    to={`/product/${p._id}`}
                    className="group block bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all h-full"
                  >
                    <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.discountPercentage > 0 && (
                        <span className="absolute top-2 right-2 bg-white text-gray-900 text-[10px] font-bold px-2 py-1 rounded-sm shadow-xs">
                          -{Math.round(p.discountPercentage)}%
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 truncate text-sm mb-1">{p.title}</h4>
                    <div className="font-bold text-gray-900">{INR(p.price)}</div>
                  </Link>
          )}
        />
      </div>
    </section>
  );
}
