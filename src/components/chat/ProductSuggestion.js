import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ShoppingCart, Sparkles } from "lucide-react";
import { formatINR } from "../../utils/format";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholder";

// One product the assistant suggests: tap to open it, or add it to the bag from the card.
export default function ProductSuggestion({ product, isTopPick, onOpen, onAdd }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(product)}
      className={`relative flex cursor-pointer gap-2.5 sm:gap-3.5 rounded-xl border bg-[#fffdf8] p-2.5 sm:p-3 transition-all
        ${
          isTopPick
            ? "border-[#a85d37]/30 ring-1 ring-[#a85d37]/10 shadow-sm"
            : "border-black/[0.06] hover:border-black/15 shadow-xs"
        }`}
    >
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-lg border border-black/[0.05] bg-[#eeeae2] p-1">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-contain mix-blend-multiply"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-1.5">
          <h4 className="line-clamp-1 text-xs sm:text-sm font-bold text-[#1d1c19]">
            {product.title}
          </h4>
          {isTopPick && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#a85d37] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
              <Sparkles size={7} /> Top Pick
            </span>
          )}
        </div>
        <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-[#817c73] mt-0.5">
          {product.brand ? `${product.brand} · ` : ""}
          {product.category || "VKart"}
        </p>
        {product.reason && !isTopPick && (
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#5f5b52]">
            {product.reason}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs sm:text-sm font-bold text-[#1d1c19]">
            {formatINR(product.price)}
          </span>
          <span
            className={`text-[9px] font-bold ${product.stock > 0 ? "text-[#5f6a52]" : "text-[#a85d37]"}`}
          >
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>
      </div>

      <div className="self-center flex flex-col items-center gap-1">
        <button
          onClick={(e) => onAdd(e, product)}
          className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-[#1d1c19] text-white transition-colors hover:bg-black active:scale-95"
          title="Add to bag"
          aria-label={`Add ${product.title} to bag`}
        >
          <ShoppingCart size={12} />
        </button>
        <ChevronRight size={12} className="text-[#aaa49a]" />
      </div>
    </motion.div>
  );
}
