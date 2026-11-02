import React from "react";
import { Helmet } from "react-helmet-async";
import QuickAdd from "./QuickAdd";
import ActiveChips from "./list/ActiveChips";
import CategoryBar from "./list/CategoryBar";
import FilterPanel from "./list/FilterPanel";
import FilterSheet from "./list/FilterSheet";
import ListHeading from "./list/ListHeading";
import ListResults from "./list/ListResults";
import MobileFilterBar from "./list/MobileFilterBar";
import { ACCENT } from "./list/theme";
import useProductList from "./list/useProductList";

export default function ProductList() {
  const list = useProductList();
  const { category, q, chips, data, bands, sel, act, total } = list;

  return (
    <div className="min-h-screen bg-sand pb-24 lg:pb-12">
      <Helmet>
        <title>{`${list.heading} | VKart`}</title>
        {q && <meta name="robots" content="noindex,follow" />}
      </Helmet>

      <CategoryBar category={category} onPick={list.pickCategory} />

      <div className="mx-auto max-w-7xl px-4">
        <ListHeading
          category={category}
          q={q}
          heading={list.heading}
          loading={list.loading}
          page={list.page}
          total={total}
          sort={list.sort}
          setSort={list.setSort}
          sortOptions={list.sortOptions}
        />

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden self-start rounded-2xl bg-paper px-5 py-1 ring-1 ring-line lg:sticky lg:top-24 lg:block">
            <div className="flex items-center justify-between border-b border-line py-4">
              <span className="text-sm font-bold text-ink">Filters</span>
              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={list.clearAll}
                  className="text-xs font-semibold"
                  style={{ color: ACCENT }}
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel facets={data?.facets} bands={bands} sel={sel} act={act} />
          </aside>

          <div>
            <ActiveChips chips={chips} />
            <ListResults
              error={list.error}
              retry={list.retry}
              loading={list.loading}
              page={list.page}
              setPage={list.setPage}
              items={list.items}
              data={data}
              total={total}
              q={q}
              chips={chips}
              clearAll={list.clearAll}
              onChooseOptions={list.setQuickSlug}
            />
          </div>
        </div>
      </div>

      <MobileFilterBar
        sort={list.sort}
        setSort={list.setSort}
        sortOptions={list.sortOptions}
        chipCount={chips.length}
        onOpen={() => list.setSheet(true)}
      />

      {list.sheet && (
        <FilterSheet
          data={data}
          bands={bands}
          sel={sel}
          act={act}
          total={total}
          clearAll={list.clearAll}
          onClose={() => list.setSheet(false)}
        />
      )}
      {list.quickSlug && <QuickAdd slug={list.quickSlug} onClose={list.closeQuick} />}
    </div>
  );
}
