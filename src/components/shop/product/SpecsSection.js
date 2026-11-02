import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { label, SpecValue } from "../specFormat";
import { ACCENT } from "./theme";

// Collapsed view: first two groups, at most 12 rows in total
const SPEC_ROWS = 12;

export default function SpecsSection({ specs }) {
  const [allSpecs, setAllSpecs] = useState(false);
  const specGroups = Object.entries(specs || {}).filter(([, f]) => f && Object.keys(f).length);
  if (!specGroups.length) return null;
  const totalRows = specGroups.reduce((n, [, f]) => n + Object.keys(f).length, 0);
  const shownGroups = allSpecs
    ? specGroups
    : specGroups.slice(0, 2).reduce((acc, [g, f]) => {
        const left = SPEC_ROWS - acc.reduce((n, [, x]) => n + Object.keys(x).length, 0);
        if (left > 0) acc.push([g, Object.fromEntries(Object.entries(f).slice(0, left))]);
        return acc;
      }, []);
  const collapsed = !allSpecs && (specGroups.length > 2 || totalRows > SPEC_ROWS);
  return (
    <section className="rounded-3xl bg-paper p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-ink">Specifications</h2>
      <div className="mt-4 space-y-5">
        {shownGroups.map(([group, fields]) => (
          <div key={group}>
            <h3 className="border-b border-line pb-2 text-sm font-semibold text-ink">{group}</h3>
            <dl>
              {Object.entries(fields).map(([k, v]) =>
                k === "points" ? (
                  <ul key={k} className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                    {[].concat(v).map((x, i) => (
                      <li key={i}>{String(x)}</li>
                    ))}
                  </ul>
                ) : (
                  <div
                    key={k}
                    className="grid grid-cols-[minmax(110px,35%)_1fr] gap-3 border-b border-tint py-2.5 text-sm last:border-0"
                  >
                    <dt className="text-muted-light">{label(k)}</dt>
                    <dd className="text-ink">
                      <SpecValue value={v} />
                    </dd>
                  </div>
                )
              )}
            </dl>
          </div>
        ))}
      </div>
      {(collapsed || allSpecs) && (specGroups.length > 2 || totalRows > SPEC_ROWS) && (
        <button
          type="button"
          onClick={() => setAllSpecs(!allSpecs)}
          className="mt-4 flex items-center gap-1 text-sm font-semibold"
          style={{ color: ACCENT }}
        >
          {allSpecs
            ? "Show fewer"
            : specGroups.length > 2
              ? `Show all ${specGroups.length} sections`
              : `Show all ${totalRows} specifications`}
          <FiChevronDown className={allSpecs ? "rotate-180" : ""} />
        </button>
      )}
    </section>
  );
}
