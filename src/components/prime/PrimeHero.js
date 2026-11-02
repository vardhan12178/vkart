import React from "react";
import { FaCrown } from "react-icons/fa";

export default function PrimeHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.15),transparent_50%)]" />
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
          <FaCrown className="text-amber-400" />
          <span className="text-sm font-bold text-amber-300">VKart Prime</span>
        </div>
        <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-normal mb-6 leading-[0.9] tracking-[-0.04em]">
          More of what matters.
          <br />
          Less of what doesn’t.
        </h1>
        <p className="text-white/55 text-lg max-w-xl mx-auto">
          Considered benefits, earlier access, and better value across the things you already want.
        </p>
      </div>
    </div>
  );
}
