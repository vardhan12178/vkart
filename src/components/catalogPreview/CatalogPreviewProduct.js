import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { products, defaultVariant, imagesFor, discountPercent, formatPrice } from "./catalogData";

function SpecValue({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {value.map((x, i) => <li key={i}>{String(x)}</li>)}
      </ul>
    );
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

const label = (k) => k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export default function CatalogPreviewProduct() {
  const { slug } = useParams();
  const p = products.find((x) => x.slug === slug);
  const start = p ? defaultVariant(p) : null;
  const [opts, setOpts] = useState(start ? start.options : {});
  const [imgIdx, setImgIdx] = useState(0);

  const variant = useMemo(
    () => p && p.variants.find((v) => Object.entries(opts).every(([k, val]) => v.options[k] === val)),
    [p, opts]
  );

  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg">Product not found.</p>
        <Link to="/catalog-preview" className="mt-4 inline-block text-blue-600 underline">Back to preview list</Link>
      </div>
    );
  }

  const images = imagesFor(p, opts[p.media.groupBy]);
  const main = images[Math.min(imgIdx, images.length - 1)];
  const exists = (name, value) =>
    p.variants.some((v) => v.options[name] === value &&
      Object.entries(opts).every(([k, val]) => k === name || v.options[k] === val));
  const pick = (name, value) => {
    let next = { ...opts, [name]: value };
    if (!p.variants.some((v) => Object.entries(next).every(([k, val]) => v.options[k] === val))) {
      next = p.variants.find((v) => v.options[name] === value).options;
    }
    setOpts(next);
    if (name === "Color") setImgIdx(0);
  };
  const off = variant ? discountPercent(variant) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Helmet>
        <title>{`${p.title} · Catalog v2 preview | VKart`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <Link to="/catalog-preview" className="text-sm text-gray-500 hover:text-gray-900">← All preview phones</Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {main && <img src={main.src} alt={main.alt} referrerPolicy="no-referrer" className="h-full w-full object-contain p-6" />}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((im, i) => (
              <button key={im.src} type="button" onClick={() => setImgIdx(i)}
                className={`h-20 w-20 flex-none overflow-hidden rounded-lg border bg-gray-50 ${i === imgIdx ? "border-gray-900" : "border-gray-200"}`}>
                <img src={im.thumb} alt={im.alt} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{p.brand}</p>
          <h1 className="text-3xl font-bold text-gray-900">{p.title}</h1>
          <p className="mt-2 text-gray-600">{p.shortDescription}</p>

          <div className="mt-5">
            {variant ? (
              <>
                <span className="text-3xl font-bold text-gray-900">{formatPrice(variant.price)}</span>
                {off > 0 && <span className="ml-3 text-lg text-gray-400 line-through">{formatPrice(variant.mrp)}</span>}
                {off > 0 && <span className="ml-2 text-lg font-semibold text-green-600">{off}% off</span>}
                <p className="mt-1 text-xs text-gray-500">SKU {variant.sku}{variant.mpn ? ` · Model ${variant.mpn}` : ""}</p>
              </>
            ) : (
              <span className="text-lg text-gray-500">This combination is not available</span>
            )}
          </div>

          {p.variantOptions.map((o) => (
            <div key={o.name} className="mt-6">
              <p className="text-sm font-semibold text-gray-900">
                {o.name}: <span className="font-normal text-gray-600">{opts[o.name]}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {o.values.map((val) => {
                  const active = opts[o.name] === val.value;
                  const ok = exists(o.name, val.value);
                  return o.name === "Color" ? (
                    <button key={val.value} type="button" title={val.value} onClick={() => pick(o.name, val.value)}
                      className={`h-9 w-9 rounded-full border-2 ${active ? "border-gray-900" : "border-gray-200"} ${ok ? "" : "opacity-40"}`}
                      style={{ background: val.hex || "#ddd" }} aria-label={val.value} />
                  ) : (
                    <button key={val.value} type="button" onClick={() => pick(o.name, val.value)}
                      className={`rounded-lg border px-4 py-2 text-sm ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-800"} ${ok ? "" : "opacity-40"}`}>
                      {val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ul className="mt-8 space-y-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-gray-800"><span className="text-green-600">✓</span>{h}</li>
            ))}
          </ul>

          {p.inTheBox?.length > 0 && (
            <div className="mt-6 text-sm text-gray-700">
              <span className="font-semibold">In the box:</span> {p.inTheBox.join(", ")}
            </div>
          )}
          {p.warranty && <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Warranty:</span> {p.warranty}</p>}
        </div>
      </div>

      {/* Description */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900">About this phone</h2>
        {p.description.split("\n\n").map((para, i) => <p key={i} className="mt-3 text-gray-700">{para}</p>)}
      </section>

      {/* Specs */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">Specifications</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          {Object.entries(p.specs).map(([group, fields]) => (
            <div key={group} className="grid border-b border-gray-200 last:border-0 md:grid-cols-[200px_1fr]">
              <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">{group}</div>
              <dl className="divide-y divide-gray-100">
                {Object.entries(fields).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2 text-sm">
                    <dt className="text-gray-500">{label(k)}</dt>
                    <dd className="text-gray-900"><SpecValue value={v} /></dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 text-xs text-gray-500">
        Source: {p.source.urls.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" className="mr-3 underline">{new URL(u).hostname}</a>)}
        · collected {p.source.fetchedAt}. {p.source.notes}
      </section>
    </div>
  );
}
