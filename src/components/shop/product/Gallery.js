import React, { useEffect, useRef, useState } from "react";

export default function Gallery({ images, idx, setIdx }) {
  const [zoom, setZoom] = useState(null);
  const strip = useRef(null);
  const main = images[Math.min(idx, images.length - 1)];

  useEffect(() => {
    const el = strip.current;
    if (el && el.clientWidth) el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, [idx]);

  if (!main) return <div className="aspect-square rounded-2xl bg-[#f4f0e8]" />;
  return (
    <div className="lg:sticky lg:top-24">
      {/* Mobile: swipe */}
      <div className="mx-auto max-w-lg lg:hidden">
        <div
          ref={strip}
          tabIndex={0}
          role="region"
          aria-label="Product images"
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-white [scrollbar-width:none]"
          onScroll={(e) => {
            const w = e.currentTarget.clientWidth;
            const i = Math.round(e.currentTarget.scrollLeft / w);
            if (i !== idx) setIdx(i);
          }}
        >
          {images.map((im, i) => (
            <div
              key={`${im.md}-${i}`}
              className="flex aspect-square w-full flex-none snap-center items-center justify-center"
            >
              <img
                src={im.md}
                alt={im.alt}
                loading={i ? "lazy" : "eager"}
                fetchpriority={i ? undefined : "high"}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-6"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-ink" : "w-1.5 bg-gray-300"}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: thumbs + hover zoom */}
      <div className="hidden gap-4 lg:flex">
        <div className="flex max-h-[560px] w-[72px] flex-none flex-col gap-2 overflow-y-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((im, i) => (
            <button
              key={`${im.md}-${i}`}
              type="button"
              onMouseEnter={() => setIdx(i)}
              onClick={() => setIdx(i)}
              className={`aspect-square w-full flex-none overflow-hidden rounded-lg border-2 bg-white ${i === idx ? "border-accent" : "border-transparent hover:border-gray-300"}`}
            >
              <img
                src={im.thumb}
                alt={im.alt}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
        <div
          className="relative flex aspect-square flex-1 cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-line bg-white"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }}
          onMouseLeave={() => setZoom(null)}
        >
          <img
            src={zoom ? main.lg : main.md}
            alt={main.alt}
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-8 transition-transform duration-150"
            style={
              zoom
                ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
