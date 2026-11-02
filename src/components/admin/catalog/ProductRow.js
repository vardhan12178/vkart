import React from "react";
import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { CATEGORIES } from "../../shop/catalogData";
import { STATUS_STYLE, inr } from "./catalogConfig";
import VariantRow from "./VariantRow";

export default function ProductRow({
  p,
  expanded,
  selected,
  canWrite,
  patch,
  onToggleOpen,
  onToggleSelect,
  onSaved,
}) {
  return (
    <div key={p.id} className="border-b border-slate-100 last:border-0">
      <div
        className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition md:grid-cols-[2rem_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_4.5rem] ${expanded ? "bg-slate-50/70" : "hover:bg-slate-50/40"}`}
      >
        <span>
          {canWrite && (
            <input
              type="checkbox"
              aria-label={`Select ${p.title}`}
              checked={selected}
              onChange={() => onToggleSelect(p.id)}
              className="rounded border-slate-300 text-slate-900 focus:ring-orange-200"
            />
          )}
        </span>
        <button
          type="button"
          onClick={() => onToggleOpen()}
          aria-expanded={expanded}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <span className="h-11 w-11 flex-none overflow-hidden rounded-lg border border-slate-100 bg-[#f6f3ed]">
            {p.image?.thumb && (
              <img
                src={p.image.thumb}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-1 mix-blend-multiply"
              />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">{p.title}</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              {p.brand} · {p.variants.length} variant
              {p.variants.length === 1 ? "" : "s"}
              <ChevronDown className={`h-3 w-3 transition ${expanded ? "rotate-180" : ""}`} />
            </span>
          </span>
        </button>
        <span className="hidden text-xs font-medium text-slate-600 md:block">
          {CATEGORIES[p.category] || p.category}
        </span>
        <span className="hidden text-sm font-semibold text-slate-800 md:block">
          {inr(p.priceRange?.min)}
          {p.priceRange?.max > p.priceRange?.min && (
            <span className="text-xs font-medium text-slate-400"> – {inr(p.priceRange.max)}</span>
          )}
        </span>
        <span className="hidden md:block">
          <span className="text-sm font-semibold text-slate-800">{p.stock}</span>
          {p.outOfStock > 0 ? (
            <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              {p.outOfStock} out
            </span>
          ) : p.lowStock ? (
            <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              Low
            </span>
          ) : null}
        </span>
        <span className="col-start-3 row-start-1 md:col-start-auto md:row-start-auto">
          <select
            value={p.status}
            disabled={!canWrite || patch.isPending}
            aria-label={`Status of ${p.title}`}
            onChange={(e) => patch.mutate({ id: p.id, body: { status: e.target.value } })}
            className={`rounded-lg border py-1 pl-2 pr-7 text-xs font-bold capitalize focus:ring-orange-200 disabled:opacity-70 ${STATUS_STYLE[p.status]}`}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </span>
        <span className="hidden justify-end md:flex">
          <button
            type="button"
            disabled={!canWrite}
            aria-pressed={p.isFeatured}
            aria-label={`${p.isFeatured ? "Unfeature" : "Feature"} ${p.title}`}
            onClick={() => patch.mutate({ id: p.id, body: { isFeatured: !p.isFeatured } })}
            className="rounded-full p-1.5 text-slate-300 transition hover:bg-amber-50 hover:text-amber-500 disabled:hover:bg-transparent"
          >
            <Star className={`h-4 w-4 ${p.isFeatured ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>
        </span>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-2 pb-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-1 pt-3 text-[11px] text-slate-500">
            <span className="font-mono">{p.slug}</span>
            <a
              href={`/products/${p.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
            >
              View in shop <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))_5rem] gap-3 px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
            <span>Variant</span>
            <span>Price (₹)</span>
            <span>MRP (₹)</span>
            <span>Stock</span>
            <span />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
            {p.variants.map((v) => (
              <VariantRow
                key={v.sku}
                productId={p.id}
                v={v}
                canWrite={canWrite}
                onSaved={onSaved}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
