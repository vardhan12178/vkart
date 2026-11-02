import { productJsonLd, breadcrumbJsonLd } from "../shop/productJsonLd";

const p = {
  slug: "nova-5g",
  title: "Nova 5G",
  brand: "Nova",
  shortDescription: "A phone",
  rating: { average: 4.46, count: 1200 },
  reviews: {
    reviewCount: 300,
    reviews: [
      { stars: 5, title: "Great", body: "Loved it", name: "Asha", date: "2026-01-05T00:00:00Z" },
    ],
  },
};
const v = { sku: "NOVA-128-BLK", price: 24999, mpn: "N5" };

describe("productJsonLd", () => {
  test("describes offer, brand and rating", () => {
    const ld = productJsonLd(p, v, {
      origin: "https://shop.test",
      images: ["a.webp"],
      inStock: true,
    });
    expect(ld["@type"]).toBe("Product");
    expect(ld.offers).toMatchObject({
      priceCurrency: "INR",
      price: "24999.00",
      availability: "https://schema.org/InStock",
    });
    expect(ld.offers.url).toBe("https://shop.test/products/nova-5g?variant=NOVA-128-BLK");
    expect(ld.aggregateRating).toMatchObject({
      ratingValue: "4.5",
      ratingCount: 1200,
      reviewCount: 300,
    });
    expect(ld.review[0]).toMatchObject({ author: { name: "Asha" }, datePublished: "2026-01-05" });
    expect(ld.brand.name).toBe("Nova");
  });

  test("marks out of stock and omits rating/reviews when there are none", () => {
    const ld = productJsonLd({ ...p, rating: null, reviews: null }, v, { inStock: false });
    expect(ld.offers.availability).toBe("https://schema.org/OutOfStock");
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
  });

  test("returns null without a variant, and breadcrumbs are ordered", () => {
    expect(productJsonLd(p, null)).toBeNull();
    const b = breadcrumbJsonLd(
      [
        { name: "Home", path: "/" },
        { name: "Phones", path: "/products?cat=mobiles" },
      ],
      "https://shop.test"
    );
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item).toBe("https://shop.test/products?cat=mobiles");
  });
});
