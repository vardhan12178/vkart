// Recently viewed products, kept on this device as small product cards so rails need no extra requests.
const KEY = "vkart:recently-viewed";
const MAX = 12;

export function readRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((c) => c && typeof c === "object" && c.slug) : [];
  } catch {
    return [];
  }
}

export function pushRecent(card) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify([card, ...readRecent().filter((c) => c.slug !== card.slug)].slice(0, MAX))
    );
  } catch {
    /* storage unavailable */
  }
}
