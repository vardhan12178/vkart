import React from "react";
import { FiCheck } from "react-icons/fi";

export default function SideColumn({ p }) {
  return (
    <aside className="space-y-4">
      {p.inTheBox?.length > 0 && (
        <div className="rounded-3xl bg-paper p-5 shadow-sm">
          <h2 className="text-base font-bold text-ink">What's in the box</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
            {p.inTheBox.map((x) => (
              <li key={x} className="flex gap-2">
                <FiCheck className="mt-0.5 flex-none text-muted-light" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-3xl bg-paper p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">Warranty & returns</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {p.warranty || "Covered by the brand's standard warranty."}
        </p>
        <p className="mt-1 text-sm text-ink-soft">Easy returns within 7 days of delivery.</p>
      </div>
      <div className="rounded-3xl bg-paper p-5 text-xs text-muted-light shadow-sm">
        Product details from{" "}
        {[...new Map(p.source.urls.map((u) => [new URL(u).hostname, u])).entries()].map(
          ([host, u], i) => (
            <React.Fragment key={host}>
              {i > 0 && ", "}
              <a href={u} target="_blank" rel="noreferrer" className="underline">
                {host}
              </a>
            </React.Fragment>
          )
        )}
        , collected {p.source.fetchedAt}.
      </div>
    </aside>
  );
}
