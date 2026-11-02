import React from "react";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";
import usePermission from "./usePermission";
import { Bone, SkeletonRegion } from "../ui/Skeleton";
import BulkBar from "./catalog/BulkBar";
import CatalogFilters from "./catalog/CatalogFilters";
import CatalogPager from "./catalog/CatalogPager";
import CatalogTabs from "./catalog/CatalogTabs";
import DraftNotices from "./catalog/DraftNotices";
import ProductRow from "./catalog/ProductRow";
import { errorText } from "./catalog/catalogConfig";
import useCatalog from "./catalog/useCatalog";

// Catalog admin: every storefront product with its variants. Status, featured flag and
// per-variant price / MRP / stock are edited inline; status can also be changed in bulk.

export default function AdminCatalog() {
  const { canWrite } = usePermission("products");
  const c = useCatalog();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 font-sans text-[#24231f] sm:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Catalog
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
              Products on the storefront. Edit prices, stock and visibility; changes show in the
              shop straight away.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => c.list.refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 sm:text-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${c.list.isFetching ? "animate-spin" : ""}`} />{" "}
              Refresh
            </button>
          </div>
        </div>

        <DraftNotices
          canWrite={canWrite}
          counts={c.counts}
          publishing={c.bulk.isPending}
          onPublishAll={() =>
            c.bulk.mutate({ ids: "all", filter: { status: "draft" }, status: "active" })
          }
        />

        <CatalogTabs tab={c.tab} setTab={c.setTab} counts={c.counts} />
        <CatalogFilters
          search={c.search}
          setSearch={c.setSearch}
          category={c.category}
          setCategory={c.setCategory}
          sort={c.sort}
          setSort={c.setSort}
        />

        {canWrite && c.selected.size > 0 && (
          <BulkBar
            count={c.selected.size}
            pending={c.bulk.isPending}
            onSetStatus={(status) => c.bulk.mutate({ ids: [...c.selected], status })}
            onClear={c.clearSelection}
          />
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xs">
          <div className="hidden grid-cols-[2rem_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_4.5rem] items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:grid">
            <span>
              {canWrite && (
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={c.allOnPage}
                  onChange={c.toggleAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-orange-200"
                />
              )}
            </span>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span className="text-right">Featured</span>
          </div>

          {c.list.isLoading ? (
            <SkeletonRegion label="Loading products" className="space-y-2 p-4">
              {[1, 2, 3, 4].map((i) => (
                <Bone key={i} className="h-14" rounded="rounded-xl" />
              ))}
            </SkeletonRegion>
          ) : c.list.isError ? (
            <p className="flex items-center gap-2 p-6 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {errorText(c.list.error)}
            </p>
          ) : c.rows.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-900">No products match</p>
              <p className="text-xs text-slate-500">Try another search, tab or category.</p>
            </div>
          ) : (
            c.rows.map((p) => (
              <ProductRow
                key={p.id}
                p={p}
                expanded={c.open === p.id}
                selected={c.selected.has(p.id)}
                canWrite={canWrite}
                patch={c.patchProduct}
                onToggleOpen={() => c.setOpen(c.open === p.id ? null : p.id)}
                onToggleSelect={c.toggle}
                onSaved={c.replaceRow}
              />
            ))
          )}
        </div>

        {c.data && c.data.pages > 1 && (
          <CatalogPager data={c.data} page={c.page} setPage={c.setPage} />
        )}
      </div>
    </div>
  );
}
