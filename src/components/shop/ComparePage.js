import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQueries } from "@tanstack/react-query";
import { Plus, Search, X } from "lucide-react";
import { fetchProduct, fetchProducts, defaultVariant, imagesFor, formatPrice } from "./catalogApi";
import { RatingChip } from "./Reviews";
import { SpecValue, label } from "./specFormat";
import { MAX_COMPARE, writeCompare } from "./compareList";
import { Bone } from "../ui/Skeleton";

// Side-by-side comparison of up to four products: price, rating and every spec, with an option to show only
// the rows where the products differ. The chosen products live in the URL (?p=slug,slug).

const text = (v) => (Array.isArray(v) ? v.join("|") : v && typeof v === "object" ? JSON.stringify(v) : String(v));

function specRows(products) {
  const rows = new Map();
  products.forEach((p, i) => {
    Object.entries(p.specs || {}).forEach(([group, fields]) => {
      Object.entries(fields || {}).forEach(([k, v]) => {
        if (k === "points" || v == null || v === "") return;
        const id = `${group}::${k}`;
        if (!rows.has(id)) rows.set(id, { id, group, name: label(k), values: Array(products.length).fill(undefined) });
        rows.get(id).values[i] = v;
      });
    });
  });
  return [...rows.values()].map((r) => ({ ...r, differs: new Set(r.values.map((v) => (v === undefined ? "—" : text(v)))).size > 1 }));
}

function AddProduct({ taken, onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return undefined; }
    let live = true;
    const t = setTimeout(() => fetchProducts({ q: q.trim(), limit: 6 }).then((r) => live && setResults(r?.products || [])).catch(() => {}), 250);
    return () => { live = false; clearTimeout(t); };
  }, [q]);
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-faint" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a product to compare" aria-label="Search products to compare"
        className="w-full rounded-full border border-line-strong bg-white py-2.5 pl-10 pr-4 text-sm text-ink focus:border-ink focus:outline-none" />
      {results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-paper py-1 shadow-xl">
          {results.filter((p) => !taken.includes(p.slug)).map((p) => (
            <li key={p.slug}>
              <button type="button" onClick={() => { onPick(p.slug); setQ(""); setResults([]); }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-sand">
                <span className="h-9 w-9 flex-none overflow-hidden rounded-lg bg-[#f6f3ed]">
                  {p.image && <img src={p.image.thumb} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1 mix-blend-multiply" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.title}</span>
                <span className="flex-none text-xs text-muted">{formatPrice(p.priceRange?.min ?? p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const slugs = useMemo(() => (params.get("p") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE), [params]);
  const [onlyDiffs, setOnlyDiffs] = useState(false);

  const setSlugs = (next) => {
    const list = writeCompare(next);
    setParams(list.length ? { p: list.join(",") } : {}, { replace: true });
  };
  useEffect(() => { writeCompare(slugs); }, [slugs]);

  const queries = useQueries({ queries: slugs.map((slug) => ({ queryKey: ["compare", slug], queryFn: () => fetchProduct(slug), staleTime: 5 * 60 * 1000 })) });
  const loaded = queries.map((q) => q.data).filter(Boolean);
  const loading = queries.some((q) => q.isLoading);
  const rows = useMemo(() => specRows(loaded), [loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = onlyDiffs ? rows.filter((r) => r.differs) : rows;
  const groups = [...new Set(shown.map((r) => r.group))];

  return (
    <div className="min-h-screen bg-sand pb-16">
      <Helmet><title>Compare products | VKart</title></Helmet>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Compare</h1>
        <p className="mt-1 text-sm text-muted">Up to {MAX_COMPARE} products side by side.</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {slugs.length < MAX_COMPARE && <AddProduct taken={slugs} onPick={(slug) => setSlugs([...slugs, slug])} />}
          {loaded.length > 1 && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={onlyDiffs} onChange={(e) => setOnlyDiffs(e.target.checked)} className="rounded border-line-strong text-ink focus:ring-accent" />
              Show only differences
            </label>
          )}
        </div>

        {slugs.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-paper p-10 text-center ring-1 ring-line">
            <p className="font-semibold text-ink">Nothing to compare yet</p>
            <p className="mt-1 text-sm text-muted">Search above, or use "Compare" on a product page.</p>
            <Link to="/products" className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white">Browse products</Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-3xl bg-paper ring-1 ring-line">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <caption className="sr-only">Product comparison</caption>
              <thead>
                <tr className="align-top">
                  <th scope="col" className="sticky left-0 z-10 w-28 bg-paper p-3 sm:w-40" />
                  {queries.map((q, i) => {
                    const p = q.data;
                    if (!p) return <th key={slugs[i]} scope="col" className="min-w-[10rem] p-3 text-muted">{q.isLoading ? <><Bone className="aspect-square w-full" rounded="rounded-xl" /><Bone className="mt-2 h-3 w-1/3" /><Bone className="mt-2 h-4 w-4/5" /></> : "Not found"}</th>;
                    const v = defaultVariant(p);
                    const img = imagesFor(p, v.options[p.media?.groupBy])[0];
                    return (
                      <th key={p.slug} scope="col" className="relative min-w-[10rem] p-3 font-normal">
                        <button type="button" aria-label={`Remove ${p.title}`} onClick={() => setSlugs(slugs.filter((s) => s !== p.slug))}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-muted shadow-sm hover:text-ink"><X className="h-4 w-4" /></button>
                        <Link to={`/products/${p.slug}`} className="block">
                          <span className="block aspect-square overflow-hidden rounded-xl bg-[#f6f3ed]">
                            {img && <img src={img.md} alt={img.alt || p.title} referrerPolicy="no-referrer" className="h-full w-full object-contain p-3 mix-blend-multiply" />}
                          </span>
                          <span className="mt-2 block text-[11px] font-bold uppercase tracking-wider text-muted-light">{p.brand}</span>
                          <span className="block text-sm font-semibold leading-snug text-ink">{p.title.replace(`${p.brand} `, "")}</span>
                        </Link>
                        <span className="mt-1 block text-base font-bold text-ink">{formatPrice(p.priceRange?.min ?? v.price)}</span>
                        {p.rating?.average ? <span className="mt-1 block"><RatingChip rating={p.rating} /></span> : null}
                      </th>
                    );
                  })}
                  {slugs.length < MAX_COMPARE && loaded.length > 0 && (
                    <th scope="col" className="hidden min-w-[8rem] p-3 sm:table-cell"><Plus className="mx-auto h-6 w-6 text-line-strong" aria-hidden="true" /></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 5 }, (_, i) => <tr key={i} role="presentation"><td colSpan={slugs.length + 1} className="p-3"><Bone className="h-5 w-full" /></td></tr>)}
                {!loading && loaded.length > 0 && shown.length === 0 && (
                  <tr><td colSpan={slugs.length + 1} className="p-6 text-center text-muted">These products have the same specifications.</td></tr>
                )}
                {groups.map((group) => (
                  <React.Fragment key={group}>
                    <tr><th scope="colgroup" colSpan={slugs.length + 2} className="bg-tint px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft">{group}</th></tr>
                    {shown.filter((r) => r.group === group).map((r) => (
                      <tr key={r.id} className="border-t border-tint">
                        <th scope="row" className="sticky left-0 z-10 bg-paper p-3 align-top text-xs font-semibold text-muted">{r.name}</th>
                        {queries.map((q, i) => q.data
                          ? <td key={slugs[i]} className={`p-3 align-top text-ink ${r.differs ? "bg-accent/5" : ""}`}>{r.values[loaded.indexOf(q.data)] === undefined ? <span className="text-muted-faint">—</span> : <SpecValue value={r.values[loaded.indexOf(q.data)]} />}</td>
                          : <td key={slugs[i]} />)}
                        {slugs.length < MAX_COMPARE && loaded.length > 0 && <td className="hidden sm:table-cell" />}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {slugs.length > 0 && (
          <button type="button" onClick={() => { writeCompare([]); navigate("/compare", { replace: true }); }}
            className="mt-4 text-sm font-semibold text-accent underline underline-offset-4">Clear comparison</button>
        )}
      </div>
    </div>
  );
}
