import { formatPrice } from "../catalogApi";

const roundNice = (n) => {
  const step = n >= 100000 ? 10000 : n >= 20000 ? 5000 : n >= 5000 ? 1000 : n >= 1000 ? 500 : 100;
  return Math.max(step, Math.round(n / step) * step);
};

// Four price bands between the category's cheapest and dearest product. Prices are
// skewed (a few very expensive items), so the cuts are spaced geometrically.
export function priceBands(bounds) {
  if (!bounds || !(bounds.max > bounds.min)) return [];
  const lo = Math.max(100, bounds.min);
  const cuts = [
    ...new Set([1, 2, 3].map((k) => roundNice(lo * (bounds.max / lo) ** (k / 4)))),
  ].filter((c) => c > bounds.min && c < bounds.max);
  if (!cuts.length) return [];
  const bands = [{ max: cuts[0], label: `Under ${formatPrice(cuts[0])}` }];
  for (let i = 1; i < cuts.length; i++)
    bands.push({
      min: cuts[i - 1],
      max: cuts[i],
      label: `${formatPrice(cuts[i - 1])} – ${formatPrice(cuts[i])}`,
    });
  bands.push({ min: cuts[cuts.length - 1], label: `Over ${formatPrice(cuts[cuts.length - 1])}` });
  return bands;
}
