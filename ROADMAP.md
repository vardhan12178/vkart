# VKart Improvement Roadmap

Phased plan covering both repos (`vkart` frontend, `backend` API). Agreed Oct 2026.

## Ground rules

- All work happens on a feature branch in **both** repos. Nothing is pushed or merged to `main`, and no PR is opened, until the owner has verified it manually.
- Each phase lands as its own set of commits so it can be reviewed or reverted independently.
- CI only runs on `main` pushes and PRs to `main`, so before pushing each phase: run backend tests, frontend tests, and `vite build` locally.
- Each phase ends with a short manual-verification checklist.

## Status

| Phase | Title | Status |
|---|---|---|
| 1 | Cleanup & performance quick wins | Done — awaiting owner review |
| 2 | Money & security correctness | Done — awaiting owner review |
| 3 | Stack modernization | Not started |
| 4 | AI upgrade (core) | Not started |
| 5 | Design & motion | Not started |
| 6 | New commerce features | Not started |
| 7 | Advanced AI | Not started |
| 8 | SEO, refactors & polish | Not started |
| 9 | Catalog replacement (deferred) | Not started |

---

## Phase 1 — Cleanup & performance quick wins (low risk) ✅

What shipped (branch `ccr-d558e8f9-ithgfk`, both repos):

- **Assets:** removed 29 unreferenced images from `public/` (~32MB → ~1.2MB). Hero now ships 768/1024/1536w WebP via `srcSet` + `sizes` (phones download 16–28KB instead of 110KB). Icons losslessly recompressed.
- **Image loading:** `loading="lazy"` + `decoding="async"` on below-the-fold/list images across storefront and admin; product page main image is `eager` + `fetchpriority="high"` (rest of gallery lazy) with real alt text.
- **Broken fallbacks:** `via.placeholder.com` (shut down) replaced with a shared inline SVG (`src/utils/imagePlaceholder.js`).
- **SEO / PWA:** `og-image.jpg` and the schema.org logo were referenced but missing — added `og-image.jpg` (1200×630), schema logo now points at `/icon-512.png`. `theme-color` (#e9e1d6) and manifest colors match the real palette; added a proper maskable icon.
- **Housekeeping:** Node engines `24.x` in both repos; invalid `py-0.2` → `py-px` (9 places). `Dropdown.js` / `middleware/admin.js` were already gone.
- **Admin header search** (was decorative): now a jump-to search — "Search orders/products/users/reviews for …" (opens the page with `?q=`) plus section jumps, permission-filtered, keyboard navigable, `/` shortcut. Sidebar and search share `src/constants/adminNav.js`.
- **Real-user Core Web Vitals:** storefront reports LCP/INP/CLS/FCP/TTFB (`web-vitals` v5, lazy-loaded, production only) to `POST /api/vitals`; backend keeps the latest 1000 samples per metric in Redis (paths normalised, no ids) and serves `GET /api/admin/vitals`; new "Storefront performance" card on the admin dashboard shows p75 + good/needs-improvement/poor split.

Manual verification checklist:

1. Home page (mobile + desktop): hero image sharp, no broken images anywhere.
2. Product page: main image loads immediately; gallery swipe works.
3. Share a link in WhatsApp/Slack → preview shows the hero image (after deploy).
4. Android "Add to home screen": icon fills the shape, splash/status bar match the cream palette.
5. Admin: type in header search → results; Enter opens Orders/Products/Users/Reviews pre-filtered; `/` focuses search; mobile search overlay works; roles only see their sections.
6. Admin dashboard: "Storefront performance" card (empty until production traffic arrives, then p75 values).
7. Backend needs Redis reachable (already required) — no new env vars.

Notes for later phases:

- `<div id="root">` is rendered inside `#root` in `App.js` (duplicate id) — fix during the Phase 3 React 19 upgrade.
- AVIF variants skipped (no AVIF encoder in the build environment) — revisit with `vite-imagetools` in Phase 3.

## Phase 2 — Money & security correctness (`backend/ACTION_ITEMS.md`) ✅

What shipped (details and deploy notes in `backend/ACTION_ITEMS.md`):

- **Checkout:** one Razorpay payment can only ever become one order. There are unique indexes on `paymentId`/`paymentOrderId`, a claim lock per verification token, idempotent `/razorpay/verify`, and atomic session pops. Concurrent-checkout write conflicts return a clean 409 "please retry" instead of a 500.
- **Server-priced Razorpay order:** the storefront sends the cart and the backend prices it with the same `quoteCheckout()` that places the order. The legacy `amount` request is kept for one release.
- **Coupons:** a use is claimed atomically inside the order transaction, so `usageLimit`/`perUserLimit` hold under concurrency.
- **Wallet top-up / Prime:** credited exactly once per payment. Two different Prime payments landing together both count.
- **Auth:** roles, admin role and blocked status are read live from the DB on every request (HTTP and Socket.io). Demotion and blocking take effect immediately, and blocked users are signed out.
- **Refund scheduler:** it no longer marks no-gateway refunds "completed"; it flags them to admins instead.
- **Smaller fixes:** Google sign-up usernames, inactive products hidden (404), `multer` 2.x, and AI daily quotas (100/day signed-in, 20/day guest IP), with a clear message in the chat.
- **Tests:** `backend/tests/hardening.test.js` (17 tests). The race tests were run against the old code first to confirm they fail there.

Manual verification checklist:

1. Checkout in Razorpay test mode: card and netbanking, with and without a coupon, with partial wallet. The amount in the Razorpay modal should match the order total.
2. Double-click "Confirm & Pay" / refresh during verification: still exactly one order.
3. Wallet top-up and Prime purchase still work. The balance and Prime end date are correct.
4. Admin: demote or block an account in another browser. That session loses access on its next click; a blocked user is sent to login.
5. Deactivate a product: its page 404s for shoppers and still opens from the admin.
6. Before deploying, run the duplicate-`paymentId` check in `ACTION_ITEMS.md` → "Deploy notes".

## Phase 3 — Stack modernization (safety net before big UI/AI work)

- Remove the legacy client-`amount` path from `POST /api/razorpay/create-order` (kept one release in Phase 2).
- Frontend tests: Jest 27 → Vitest; add Playwright E2E for core flows (browse → cart → checkout in Razorpay test mode, login, admin order handling).
- React 18 → 19, React Router 6 → 7, Tailwind 3 → 4 (official codemods), Express 4 → 5.
- Dependency diet: one icon set (lucide; drop react-icons + heroicons v1), Embla instead of react-slick, move server state out of Redux into React Query.
- `vite-plugin-pwa` (Workbox) replaces the hand-rolled service worker (prereq for web push).
- Sentry error tracking (needs DSN from owner; skipped if not provided).

## Phase 4 — AI upgrade (core)

- Streaming chat responses (SSE) instead of wait-for-full-answer.
- Agentic assistant via function calling: track order, add to cart, apply best coupon, start return/cancel (with confirmation), answer from the logged-in user's order history.
- AI → human handoff into the existing support inbox with conversation summary.
- Chat UX: inline product cards, quick actions, persisted per-user conversation.

## Phase 5 — Design & motion

- Landing page: scroll-linked hero parallax, staggered card reveals, animated brand marquee.
- Hero motion video: muted loop, desktop + fast connections only, `.webp` poster, honours `prefers-reduced-motion` (**owner to supply clip or pick stock/AI-generated**).
- View Transitions: product card → product page morph.
- Mobile bottom nav (Home / Search / Cart / Account).
- Skeleton loaders everywhere, pinch-zoom/swipe product gallery, optimistic cart & wishlist.
- Dark mode (system-aware + toggle).

## Phase 6 — New commerce features

- Back-in-stock & price-drop alerts (email + in-app + web push).
- Frequently bought together, recently viewed, abandoned-cart email.
- Product Q&A, photo reviews.
- Passkeys (WebAuthn) login alongside existing 2FA.
- UPI Intent / QR at checkout via Razorpay.

## Phase 7 — Advanced AI

- Visual search (upload a photo → similar products via Gemini vision + Atlas vector index).
- Voice search (Web Speech API; English, Hindi, Telugu).
- Admin AI: product description / SEO generator, image auto-tagging, support reply suggestions, natural-language sales insights on the dashboard.

## Phase 8 — SEO, refactors & polish

- Pre-render / SSR product, category and blog pages (React Router 7 framework mode or build-time prerender).
- Dynamic sitemap, per-product OG images, breadcrumb structured data.
- Split oversized files (`ProductCard.js` 1.1k lines, `Profile.js`, `CheckoutForm.js`) per `CODE_AUDIT.md`.

## Phase 9 — Catalog replacement (deferred, not a priority)

- Pick dataset: Kaggle "Flipkart Products" (~20k) or "Amazon Products 2023" (curated down to ~2–3k strong items).
  - Caveat: these are scraped datasets and images hotlink retailer CDNs (can break / get blocked). Plan is to re-host chosen images on our S3 and check the dataset licence first.
- Process:
  1. Back up the current `products` collection.
  2. Write an import script mapping the dataset to our schema (category, specs, variants, INR pricing, stock).
  3. Wipe old products; re-run `vectorize-products` for embeddings.
  4. Re-check home categories, sale overlays, recommendations.
- Existing orders keep their product snapshot; reviews/wishlists referencing old products need clearing — **confirm with owner before deleting anything**.

## Inputs needed from owner

- Hero video clip (Phase 5)
- Sentry DSN (Phase 3, optional)
- Dataset choice (Phase 9)
