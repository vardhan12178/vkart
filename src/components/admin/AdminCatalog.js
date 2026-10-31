import React, { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Package, RefreshCw, Search, Star, X,
} from "lucide-react";
import axiosInstance from "../axiosInstance";
import usePermission from "./usePermission";
import { showToast } from "../../utils/toast";
import { CATEGORIES } from "../shop/catalogData";

// Catalog admin: every storefront product with its variants. Status, featured flag and
// per-variant price / MRP / stock are edited inline; status can also be changed in bulk.

const API = "/api/admin/v2/products";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-800 border-amber-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};
const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active", status: "active" },
  { key: "draft", label: "Draft", status: "draft" },
  { key: "archived", label: "Archived", status: "archived" },
  { key: "low", label: "Low stock", stock: "low" },
  { key: "out", label: "Out of stock", stock: "out" },
];

const useDebounced = (value, ms) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

const errorText = (err) => err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || "Something went wrong";

/* ------------ Variant row (inline price / MRP / stock editor) ------------ */
function VariantRow({ productId, v, canWrite, onSaved }) {
  const [form, setForm] = useState({ price: v.price, mrp: v.mrp, stock: v.stock });
  useEffect(() => { setForm({ price: v.price, mrp: v.mrp, stock: v.stock }); }, [v.price, v.mrp, v.stock]);
  const changed = ["price", "mrp", "stock"].filter((k) => Number(form[k]) !== v[k]);
  const invalid = !(Number(form.price) > 0) ? "Price must be more than zero"
    : Number(form.mrp) < Number(form.price) ? "MRP can't be lower than price"
      : !(Number(form.stock) >= 0) ? "Stock can't be negative" : "";

  const save = useMutation({
    mutationFn: () => axiosInstance.patch(`${API}/${productId}/variants/${encodeURIComponent(v.sku)}`,
      Object.fromEntries(changed.map((k) => [k, Number(form[k])]))).then((r) => r.data),
    onSuccess: (row) => { onSaved(row); showToast(`Saved ${v.label}`, "success"); },
    onError: (err) => showToast(errorText(err), "error"),
  });

  const field = (key, label) => (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 md:sr-only">{label}</span>
      <input type="number" min={key === "stock" ? 0 : 1} inputMode="numeric" disabled={!canWrite || save.isPending}
        aria-label={`${label} for ${v.label}`}
        value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`w-full rounded-lg border px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50 ${
          Number(form[key]) !== v[key] ? "border-orange-300 bg-orange-50/40" : "border-slate-200 bg-white"}`} />
    </label>
  );

  return (
    <div className="grid grid-cols-2 items-end gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))_5rem] md:items-center md:gap-3">
      <div className="col-span-2 min-w-0 md:col-span-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {v.label} {v.isDefault && <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">DEFAULT</span>}
        </p>
        <p className="truncate font-mono text-[11px] text-slate-400">{v.sku}</p>
      </div>
      {field("price", "Price")}
      {field("mrp", "MRP")}
      {field("stock", "Stock")}
      <div className="col-span-2 flex justify-end md:col-span-1">
        {canWrite && (
          <button type="button" disabled={!changed.length || Boolean(invalid) || save.isPending} onClick={() => save.mutate()}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30">
            {save.isPending ? "Saving…" : "Save"}
          </button>
        )}
      </div>
      {invalid && changed.length > 0 && (
        <p className="col-span-full text-right text-[11px] font-semibold text-red-600" role="alert">{invalid}</p>
      )}
    </div>
  );
}

/* ------------ Page ------------ */
export default function AdminCatalog() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("products");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null); // product id with variants expanded
  const [selected, setSelected] = useState(new Set());
  const q = useDebounced(search.trim(), 300);

  const t = TABS.find((x) => x.key === tab);
  const params = useMemo(() => ({
    ...(q ? { q } : {}), ...(category ? { category } : {}), ...(t.status ? { status: t.status } : {}), ...(t.stock ? { stock: t.stock } : {}),
    sort, page, limit: 20,
  }), [q, category, t, sort, page]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [q, category, tab, sort]);

  const listKey = ["admin", "catalog", params];
  const list = useQuery({
    queryKey: listKey,
    queryFn: () => axiosInstance.get(API, { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const data = list.data;
  const counts = data?.counts || {};

  // Swap an edited row into the current page, then refresh counts in the background
  const replaceRow = (row) => {
    queryClient.setQueryData(listKey, (old) => old && { ...old, products: old.products.map((p) => (p.id === row.id ? row : p)) });
    queryClient.invalidateQueries({ queryKey: ["admin", "catalog"], refetchType: "inactive" });
  };

  const patchProduct = useMutation({
    mutationFn: ({ id, body }) => axiosInstance.patch(`${API}/${id}`, body).then((r) => r.data),
    onSuccess: (row) => { replaceRow(row); list.refetch(); },
    onError: (err) => showToast(errorText(err), "error"),
  });

  const bulk = useMutation({
    mutationFn: (body) => axiosInstance.post(`${API}/bulk-status`, body).then((r) => r.data),
    onSuccess: (res) => {
      showToast(`${res.updated} product${res.updated === 1 ? "" : "s"} set to ${res.status}`, "success");
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    },
    onError: (err) => showToast(errorText(err), "error"),
  });

  const rows = data?.products || [];
  const allOnPage = rows.length > 0 && rows.every((p) => selected.has(p.id));
  const toggle = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(rows.map((p) => p.id)));

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 font-sans text-[#24231f] sm:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">Catalog</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
              Products on the storefront. Edit prices, stock and visibility; changes show in the shop straight away.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => list.refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 sm:text-sm">
              <RefreshCw className={`h-3.5 w-3.5 ${list.isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Drafts notice: the storefront shows drafts until CATALOG_ACTIVE_ONLY=true */}
        {canWrite && counts.draft > 0 && tab === "all" && !q && !category && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="flex items-start gap-2 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <span>
                {counts.draft === counts.all ? `All ${counts.draft} products are drafts.` : `${counts.draft} of ${counts.all} products are drafts.`}{" "}
                The shop shows drafts for now; publish them so it can switch to active products only.
              </span>
            </p>
            <button type="button" disabled={bulk.isPending} onClick={() => bulk.mutate({ ids: "all", filter: { status: "draft" }, status: "active" })}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50">
              Publish all drafts
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white p-1 shadow-xs [scrollbar-width:none]" role="tablist">
          {TABS.map((x) => (
            <button key={x.key} type="button" role="tab" aria-selected={tab === x.key} onClick={() => setTab(x.key)}
              className={`flex flex-none items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition sm:text-sm ${tab === x.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
              {x.label}
              <span className={`rounded-full px-1.5 text-[10px] ${tab === x.key ? "bg-white/20" : x.key === "out" && counts.out ? "bg-red-50 text-red-600" : "bg-slate-100"}`}>
                {counts[x.key] ?? "–"}
              </span>
            </button>
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-xs sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, brand or SKU"
              aria-label="Search products"
              className="block w-full rounded-xl border-none bg-transparent py-2 pl-9 pr-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-0" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category"
            className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-orange-200">
            <option value="">All categories</option>
            {Object.entries(CATEGORIES).map(([k, name]) => <option key={k} value={k}>{name}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"
            className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-orange-200">
            <option value="updated">Recently updated</option>
            <option value="title">Name A–Z</option>
            <option value="stock">Out of stock first</option>
          </select>
        </div>

        {/* Bulk actions */}
        {canWrite && selected.size > 0 && (
          <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
            <span className="font-bold">{selected.size} selected</span>
            <span className="mx-1 h-4 w-px bg-white/20" />
            {[["active", "Publish"], ["draft", "Move to draft"], ["archived", "Archive"]].map(([status, label]) => (
              <button key={status} type="button" disabled={bulk.isPending} onClick={() => bulk.mutate({ ids: [...selected], status })}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold hover:bg-white/20 disabled:opacity-50">{label}</button>
            ))}
            <button type="button" onClick={() => setSelected(new Set())} aria-label="Clear selection" className="ml-auto rounded-full p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xs">
          <div className="hidden grid-cols-[2rem_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_4.5rem] items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:grid">
            <span>{canWrite && <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={toggleAll} className="rounded border-slate-300 text-slate-900 focus:ring-orange-200" />}</span>
            <span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span className="text-right">Featured</span>
          </div>

          {list.isLoading ? (
            <div className="space-y-2 p-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-50" />)}</div>
          ) : list.isError ? (
            <p className="flex items-center gap-2 p-6 text-sm text-red-600"><AlertTriangle className="h-4 w-4" />{errorText(list.error)}</p>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-900">No products match</p>
              <p className="text-xs text-slate-500">Try another search, tab or category.</p>
            </div>
          ) : rows.map((p) => {
            const expanded = open === p.id;
            return (
              <div key={p.id} className="border-b border-slate-100 last:border-0">
                <div className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition md:grid-cols-[2rem_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_4.5rem] ${expanded ? "bg-slate-50/70" : "hover:bg-slate-50/40"}`}>
                  <span>{canWrite && <input type="checkbox" aria-label={`Select ${p.title}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="rounded border-slate-300 text-slate-900 focus:ring-orange-200" />}</span>
                  <button type="button" onClick={() => setOpen(expanded ? null : p.id)} aria-expanded={expanded}
                    className="flex min-w-0 items-center gap-3 text-left">
                    <span className="h-11 w-11 flex-none overflow-hidden rounded-lg border border-slate-100 bg-[#f6f3ed]">
                      {p.image?.thumb && <img src={p.image.thumb} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1 mix-blend-multiply" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900">{p.title}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        {p.brand} · {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}
                        <ChevronDown className={`h-3 w-3 transition ${expanded ? "rotate-180" : ""}`} />
                      </span>
                    </span>
                  </button>
                  <span className="hidden text-xs font-medium text-slate-600 md:block">{CATEGORIES[p.category] || p.category}</span>
                  <span className="hidden text-sm font-semibold text-slate-800 md:block">
                    {inr(p.priceRange?.min)}{p.priceRange?.max > p.priceRange?.min && <span className="text-xs font-medium text-slate-400"> – {inr(p.priceRange.max)}</span>}
                  </span>
                  <span className="hidden md:block">
                    <span className="text-sm font-semibold text-slate-800">{p.stock}</span>
                    {p.outOfStock > 0 ? <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">{p.outOfStock} out</span>
                      : p.lowStock ? <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Low</span> : null}
                  </span>
                  <span className="col-start-3 row-start-1 md:col-start-auto md:row-start-auto">
                    <select value={p.status} disabled={!canWrite || patchProduct.isPending} aria-label={`Status of ${p.title}`}
                      onChange={(e) => patchProduct.mutate({ id: p.id, body: { status: e.target.value } })}
                      className={`rounded-lg border py-1 pl-2 pr-7 text-xs font-bold capitalize focus:ring-orange-200 disabled:opacity-70 ${STATUS_STYLE[p.status]}`}>
                      <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
                    </select>
                  </span>
                  <span className="hidden justify-end md:flex">
                    <button type="button" disabled={!canWrite} aria-pressed={p.isFeatured} aria-label={`${p.isFeatured ? "Unfeature" : "Feature"} ${p.title}`}
                      onClick={() => patchProduct.mutate({ id: p.id, body: { isFeatured: !p.isFeatured } })}
                      className="rounded-full p-1.5 text-slate-300 transition hover:bg-amber-50 hover:text-amber-500 disabled:hover:bg-transparent">
                      <Star className={`h-4 w-4 ${p.isFeatured ? "fill-amber-400 text-amber-500" : ""}`} />
                    </button>
                  </span>
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 px-2 pb-3 sm:px-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-1 pt-3 text-[11px] text-slate-500">
                      <span className="font-mono">{p.slug}</span>
                      <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900">
                        View in shop <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))_5rem] gap-3 px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
                      <span>Variant</span><span>Price (₹)</span><span>MRP (₹)</span><span>Stock</span><span />
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
                      {p.variants.map((v) => <VariantRow key={v.sku} productId={p.id} v={v} canWrite={canWrite} onSaved={replaceRow} />)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paging */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Page {data.page} of {data.pages} · {data.total} products</span>
            <div className="flex gap-1">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} aria-label="Next page"
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
