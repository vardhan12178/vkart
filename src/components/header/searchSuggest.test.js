import { matchCategories, buildItems, categoryHref, saveRecent, readRecent, removeRecent } from "./searchSuggest";

describe("matchCategories", () => {
  test("finds the category and keeps the other words as the search", () => {
    expect(matchCategories("samsung phone")[0]).toEqual({ key: "mobiles", label: "Mobiles", rest: "samsung" });
    expect(matchCategories("earbuds under 5000")[0]).toMatchObject({ key: "audio", rest: "under 5000" });
    expect(matchCategories("air fryer")[0]).toMatchObject({ key: "kitchen-appliances", rest: "" });
  });

  test("matches prefixes while typing, but not inside other words", () => {
    expect(matchCategories("lapt")[0]).toMatchObject({ key: "laptops" });
    expect(matchCategories("women kurti").map((c) => c.key)).toEqual(["fashion-women"]);
    expect(matchCategories("tvs")[0]).toMatchObject({ key: "tvs" });
  });

  test("ignores queries with no category words", () => {
    expect(matchCategories("sony")).toEqual([]);
    expect(matchCategories("a")).toEqual([]);
  });
});

describe("buildItems", () => {
  test("empty query: recent searches, then popular categories", () => {
    const items = buildItems({ query: "", recent: ["iphone"] });
    expect(items[0]).toMatchObject({ type: "recent", text: "iphone" });
    expect(items.slice(1).every((i) => i.type === "category" && i.popular)).toBe(true);
  });

  test("typed query: categories, products, then the assistant", () => {
    const items = buildItems({ query: "oneplus phone", products: [{ slug: "oneplus-15" }] });
    expect(items.map((i) => i.type)).toEqual(["category", "product", "ask"]);
    expect(categoryHref(items[0])).toBe("/products?cat=mobiles&q=oneplus");
  });
});

describe("recent searches", () => {
  beforeEach(() => localStorage.clear());

  test("newest first, no duplicates, at most six", () => {
    ["a1", "b2", "A1", "c3", "d4", "e5", "f6", "g7"].forEach(saveRecent);
    expect(readRecent()).toEqual(["g7", "f6", "e5", "d4", "c3", "A1"]);
    expect(removeRecent("c3")).toEqual(["g7", "f6", "e5", "d4", "A1"]);
  });

  test("survives bad stored data", () => {
    localStorage.setItem("vkart:recent-searches", "{oops");
    expect(readRecent()).toEqual([]);
  });
});
