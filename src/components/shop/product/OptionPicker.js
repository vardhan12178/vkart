import React from "react";
import { visibleOptions } from "../shopItems";
import { imagesFor } from "../catalogApi";

export default function OptionPicker({ p, opts, exists, pick, hasSizeGuide, onSizeGuide }) {
  return (
    <>
      {visibleOptions(p).map((o) => {
        const byImage = o.name === p.media.groupBy && Object.keys(p.media.groups || {}).length > 0;
        return (
          <div key={o.name} className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {o.name}: <span className="font-normal text-muted">{opts[o.name]}</span>
              </p>
              {o.name === "Size" && hasSizeGuide && (
                <button
                  type="button"
                  onClick={() => onSizeGuide()}
                  className="text-xs font-semibold text-accent underline underline-offset-4"
                >
                  Size guide
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {o.values.map((val) => {
                const active = opts[o.name] === val.value;
                const ok = exists(o.name, val.value);
                const thumb = byImage ? imagesFor(p, val.value)[0] : null;
                if (thumb) {
                  return (
                    <button
                      key={val.value}
                      type="button"
                      title={val.value}
                      onClick={() => pick(o.name, val.value)}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 bg-white p-1 ${active ? "border-accent" : "border-line hover:border-gray-400"} ${ok ? "" : "opacity-40"}`}
                    >
                      <img
                        src={thumb.thumb}
                        alt={val.value}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    </button>
                  );
                }
                if (o.name === "Color" && val.hex) {
                  return (
                    <button
                      key={val.value}
                      type="button"
                      title={val.value}
                      aria-label={val.value}
                      onClick={() => pick(o.name, val.value)}
                      className={`h-9 w-9 rounded-full border-2 ring-2 ring-offset-2 ${active ? "ring-accent" : "ring-transparent"} border-white ${ok ? "" : "opacity-40"}`}
                      style={{ background: val.hex }}
                    />
                  );
                }
                return (
                  <button
                    key={val.value}
                    type="button"
                    onClick={() => pick(o.name, val.value)}
                    className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm transition ${active ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink"} ${ok ? "" : "text-gray-400 line-through opacity-60"}`}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
