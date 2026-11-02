import React, { useState } from "react";
import { FiCheck, FiStar } from "react-icons/fi";
import { DISCOUNTS, RATINGS } from "./listParams";

// Swatches for the colour families the API groups clothing colours into
const SWATCH = {
  Black: "#1d1c19",
  White: "#ffffff",
  Grey: "#9b978f",
  Blue: "#3d5a8a",
  Green: "#4f7a52",
  Red: "#a8402f",
  Pink: "#e3a6b4",
  Purple: "#7d5ba6",
  Yellow: "#e0b13a",
  Orange: "#d9772b",
  Brown: "#8a6243",
  Gold: "#c9a24a",
  Silver: "#c4c4c4",
  Multicolour: "conic-gradient(#e0b13a, #a8402f, #7d5ba6, #3d5a8a, #4f7a52, #e0b13a)",
};

function Section({ title, children }) {
  return (
    <div className="border-b border-line py-4 last:border-0">
      <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Check({ checked, onChange, children, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-soft">
      <span
        className={`flex h-4 w-4 flex-none items-center justify-center rounded border ${checked ? "border-ink bg-ink text-white" : "border-[#cfc7b8] bg-white"}`}
      >
        {checked && <FiCheck className="h-3 w-3" />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="flex-1">{children}</span>
      {count != null && <span className="text-xs text-muted-faint">{count}</span>}
    </label>
  );
}

function SpecSection({ facet, selected, toggle }) {
  const [all, setAll] = useState(false);
  const LIMIT = 8;
  const options = all ? facet.options : facet.options.slice(0, LIMIT);
  return (
    <Section title={facet.label}>
      {options.map((o) => (
        <Check
          key={o.value}
          checked={selected.includes(o.value)}
          onChange={() => toggle(facet.key, o.value)}
          count={o.count}
        >
          {facet.key === "color" && SWATCH[o.label] && (
            <span
              className="mr-2 inline-block h-3 w-3 rounded-full align-[-1px] ring-1 ring-black/15"
              style={{ background: SWATCH[o.label] }}
            />
          )}
          {o.label}
        </Check>
      ))}
      {facet.options.length > LIMIT && (
        <button
          type="button"
          onClick={() => setAll(!all)}
          className="mt-1 text-xs font-semibold text-accent"
        >
          {all ? "Show fewer" : `Show all ${facet.options.length}`}
        </button>
      )}
    </Section>
  );
}

export default function FilterPanel({ facets, bands, sel, act }) {
  const brands = [...new Set([...(facets?.brands || []).map((b) => b.name), ...sel.brands])];
  const ratingCount = (min) => facets?.ratings?.find((r) => r.min === min)?.count;

  return (
    <div>
      <Section title="Brand">
        <div className="max-h-64 overflow-y-auto pr-1">
          {brands.map((b) => (
            <Check key={b} checked={sel.brands.includes(b)} onChange={() => act.toggleBrand(b)}>
              {b}
            </Check>
          ))}
        </div>
      </Section>
      {bands.length > 0 && (
        <Section title="Price">
          {bands.map((band) => (
            <Check
              key={band.label}
              checked={sel.band === band}
              onChange={() => act.pickBand(sel.band === band ? null : band)}
            >
              {band.label}
            </Check>
          ))}
        </Section>
      )}
      {(facets?.specs || []).map((facet) => (
        <SpecSection
          key={facet.key}
          facet={facet}
          selected={sel.specs[facet.key] || []}
          toggle={act.toggleSpec}
        />
      ))}
      {facets?.ratings && (
        <Section title="Customer rating">
          {RATINGS.map((r) => (
            <Check
              key={r}
              checked={sel.minRating === r}
              onChange={() => act.setOne("rating", sel.minRating === r ? null : r)}
              count={ratingCount(r)}
            >
              <span className="inline-flex items-center gap-1">
                {r}
                <FiStar className="fill-star text-star" size={12} /> & above
              </span>
            </Check>
          ))}
        </Section>
      )}
      <Section title="Discount">
        {DISCOUNTS.map((d) => (
          <Check
            key={d}
            checked={sel.minOff === d}
            onChange={() => act.setOne("off", sel.minOff === d ? null : d)}
          >
            {d}% or more
          </Check>
        ))}
      </Section>
      <Section title="Availability">
        <Check checked={sel.inStock} onChange={() => act.setOne("stock", sel.inStock ? null : 1)}>
          In stock only
        </Check>
      </Section>
    </div>
  );
}
