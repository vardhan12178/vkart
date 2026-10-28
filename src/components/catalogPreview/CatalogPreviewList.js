import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { products, minPrice, maxPrice, defaultVariant, imagesFor, discountPercent, formatPrice } from "./catalogData";

const CATEGORIES = { mobiles: "Mobiles", laptops: "Laptops", tablets: "Tablets", tvs: "TVs", monitors: "Monitors", audio: "Audio", wearables: "Watches", skincare: "Skincare", "fashion-men": "Men's Fashion", "fashion-women": "Women's Fashion", appliances: "Appliances", "kitchen-appliances": "Kitchen", grooming: "Grooming", sports: "Sports" };
const catOf = (p) => (p.category === "fashion" ? `fashion-${(p.keySpecs?.gender || "men").toLowerCase()}` : p.categoryPath?.[0] === "home-appliances" ? "appliances" : p.category);
const brandsOf = (cat) => ["All", ...Array.from(new Set(products.filter((p) => catOf(p) === cat).map((p) => p.brand)))];
const SORTS = {
  "price-desc": { label: "Price: high to low", fn: (a, b) => minPrice(b) - minPrice(a) },
  "price-asc": { label: "Price: low to high", fn: (a, b) => minPrice(a) - minPrice(b) },
  battery: { label: "Battery (mAh)", mobilesOnly: true, fn: (a, b) => (b.keySpecs.batteryMah || 0) - (a.keySpecs.batteryMah || 0) },
  camera: { label: "Main camera (MP)", mobilesOnly: true, fn: (a, b) => (b.keySpecs.mainCameraMP || 0) - (a.keySpecs.mainCameraMP || 0) },
};

function Card({ p }) {
  const v = defaultVariant(p);
  const img = imagesFor(p, v.options[p.media.groupBy])[0];
  const off = discountPercent(v);
  const lo = minPrice(p);
  const hi = maxPrice(p);
  return (
    <Link
      to={`/catalog-preview/${p.slug}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-50">
        {img && (
          <img src={img.src} alt={img.alt} loading="lazy" referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-3 transition group-hover:scale-105" />
        )}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{p.brand}</p>
      <h3 className="text-base font-semibold text-gray-900">{p.title.replace(`${p.brand} `, "")}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.shortDescription}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.variantOptions.find((o) => o.name === "Color")?.values.map((c) => (
          <span key={c.value} title={c.value} className="h-4 w-4 rounded-full border border-gray-300"
            style={{ background: c.hex || "#ddd" }} />
        ))}
      </div>
      <div className="mt-auto pt-3">
        <span className="text-lg font-bold text-gray-900">{formatPrice(lo)}</span>
        {hi > lo && <span className="ml-1 text-sm text-gray-500">– {formatPrice(hi)}</span>}
        {off > 0 && (
          <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(v.mrp)}</span>
        )}
        {off > 0 && <span className="ml-1 text-sm font-semibold text-green-600">{off}% off</span>}
      </div>
    </Link>
  );
}

export default function CatalogPreviewList() {
  const [category, setCategory] = useState("mobiles");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("price-desc");
  const [maxBudget, setMaxBudget] = useState(0);

  const shown = useMemo(
    () =>
      products
        .filter((p) => catOf(p) === category)
        .filter((p) => brand === "All" || p.brand === brand)
        .filter((p) => !maxBudget || minPrice(p) <= maxBudget)
        .sort(SORTS[sort].fn),
    [category, brand, sort, maxBudget]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Helmet>
        <title>{`Catalog v2 preview · ${CATEGORIES[category]} | VKart`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Catalog v2 preview.</strong> Draft data for review: {products.length} products,{" "}
        {products.reduce((n, p) => n + p.variants.length, 0)} variants. Images load from the brands' own sites for now.
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-gray-200">
        {Object.entries(CATEGORIES).map(([k, label]) => (
          <button key={k} type="button"
            onClick={() => { setCategory(k); setBrand("All"); if (SORTS[sort].mobilesOnly) setSort("price-desc"); }}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-2 text-lg font-bold sm:text-2xl ${category === k ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {brandsOf(category).map((b) => (
          <button key={b} type="button" onClick={() => setBrand(b)}
            className={`rounded-full border px-4 py-1.5 text-sm ${brand === b ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}>
            {b}
          </button>
        ))}
        <select value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))}
          className="ml-auto rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm" aria-label="Budget">
          <option value={0}>Any budget</option>
          <option value={30000}>Under ₹30,000</option>
          <option value={60000}>Under ₹60,000</option>
          <option value={100000}>Under ₹1,00,000</option>
          <option value={150000}>Under ₹1,50,000</option>
          <option value={250000}>Under ₹2,50,000</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm" aria-label="Sort">
          {Object.entries(SORTS).filter(([, s]) => category === "mobiles" || !s.mobilesOnly).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>

      <p className="mt-3 text-sm text-gray-500">{shown.length} products</p>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((p) => <Card key={p.slug} p={p} />)}
      </div>
    </div>
  );
}
