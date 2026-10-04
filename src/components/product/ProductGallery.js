import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Arrow = ({ direction, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "next" ? "Next image" : "Previous image"}
    className={`absolute top-1/2 -translate-y-1/2 z-20 ${direction === "next" ? "right-4" : "left-4"
      } h-10 w-10 rounded-full bg-white shadow-lg items-center justify-center text-gray-900 hover:scale-110 transition-all active:scale-95 hidden md:flex disabled:opacity-40`}
  >
    {direction === "next" ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
  </button>
);

/**
 * Product image gallery: fading main viewer with hover zoom, plus a synced
 * thumbnail strip. Swipe/drag on touch, arrows on desktop, keyboard arrows
 * when focused.
 */
export default function ProductGallery({ images, title, children }) {
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true }, [Fade()]);
  const [thumbsRef, thumbsApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState({ enabled: false, x: 0, y: 0 });

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelected(index);
    thumbsApi?.scrollTo(index);
  }, [mainApi, thumbsApi]);

  useEffect(() => {
    if (!mainApi) return undefined;
    onSelect();
    mainApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  // New product (same component instance): back to the first image.
  useEffect(() => {
    mainApi?.scrollTo(0, true);
  }, [images, mainApi]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") mainApi?.scrollPrev();
    if (e.key === "ArrowRight") mainApi?.scrollNext();
  };

  const many = images.length > 1;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-xs border border-gray-100 relative">
      {/* Main display area */}
      <div
        className="relative group rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 aspect-square max-h-[350px] lg:max-h-[450px] w-full mx-auto"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} images`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="h-full overflow-hidden" ref={mainRef}>
          <div className="flex h-full touch-pan-y">
            {images.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${images.length}`}
              >
                <div
                  className="w-full h-full flex items-center justify-center cursor-zoom-in p-4 sm:p-6"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setZoom((z) => ({ ...z, x, y }));
                  }}
                  onMouseEnter={() => setZoom((z) => ({ ...z, enabled: true }))}
                  onMouseLeave={() => setZoom({ enabled: false, x: 0, y: 0 })}
                >
                  <img
                    src={img}
                    alt={i === 0 ? title : `${title} — view ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchpriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                    draggable={false}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
                  />
                  {zoom.enabled && i === selected && (
                    <div
                      className="hidden lg:block absolute inset-0 bg-no-repeat bg-white pointer-events-none z-10"
                      style={{
                        backgroundImage: `url(${img})`,
                        backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                        backgroundSize: "200%",
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {many && (
          <>
            <Arrow direction="prev" onClick={() => mainApi?.scrollPrev()} />
            <Arrow direction="next" onClick={() => mainApi?.scrollNext()} />
          </>
        )}

        {children}
      </div>

      {/* Thumbnails */}
      {many && (
        <div className="mt-3 sm:mt-4 px-1 sm:px-2 overflow-hidden" ref={thumbsRef}>
          <div className="flex">
            {images.map((img, i) => (
              <button
                type="button"
                key={`${img}-thumb-${i}`}
                onClick={() => mainApi?.scrollTo(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === selected ? "true" : undefined}
                className="min-w-0 shrink-0 grow-0 basis-1/4 md:basis-1/5 px-1 md:px-2 cursor-pointer outline-hidden"
              >
                <div
                  className={`h-14 sm:h-16 w-full rounded-lg sm:rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden hover:border-gray-900 transition-all ${i === selected ? "border-gray-900" : "border-gray-100"
                    }`}
                >
                  <img src={img} className="h-full w-full object-contain p-1 mix-blend-multiply" alt="" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
