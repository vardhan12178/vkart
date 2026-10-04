import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal, swipeable strip of product cards ("You might also like",
 * "Recommended for you"). Slide widths come from `slideClassName` (Tailwind
 * basis-* per breakpoint); arrows appear from sm up and disable at the ends.
 */
export default function ProductRail({ items, renderItem, slideClassName, label, className = "" }) {
  const [viewportRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", slidesToScroll: "auto" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return undefined;
    update();
    api.on("select", update).on("reInit", update);
    return () => {
      api.off("select", update).off("reInit", update);
    };
  }, [api, update]);

  const arrow =
    "absolute top-1/2 z-10 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-all hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className={`relative ${className}`} role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="overflow-hidden" ref={viewportRef}>
        <div className="flex touch-pan-y">
          {items.map((item, i) => (
            <div key={item._id || i} className={`min-w-0 shrink-0 grow-0 ${slideClassName}`}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
      <button type="button" aria-label="Previous" onClick={() => api?.scrollPrev()} disabled={!canPrev} className={`${arrow} -left-3`}>
        <ChevronLeft size={14} />
      </button>
      <button type="button" aria-label="Next" onClick={() => api?.scrollNext()} disabled={!canNext} className={`${arrow} -right-3`}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
