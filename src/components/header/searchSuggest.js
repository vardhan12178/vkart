import { CATEGORIES } from "../shop/catalogData";

// Words shoppers type for each storefront category. Multi-word phrases match anywhere in the query;
// single words match whole query words, or as a prefix while the shopper is still typing.
const KEYWORDS = {
  mobiles: ["mobile", "mobiles", "phone", "phones", "smartphone", "iphone", "5g"],
  laptops: ["laptop", "laptops", "notebook", "macbook", "chromebook"],
  tablets: ["tablet", "tablets", "ipad"],
  tvs: ["tv", "tvs", "television", "smart tv"],
  monitors: ["monitor", "monitors", "gaming monitor"],
  audio: ["audio", "earbuds", "buds", "headphones", "headphone", "earphones", "airpods", "tws", "neckband"],
  wearables: ["watch", "watches", "smartwatch", "smartwatches", "fitness band"],
  skincare: ["skincare", "serum", "sunscreen", "moisturiser", "moisturizer", "face wash", "cleanser", "toner"],
  "fashion-men": ["men", "mens", "men's", "shirt", "shirts", "jeans", "chinos", "t-shirt", "tshirt", "polo"],
  "fashion-women": ["women", "womens", "women's", "kurti", "kurta", "dress", "earrings", "necklace", "jewellery", "saree"],
  appliances: ["appliance", "appliances", "ac", "air conditioner", "fridge", "refrigerator", "washing machine", "washer"],
  "kitchen-appliances": ["kitchen", "air fryer", "fryer", "kettle", "mixer", "fry pan", "cookware", "casserole"],
  grooming: ["grooming", "trimmer", "beard", "razor", "shaver", "hair wax"],
  sports: ["sports", "fitness", "gym", "yoga", "yoga mat", "pickleball", "dumbbell", "pull up bar"],
};

const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

const wordHit = (w, k) => w === k || (w.length >= 3 && k.startsWith(w)) || (k.length >= 3 && w === `${k}s`);

// Categories the query points at, with the leftover words to search inside each one.
// "samsung phone" -> [{ key: "mobiles", rest: "samsung" }]
export function matchCategories(query, limit = 2) {
  const q = norm(query);
  if (q.length < 2) return [];
  const words = q.split(" ");
  const hits = [];
  for (const [key, label] of Object.entries(CATEGORIES)) {
    const used = new Set();
    for (const k of [norm(label), ...KEYWORDS[key] || []]) {
      if (k.includes(" ")) {
        if (` ${q} `.includes(` ${k} `)) k.split(" ").forEach((p) => used.add(p));
      } else {
        words.forEach((w) => { if (wordHit(w, k)) used.add(w); });
      }
    }
    if (used.size) hits.push({ key, label, rest: words.filter((w) => !used.has(w)).join(" "), score: used.size });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit).map(({ score, ...h }) => h);
}

const RECENT_KEY = "vkart:recent-searches";
const RECENT_MAX = 6;

export function readRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(list) ? list.filter((s) => typeof s === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

const writeRecent = (list) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* storage blocked: recents are optional */ }
  return list;
};

export const saveRecent = (text) => {
  const t = String(text || "").trim();
  if (!t) return readRecent();
  return writeRecent([t, ...readRecent().filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX));
};

export const removeRecent = (text) => writeRecent(readRecent().filter((s) => s !== text));
export const clearRecent = () => writeRecent([]);

// The flat, keyboard-navigable list behind the dropdown. With an empty box it offers recent searches
// and popular categories; while typing it offers categories, products and a hand-off to the assistant.
export const POPULAR = ["mobiles", "audio", "laptops", "wearables", "fashion-women", "appliances"];

export function buildItems({ query, products = [], recent = [] }) {
  const q = String(query || "").trim();
  if (q.length < 2) {
    return [
      ...recent.map((text) => ({ type: "recent", id: `recent:${text}`, text })),
      ...POPULAR.map((key) => ({ type: "category", id: `popular:${key}`, key, label: CATEGORIES[key], rest: "", popular: true })),
    ];
  }
  return [
    ...matchCategories(q).map((c) => ({ type: "category", id: `cat:${c.key}`, ...c })),
    ...products.map((p) => ({ type: "product", id: `p:${p.slug}`, product: p })),
    { type: "ask", id: "ask", text: q },
  ];
}

export const categoryHref = ({ key, rest }) => `/products?cat=${encodeURIComponent(key)}${rest ? `&q=${encodeURIComponent(rest)}` : ""}`;
