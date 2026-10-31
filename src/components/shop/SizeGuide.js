import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

// Size charts for fashion products. Body measurements, so shoppers compare against themselves;
// rows are limited to the sizes the product actually comes in.

const LETTERS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const MEN_CHEST = { XS: 36, S: 38, M: 40, L: 42, XL: 44, XXL: 46, "3XL": 48, "4XL": 50, "5XL": 52 };
const MEN_WAIST = { S: 30, M: 32, L: 34, XL: 36, XXL: 38, "3XL": 40, "4XL": 42, "5XL": 44 };
const WOMEN = { // bust, waist, hip (inches)
  XXS: [30, 24, 33], XS: [32, 26, 35], S: [34, 28, 37], M: [36, 30, 39], L: [38, 32, 41], XL: [40, 34, 43], XXL: [42, 36, 45],
};
// UK size -> [US, EU, foot length cm]
const SHOES_MEN = { 5: [6, 39, 23.7], 6: [7, 40, 24.5], 7: [8, 41, 25.4], 8: [9, 42, 26.2], 9: [10, 43, 27.1], 10: [11, 44, 27.9], 11: [12, 45, 28.8], 12: [13, 46, 29.6] };
const SHOES_WOMEN = { 3: [5, 36, 22.5], 4: [6, 37, 23.3], 5: [7, 38, 24.1], 6: [8, 39, 24.9], 7: [9, 40, 25.7], 8: [10, 41, 26.5], 9: [11, 42, 27.3] };
const BANGLES = { 2.2: 54, 2.4: 57.2, 2.6: 60.3, 2.8: 63.5, 2.10: 66.7 }; // inner diameter, mm

const FOOTWEAR = new Set(["sneakers", "running", "flats", "sandals", "shoes", "heels"]);

const letterOf = (v) => String(v).toUpperCase().split("-")[0].trim(); // "XS-36" -> "XS"
const ukOf = (v) => Number(String(v).replace(/^UK\s*/i, ""));

const inches = (n) => (n == null ? null : { unit: "in", n });
const shown = (m, unit) => {
  if (m == null) return "–";
  if (typeof m !== "object") return String(m);
  return unit === "cm" ? `${Math.round(m.n * 2.54)}` : `${m.n}`;
};

export function sizeGuideFor(p) {
  if (p?.category !== "fashion") return null;
  const sizes = (p.variantOptions || []).find((o) => o.name === "Size")?.values.map((v) => v.value) || [];
  if (sizes.length < 2) return null; // "One Size" products need no guide
  const sub = p.categoryPath?.[2] || "";
  const women = (p.keySpecs?.gender || p.categoryPath?.[1]) === "Women" || p.categoryPath?.[1] === "women";

  if (FOOTWEAR.has(sub) && sizes.every((s) => Number.isFinite(ukOf(s)))) {
    const table = women ? SHOES_WOMEN : SHOES_MEN;
    return {
      kind: "footwear",
      title: `${women ? "Women's" : "Men's"} footwear`,
      columns: ["UK", "US", "EU", "Foot length (cm)"],
      rows: sizes.map((s) => [s, ...(table[ukOf(s)] || ["–", "–", "–"]).map(String)]),
      units: false,
      tips: ["Stand on a sheet of paper and mark your heel and longest toe.", "Measure the distance in cm and pick the size whose foot length is equal or just above it.", "Between sizes? Go half a size up for sneakers and running shoes."],
    };
  }

  if (sub === "bangles" && sizes.every((s) => BANGLES[Number(s)])) {
    return {
      kind: "bangles",
      title: "Bangle sizes",
      columns: ["Size", "Inner diameter (mm)"],
      rows: sizes.map((s) => [s, String(BANGLES[Number(s)])]),
      units: false,
      tips: ["Measure the inner diameter of a bangle that fits you well.", "Or bring your thumb and little finger together and measure around the widest part of your hand, then divide by 3.14."],
    };
  }

  if (sizes.every((s) => /^\d+$/.test(s) && Number(s) >= 22 && Number(s) <= 48)) {
    return {
      kind: "waist",
      title: `${women ? "Women's" : "Men's"} jeans & trousers`,
      columns: ["Size", "Waist", "Hip"],
      rows: sizes.map((s) => [s, inches(Number(s)), inches(Number(s) + (women ? 10 : 8))]),
      units: true,
      tips: ["Waist: measure around your natural waistline, keeping the tape a little loose.", "Hip: measure around the fullest part of your hips."],
    };
  }

  if (sizes.every((s) => LETTERS.includes(letterOf(s)))) {
    if (women) {
      return {
        kind: "women",
        title: "Women's clothing",
        columns: ["Size", "Bust", "Waist", "Hip"],
        rows: sizes.map((s) => [s, ...(WOMEN[letterOf(s)] || [null, null, null]).map(inches)]),
        units: true,
        tips: ["Bust: measure around the fullest part of your bust.", "Waist: measure around your natural waistline.", "Hip: measure around the fullest part of your hips."],
      };
    }
    const bottoms = ["chinos", "trousers", "shorts", "joggers"].includes(sub);
    return {
      kind: bottoms ? "men-bottoms" : "men-tops",
      title: bottoms ? "Men's trousers" : "Men's tops",
      columns: bottoms ? ["Size", "Waist"] : ["Size", "Chest"],
      rows: sizes.map((s) => [s, inches((bottoms ? MEN_WAIST : MEN_CHEST)[letterOf(s)])]),
      units: true,
      tips: bottoms
        ? ["Waist: measure around your natural waistline, keeping the tape a little loose."]
        : ["Chest: measure around the fullest part of your chest, under the arms.", "Between sizes? Pick the larger one for a relaxed fit."],
    };
  }
  return null;
}

export default function SizeGuide({ guide, selected, onClose }) {
  const [unit, setUnit] = useState("in");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Size guide: ${guide.title}`} onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-paper p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        <button type="button" aria-label="Close size guide" onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-black/5">
          <FiX />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-light">Size guide</p>
        <h2 className="pr-8 text-lg font-bold text-ink">{guide.title}</h2>

        {guide.units && (
          <div className="mt-4 inline-flex rounded-full border border-line-strong p-0.5 text-xs font-semibold" role="group" aria-label="Units">
            {["in", "cm"].map((u) => (
              <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)}
                className={`rounded-full px-3 py-1 transition ${unit === u ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                {u === "in" ? "Inches" : "Centimetres"}
              </button>
            ))}
          </div>
        )}

        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted-light">
              {guide.columns.map((c) => <th key={c} scope="col" className="py-2 pr-3 font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map(([size, ...cells]) => {
              const active = size === selected;
              return (
                <tr key={size} aria-current={active ? "true" : undefined} className={`border-b border-tint ${active ? "bg-tint font-semibold text-ink" : "text-ink-soft"}`}>
                  <th scope="row" className="py-2.5 pl-2 pr-3 font-semibold text-ink">{size}</th>
                  {cells.map((c, i) => <td key={i} className="py-2.5 pr-3">{shown(c, unit)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 className="mt-5 text-sm font-semibold text-ink">How to measure</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          {guide.tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <p className="mt-4 text-xs text-muted-light">Body measurements. Fits vary a little between brands.</p>
      </div>
    </div>
  );
}
