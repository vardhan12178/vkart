// The products picked for comparison (slugs), kept on this device. The compare page also reads and
// writes them in its URL (?p=a,b,c), so a comparison can be shared.
const KEY = "vkart:compare";
export const MAX_COMPARE = 4;

export function readCompare() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((s) => typeof s === "string").slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

export function writeCompare(slugs) {
  const list = [...new Set(slugs)].slice(0, MAX_COMPARE);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
  return list;
}

export const addToCompare = (slug) => writeCompare([...readCompare().filter((s) => s !== slug), slug].slice(-MAX_COMPARE));
export const removeFromCompare = (slug) => writeCompare(readCompare().filter((s) => s !== slug));
export const compareUrl = (slugs) => `/compare${slugs.length ? `?p=${slugs.map(encodeURIComponent).join(",")}` : ""}`;
