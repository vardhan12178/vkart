// schema.org structured data for a product page, so search results can show price, stock and star rating.
// Sample reviews are included because the demo store labels them as such on the page.
const clean = (obj) => JSON.parse(JSON.stringify(obj));

export function productJsonLd(p, variant, { origin = "", images = [], inStock = true } = {}) {
  if (!p || !variant) return null;
  const url = `${origin}/products/${p.slug}?variant=${encodeURIComponent(variant.sku)}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.shortDescription || p.title,
    sku: variant.sku,
    mpn: variant.mpn || undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    image: images.length ? images : undefined,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: Number(variant.price).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "VKart" },
    },
  };
  if (p.rating?.average && p.rating?.count) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(p.rating.average).toFixed(1),
      ratingCount: p.rating.count,
      reviewCount: p.reviews?.reviewCount || undefined,
      bestRating: 5,
      worstRating: 1,
    };
  }
  const reviews = (p.reviews?.reviews || []).slice(0, 5);
  if (reviews.length) {
    ld.review = reviews.map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.stars, bestRating: 5, worstRating: 1 },
      name: r.title || undefined,
      reviewBody: r.body || undefined,
      author: { "@type": "Person", name: r.name || "VKart customer" },
      datePublished: r.date ? new Date(r.date).toISOString().slice(0, 10) : undefined,
    }));
  }
  return clean(ld);
}

export function breadcrumbJsonLd(items, origin = "") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${origin}${it.path}`,
    })),
  };
}
