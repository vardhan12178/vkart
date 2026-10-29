import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiChevronRight, FiChevronDown, FiTruck, FiRotateCcw, FiShield, FiLock, FiCheck, FiStar, FiShoppingCart, FiZap } from "react-icons/fi";
import BrandSelect from "./BrandSelect";
import { products, defaultVariant, imagesFor, discountPercent, formatPrice, minPrice, CATEGORIES, catOf } from "./catalogData";

// Catalog v2 product page (preview). Data comes from the bundled JSON for now;
// the v2 API will feed the same shape later.

const INK = "#1d1c19";
const ACCENT = "#a85d37";
const RECENT_KEY = "cv2-recent";

const ACRONYMS = /^(ppi|cpu|gpu|ram|ssd|hdr|usb|nfc|os|ip|led|oled|lcd|anc|spf|gps|sim|esim|bt|wifi|ai|mrp)$/i;
const label = (k) =>
  k.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").map((w) => (ACRONYMS.test(w) ? w.toUpperCase() : w)).join(" ").replace(/^./, (c) => c.toUpperCase());

function SpecValue({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {value.map((x, i) => <li key={i}>{String(x)}</li>)}
      </ul>
    );
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") return Object.entries(value).map(([k, v]) => `${label(k)}: ${v}`).join(", ");
  return String(value);
}

function readRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function pushRecent(slug) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...readRecent().filter((s) => s !== slug)].slice(0, 12))); } catch { /* storage unavailable */ }
}

/* ------------ Gallery ------------ */
function Gallery({ images, idx, setIdx }) {
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
        <div ref={strip} className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-white [scrollbar-width:none]"
          onScroll={(e) => { const w = e.currentTarget.clientWidth; const i = Math.round(e.currentTarget.scrollLeft / w); if (i !== idx) setIdx(i); }}>
          {images.map((im, i) => (
            <div key={`${im.src}-${i}`} className="flex aspect-square w-full flex-none snap-center items-center justify-center">
              <img src={im.src} alt={im.alt} loading={i ? "lazy" : "eager"} referrerPolicy="no-referrer" className="h-full w-full object-contain p-6" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} type="button" aria-label={`Image ${i + 1}`} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-[#1d1c19]" : "w-1.5 bg-gray-300"}`} />
          ))}
        </div>
      </div>

      {/* Desktop: thumbs + hover zoom */}
      <div className="hidden gap-4 lg:flex">
        <div className="flex max-h-[560px] w-[72px] flex-none flex-col gap-2 overflow-y-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((im, i) => (
            <button key={`${im.src}-${i}`} type="button" onMouseEnter={() => setIdx(i)} onClick={() => setIdx(i)}
              className={`aspect-square w-full flex-none overflow-hidden rounded-lg border-2 bg-white ${i === idx ? "border-[#a85d37]" : "border-transparent hover:border-gray-300"}`}>
              <img src={im.thumb} alt={im.alt} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
        <div
          className="relative flex aspect-square flex-1 cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-[#ebe5da] bg-white"
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
          onMouseLeave={() => setZoom(null)}>
          <img src={zoom ? main.lg : main.src} alt={main.alt} referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-8 transition-transform duration-150"
            style={zoom ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
        </div>
      </div>
    </div>
  );
}

/* ------------ Small cards ------------ */
function MiniCard({ p }) {
  const v = defaultVariant(p);
  const img = imagesFor(p, v.options[p.media.groupBy])[0];
  const off = discountPercent(v);
  return (
    <Link to={`/catalog-preview/${p.slug}`} className="group flex w-44 flex-none flex-col rounded-xl border border-[#ebe5da] bg-white p-3 transition hover:shadow-md sm:w-52">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#faf8f3]">
        {img && <img src={img.thumb} alt={img.alt} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain p-2 transition group-hover:scale-105" />}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#8b867d]">{p.brand}</p>
      <p className="line-clamp-2 text-sm font-medium text-[#1d1c19]">{p.title.replace(`${p.brand} `, "")}</p>
      <p className="mt-1 text-sm">
        <span className="font-bold text-[#1d1c19]">{formatPrice(minPrice(p))}</span>
        {off > 0 && <span className="ml-1.5 text-xs font-semibold text-green-700">{off}% off</span>}
      </p>
    </Link>
  );
}

function Rail({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-[#1d1c19]">{title}</h2>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => <MiniCard key={p.slug} p={p} />)}
      </div>
    </section>
  );
}

/* ------------ Page ------------ */
export default function CatalogPreviewProduct() {
  const { slug } = useParams();
  const p = products.find((x) => x.slug === slug);
  const [opts, setOpts] = useState(p ? defaultVariant(p).options : {});
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");
  const [allSpecs, setAllSpecs] = useState(false);
  const [recent, setRecent] = useState([]);

  // Reset state when navigating between products
  useEffect(() => {
    if (!p) return;
    setOpts(defaultVariant(p).options);
    setImgIdx(0);
    setQty(1);
    setNotice("");
    setAllSpecs(false);
    setRecent(readRecent().filter((s) => s !== p.slug));
    pushRecent(p.slug);
    window.scrollTo(0, 0);
  }, [p]);

  const variant = useMemo(
    () => p && p.variants.find((v) => Object.entries(opts).every(([k, val]) => v.options[k] === val)),
    [p, opts]
  );

  const similar = useMemo(() => {
    if (!p) return [];
    const price = minPrice(p);
    return products
      .filter((x) => x.slug !== p.slug && catOf(x) === catOf(p))
      .sort((a, b) => Math.abs(minPrice(a) - price) - Math.abs(minPrice(b) - price))
      .slice(0, 12);
  }, [p]);

  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg">Product not found.</p>
        <Link to="/catalog-preview" className="mt-4 inline-block underline">Back to the catalog</Link>
      </div>
    );
  }

  const cat = catOf(p);
  const images = imagesFor(p, opts[p.media.groupBy]);
  const off = variant ? discountPercent(variant) : 0;
  const available = variant && variant.keySpecs?.available !== false;

  const exists = (name, value) =>
    p.variants.some((v) => v.options[name] === value &&
      Object.entries(opts).every(([k, val]) => k === name || v.options[k] === val));
  const pick = (name, value) => {
    let next = { ...opts, [name]: value };
    if (!p.variants.some((v) => Object.entries(next).every(([k, val]) => v.options[k] === val))) {
      next = p.variants.find((v) => v.options[name] === value).options;
    }
    setOpts(next);
    if (name === p.media.groupBy) setImgIdx(0);
    setNotice("");
  };
  const buy = (kind) =>
    setNotice(kind === "cart"
      ? "Preview only: the cart connects when this page moves to the v2 API."
      : "Preview only: checkout connects when this page moves to the v2 API.");

  const specGroups = Object.entries(p.specs || {}).filter(([, f]) => f && Object.keys(f).length);
  // Collapsed view: first two groups, at most 12 rows in total
  const SPEC_ROWS = 12;
  const totalRows = specGroups.reduce((n, [, f]) => n + Object.keys(f).length, 0);
  const shownGroups = allSpecs ? specGroups : specGroups.slice(0, 2).reduce((acc, [g, f]) => {
    const left = SPEC_ROWS - acc.reduce((n, [, x]) => n + Object.keys(x).length, 0);
    if (left > 0) acc.push([g, Object.fromEntries(Object.entries(f).slice(0, left))]);
    return acc;
  }, []);
  const collapsed = !allSpecs && (specGroups.length > 2 || totalRows > SPEC_ROWS);
  const recentItems = recent.map((s) => products.find((x) => x.slug === s)).filter(Boolean);
  const policies = [
    { icon: FiTruck, text: "Free delivery over ₹499" },
    { icon: FiRotateCcw, text: "7-day easy returns" },
    { icon: FiShield, text: p.warranty ? p.warranty.replace(/^./, (c) => c.toUpperCase()) : "Brand warranty" },
    { icon: FiLock, text: "Secure checkout" },
  ];

  return (
    <div className="bg-[#f7f3ec] pb-28 lg:pb-12">
      <Helmet>
        <title>{`${p.title} | VKart`}</title>
        <meta name="description" content={p.shortDescription} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1 py-4 text-xs text-[#6f6b62]" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#1d1c19]">Home</Link>
          <FiChevronRight />
          <Link to={`/catalog-preview?cat=${cat}`} className="hover:text-[#1d1c19]">{CATEGORIES[cat] || cat}</Link>
          <FiChevronRight />
          <span className="text-[#1d1c19]">{p.brand}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-[#fffdf8] p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:p-8 [&>*]:min-w-0">
          <Gallery images={images} idx={imgIdx} setIdx={setImgIdx} />

          {/* Buy box */}
          <div>
            <Link to={`/catalog-preview?cat=${cat}`} className="text-sm font-semibold" style={{ color: ACCENT }}>Visit the {p.brand} store</Link>
            <h1 className="mt-1 break-words text-2xl font-bold leading-snug text-[#1d1c19] sm:text-3xl">{p.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-[#8b867d]">
              <span className="flex text-gray-300">{[0, 1, 2, 3, 4].map((i) => <FiStar key={i} />)}</span>
              No ratings yet
            </div>

            <div className="mt-5 border-t border-[#ebe5da] pt-5">
              {variant ? (
                <>
                  {off > 0 && <span className="mr-3 rounded-md bg-green-700 px-2 py-0.5 text-sm font-semibold text-white">{off}% off</span>}
                  <span className="text-3xl font-bold text-[#1d1c19]">{formatPrice(variant.price)}</span>
                  {off > 0 && <p className="mt-1 text-sm text-[#8b867d]">M.R.P.: <span className="line-through">{formatPrice(variant.mrp)}</span></p>}
                  <p className="mt-1 text-xs text-[#8b867d]">Inclusive of all taxes</p>
                </>
              ) : (
                <p className="text-lg text-[#6f6b62]">This combination is not available</p>
              )}
            </div>

            {/* Options */}
            {p.variantOptions.filter((o) => o.values.length > 1 || !/^(standard|default|one size)$/i.test(o.values[0]?.value || "")).map((o) => {
              const byImage = o.name === p.media.groupBy && Object.keys(p.media.groups || {}).length > 0;
              return (
                <div key={o.name} className="mt-6">
                  <p className="text-sm font-semibold text-[#1d1c19]">
                    {o.name}: <span className="font-normal text-[#6f6b62]">{opts[o.name]}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {o.values.map((val) => {
                      const active = opts[o.name] === val.value;
                      const ok = exists(o.name, val.value);
                      const thumb = byImage ? imagesFor(p, val.value)[0] : null;
                      if (thumb) {
                        return (
                          <button key={val.value} type="button" title={val.value} onClick={() => pick(o.name, val.value)}
                            className={`h-16 w-16 overflow-hidden rounded-xl border-2 bg-white p-1 ${active ? "border-[#a85d37]" : "border-[#ebe5da] hover:border-gray-400"} ${ok ? "" : "opacity-40"}`}>
                            <img src={thumb.thumb} alt={val.value} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                          </button>
                        );
                      }
                      if (o.name === "Color" && val.hex) {
                        return (
                          <button key={val.value} type="button" title={val.value} aria-label={val.value} onClick={() => pick(o.name, val.value)}
                            className={`h-9 w-9 rounded-full border-2 ring-2 ring-offset-2 ${active ? "ring-[#a85d37]" : "ring-transparent"} border-white ${ok ? "" : "opacity-40"}`}
                            style={{ background: val.hex }} />
                        );
                      }
                      return (
                        <button key={val.value} type="button" onClick={() => pick(o.name, val.value)}
                          className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm transition ${active ? "border-[#1d1c19] bg-[#1d1c19] text-white" : "border-[#d9d2c5] bg-white text-[#1d1c19] hover:border-[#1d1c19]"} ${ok ? "" : "text-gray-400 line-through opacity-60"}`}>
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Stock + actions */}
            <div className="mt-6 rounded-2xl border border-[#ebe5da] bg-white p-4">
              <p className={`text-sm font-semibold ${available ? "text-green-700" : "text-red-700"}`}>
                {available ? "In stock" : "Currently unavailable"}
              </p>
              <p className="mt-1 text-sm text-[#6f6b62]">Sold by VKart · Ships from India</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-[#6f6b62]">Qty</span>
                <BrandSelect label="Quantity" value={qty} onChange={setQty} className="w-24"
                  options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
              </div>
              <div className="mt-4 hidden gap-3 lg:flex">
                <button type="button" disabled={!available} onClick={() => buy("cart")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#1d1c19] py-3 text-sm font-bold text-[#1d1c19] transition hover:bg-[#1d1c19] hover:text-white disabled:opacity-40">
                  <FiShoppingCart /> Add to cart
                </button>
                <button type="button" disabled={!available} onClick={() => buy("buy")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: ACCENT }}>
                  <FiZap /> Buy now
                </button>
              </div>
              {notice && <p className="mt-3 rounded-lg bg-[#f7f3ec] px-3 py-2 text-xs text-[#6f6b62]">{notice}</p>}
            </div>

            {/* Policies */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 [&>*]:min-w-0">
              {policies.map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#f7f3ec] px-2 py-3 text-center text-[11px] leading-tight text-[#5f5b52]">
                  <Icon className="text-lg" style={{ color: ACCENT }} />{text}
                </div>
              ))}
            </div>

            {/* Highlights */}
            {p.highlights?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-[#1d1c19]">Highlights</h2>
                <ul className="mt-2 space-y-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-sm text-[#3d3a35]"><FiCheck className="mt-0.5 flex-none text-green-700" />{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {variant && <p className="mt-6 text-xs text-[#8b867d]">SKU {variant.sku}{variant.mpn ? ` · Model ${variant.mpn}` : ""}</p>}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] [&>*]:min-w-0">
          <div className="space-y-8">
            {/* Specifications */}
            {specGroups.length > 0 && (
              <section className="rounded-3xl bg-[#fffdf8] p-4 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold text-[#1d1c19]">Specifications</h2>
                <div className="mt-4 space-y-5">
                  {shownGroups.map(([group, fields]) => (
                    <div key={group}>
                      <h3 className="border-b border-[#ebe5da] pb-2 text-sm font-semibold text-[#1d1c19]">{group}</h3>
                      <dl>
                        {Object.entries(fields).map(([k, v]) => (
                          k === "points" ? (
                            <ul key={k} className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#3d3a35]">
                              {[].concat(v).map((x, i) => <li key={i}>{String(x)}</li>)}
                            </ul>
                          ) : (
                            <div key={k} className="grid grid-cols-[minmax(110px,35%)_1fr] gap-3 border-b border-[#f1ece3] py-2.5 text-sm last:border-0">
                              <dt className="text-[#8b867d]">{label(k)}</dt>
                              <dd className="text-[#1d1c19]"><SpecValue value={v} /></dd>
                            </div>
                          )
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
                {(collapsed || allSpecs) && (specGroups.length > 2 || totalRows > SPEC_ROWS) && (
                  <button type="button" onClick={() => setAllSpecs(!allSpecs)}
                    className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: ACCENT }}>
                    {allSpecs ? "Show fewer" : specGroups.length > 2 ? `Show all ${specGroups.length} sections` : `Show all ${totalRows} specifications`}
                    <FiChevronDown className={allSpecs ? "rotate-180" : ""} />
                  </button>
                )}
              </section>
            )}

            {/* Description */}
            {p.description && (
              <section className="rounded-3xl bg-[#fffdf8] p-4 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold text-[#1d1c19]">Product description</h2>
                {p.description.split("\n\n").map((para, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-[#3d3a35]">{para}</p>)}
              </section>
            )}

            {/* Reviews */}
            <section className="rounded-3xl bg-[#fffdf8] p-4 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-[#1d1c19]">Ratings & reviews</h2>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="text-center sm:w-40">
                  <p className="text-4xl font-bold text-gray-300">–</p>
                  <p className="text-xs text-[#8b867d]">0 ratings</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <div key={n} className="flex items-center gap-2 text-xs text-[#8b867d]">
                      <span className="w-6">{n}★</span>
                      <div className="h-2 flex-1 rounded-full bg-[#efe9df]" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-[#6f6b62]">No reviews yet. Reviews from verified buyers will appear here.</p>
            </section>
          </div>

          {/* Side column */}
          <aside className="space-y-4">
            {p.inTheBox?.length > 0 && (
              <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#1d1c19]">What's in the box</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-[#3d3a35]">
                  {p.inTheBox.map((x) => <li key={x} className="flex gap-2"><FiCheck className="mt-0.5 flex-none text-[#8b867d]" />{x}</li>)}
                </ul>
              </div>
            )}
            <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#1d1c19]">Warranty & returns</h2>
              <p className="mt-2 text-sm text-[#3d3a35]">{p.warranty || "Covered by the brand's standard warranty."}</p>
              <p className="mt-1 text-sm text-[#3d3a35]">Easy returns within 7 days of delivery.</p>
            </div>
            <div className="rounded-3xl bg-[#fffdf8] p-5 text-xs text-[#8b867d] shadow-sm">
              Product details from{" "}
              {[...new Map(p.source.urls.map((u) => [new URL(u).hostname, u])).entries()].map(([host, u], i) => (
                <React.Fragment key={host}>{i > 0 && ", "}<a href={u} target="_blank" rel="noreferrer" className="underline">{host}</a></React.Fragment>
              ))}
              , collected {p.source.fetchedAt}.
            </div>
          </aside>
        </div>

        <Rail title={`Similar ${CATEGORIES[cat] || "products"}`} items={similar} />
        <Rail title="Recently viewed" items={recentItems} />
      </div>

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ebe5da] bg-[#fffdf8]/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2 pr-16 sm:gap-3">
          <div className="min-w-0 flex-none">
            <p className="text-lg font-bold leading-none text-[#1d1c19]">{variant ? formatPrice(variant.price) : "–"}</p>
            {off > 0 && <p className="text-xs font-semibold text-green-700">{off}% off</p>}
          </div>
          <button type="button" disabled={!available} onClick={() => buy("cart")}
            className="min-w-0 flex-1 rounded-full border-2 border-[#1d1c19] py-2.5 text-sm font-bold disabled:opacity-40" style={{ color: INK }}>
            Add to cart
          </button>
          <button type="button" disabled={!available} onClick={() => buy("buy")}
            className="min-w-0 flex-1 rounded-full py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: ACCENT }}>
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
