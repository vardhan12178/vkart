import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://vkart.balavardhan.dev";
const DEFAULT_TITLE = "VKart — Curated Shopping, Fast Delivery";
const DEFAULT_DESC =
  "VKart is a curated e-commerce experience for electronics, fashion and essentials. Fast delivery, secure payments, and handpicked deals.";
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`;

const routeMeta = {
  "/": {
    title: "VKart — Curated Shopping, Fast Delivery",
    desc: DEFAULT_DESC,
  },
  "/products": {
    title: "Shop All Products • VKart",
    desc: "Browse handpicked products with quick delivery and great prices.",
  },
  "/blog": {
    title: "Blog • VKart",
    desc: "Stories, guides, and product highlights from the VKart team.",
  },
  "/about": {
    title: "About • VKart",
    desc: "The story and principles behind VKart’s curated shopping experience.",
  },
  "/contact": {
    title: "Contact • VKart",
    desc: "Questions, feedback, or partnerships — talk to us.",
  },
  "/careers": {
    title: "Careers • VKart",
    desc: "Join us to build a delightful shopping experience.",
  },
  "/terms": {
    title: "Terms of Service • VKart",
    desc: "Sample terms for this portfolio experience.",
  },
  "/privacy": {
    title: "Privacy Policy • VKart",
    desc: "How data is handled in this portfolio experience.",
  },
  "/license": {
    title: "License • VKart",
    desc: "Licenses and attributions for assets used on VKart.",
  },
};

const noindexPatterns = [/^\/cart/, /^\/checkout/, /^\/order/, /^\/success/, /^\/404/, /^\/error/, /^\/login/];

const websiteSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VKart",
  url: SITE,
  description: DEFAULT_DESC,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/products?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

const orgSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VKart",
  url: SITE,
  logo: `${SITE}/assets/categories/logo.png`,
  sameAs: [],
});

function pickMeta(pathname) {
  if (routeMeta[pathname]) return routeMeta[pathname];

  if (pathname.startsWith("/product/")) {
    return {
      title: "Product • VKart",
      desc: "Explore product details, specs, and reviews on VKart.",
    };
  }
  if (pathname.startsWith("/blog/")) {
    return {
      title: "Article • VKart",
      desc: "Read stories, guides, and highlights from VKart.",
    };
  }
  return { title: DEFAULT_TITLE, desc: DEFAULT_DESC };
}

export default function RouteSeo() {
  const { pathname } = useLocation();

  const meta = useMemo(() => pickMeta(pathname), [pathname]);
  const canonical = `${SITE}${pathname}`;
  const shouldNoindex = noindexPatterns.some((re) => re.test(pathname));

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <link rel="canonical" href={canonical} />

      <meta name="description" content={meta.desc} />
      <meta name="application-name" content="VKart" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="color-scheme" content="light" />
      <meta name="format-detection" content="telephone=no, email=no, address=no" />
      {shouldNoindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="VKart" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.desc} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      {/* JSON-LD structured data for home page */}
      {pathname === "/" && (
        <>
          <script type="application/ld+json">{websiteSchema}</script>
          <script type="application/ld+json">{orgSchema}</script>
        </>
      )}
    </Helmet>
  );
}
