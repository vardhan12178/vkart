import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import ProductSuggestion from "./ProductSuggestion";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// "Try 'x'" / "Or 'x'" bullets are clickable suggestions; the quoted part is what gets sent
const isSuggestion = (point) => /try '|or '/i.test(point);
const promptFrom = (point) => point.replace(/^(Try|Or)\s*['"](.*)['"]\s*$/i, "$2");

// One answer from the assistant: greeting, summary with bullets, the reason for the top pick,
// product cards, alternatives and a follow-up question.
export default function BotMessage({ message, onPrompt, onOpenProduct, onAddProduct }) {
  const { structured, products } = message;
  if (!structured) return null;
  const { greeting, response, recommendation, alternatives, followUp } = structured;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-3 max-w-[95%] w-full"
    >
      {greeting && (
        <motion.div
          variants={item}
          className="flex w-fit items-center gap-1.5 self-start rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-3 py-1 text-[11px] font-bold text-[#75462f]"
        >
          <Sparkles size={11} className="text-[#a85d37]" />
          {greeting}
        </motion.div>
      )}

      {response && (
        <motion.div variants={item} className="relative group">
          <div className="rounded-2xl rounded-tl-sm border border-black/[0.06] bg-[#fffdf8] p-3.5 sm:p-4 text-[#1d1c19] shadow-sm">
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#433f38]">
              {response.summary}
            </p>

            {response.points?.length > 0 && (
              <ul className="mt-2.5 space-y-1.5">
                {response.points.map((point, i) => (
                  <motion.li
                    key={i}
                    variants={item}
                    className="flex items-start gap-2 border-t border-black/[0.05] pt-2 text-xs text-[#6f6b62]"
                  >
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a85d37]" />
                    {isSuggestion(point) ? (
                      <button
                        type="button"
                        onClick={() => onPrompt(promptFrom(point))}
                        className="text-left text-xs font-semibold text-[#a85d37] hover:underline"
                      >
                        {point}
                      </button>
                    ) : (
                      <span className="leading-snug">{point}</span>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}

      {recommendation?.reason && (
        <motion.div
          variants={item}
          className="flex gap-2.5 rounded-xl border border-[#a85d37]/15 bg-[#eee8df] p-3 text-xs text-[#5f5a52]"
        >
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#a85d37]" />
          <p className="font-medium leading-relaxed">
            <span className="mb-0.5 block font-bold text-[#1d1c19]">Why this pick?</span>
            {recommendation.reason}
          </p>
        </motion.div>
      )}

      {products?.length > 0 && (
        <motion.div variants={item} className="pt-1 grid gap-2 sm:gap-2.5">
          {products.map((product, i) => (
            <ProductSuggestion
              key={product._id}
              product={product}
              isTopPick={recommendation?.productIndex === i + 1}
              onOpen={onOpenProduct}
              onAdd={onAddProduct}
            />
          ))}
        </motion.div>
      )}

      {alternatives?.length > 0 && (
        <motion.div variants={item} className="flex flex-wrap gap-1.5 pt-1">
          <span className="mb-0.5 w-full text-[9px] font-bold uppercase tracking-wider text-[#8e887e]">
            Also consider:
          </span>
          {alternatives.map((alt, i) => (
            <button
              key={i}
              onClick={() => onPrompt(alt)}
              className="rounded-full border border-black/[0.08] bg-transparent px-2.5 py-1 text-[11px] text-[#5f5a52] transition-colors hover:bg-black/[0.04]"
            >
              {alt}
            </button>
          ))}
        </motion.div>
      )}

      {followUp && (
        <motion.button
          variants={item}
          onClick={() => onPrompt(followUp)}
          className="group mt-1 flex w-full items-center justify-between rounded-full bg-[#1d1c19] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-black"
        >
          <span>{followUp}</span>
          <ArrowRight
            size={14}
            className="text-[#d7d1c7] transition-transform group-hover:translate-x-1"
          />
        </motion.button>
      )}
    </motion.div>
  );
}
