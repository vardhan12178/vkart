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
| 3 | Stack modernization | Done — awaiting owner review |
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

- ~~`<div id="root">` is rendered inside `#root` in `App.js` (duplicate id)~~ — fixed in Phase 3.
- AVIF variants skipped (no AVIF encoder in the build environment). Still open; moved to Phase 8.

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

## Phase 3 — Stack modernization (safety net before big UI/AI work) ✅

What shipped (branch `ccr-d558e8f9-ithgfk`, both repos):

- **Checkout pricing (backend):**
  - `POST /api/razorpay/create-order` now requires the cart. The legacy client-`amount` request is gone.
  - The quote shown at "Pay" is saved with the Razorpay order. If a sale starts or ends before the order is placed, the customer gets the price they paid, provided the cart, promo and wallet are unchanged. This used to reject an already-charged payment.
- **Express 4 → 5:**
  - `express-mongo-sanitize` and `hpp` don't support Express 5, so they are replaced by an in-house query parser plus sanitiser (`middleware/security.js`).
  - Optional Sentry (`instrument.js`), inert without `SENTRY_DSN`.
- **Frontend tests:**
  - Jest 27 + Babel → Vitest (442 tests).
  - New Playwright E2E suite (`npm run test:e2e`, `e2e/`) covering browse → bag, the out-of-stock guard, search, the full wallet checkout with a coupon, and admin order handling and quick search. It runs on desktop and mobile viewports and is re-seeded from `backend/scripts/seed-dev.js` before each run.
  - A new `e2e` CI job runs it against a real Mongo replica set and Redis.
- **Upgrades:**
  - React 18 → 19, React Router 6 → 7, Tailwind 3 → 4 (CSS-first config in `src/App.css`; no `tailwind.config.js` or PostCSS).
  - Screenshot comparison against the pre-upgrade build shows no layout changes.
- **Dependency diet:**
  - One icon set (lucide). react-icons and heroicons v1 are removed.
  - Embla carousels replace react-slick.
  - Customer notifications move from Redux to React Query.
  - The live-notification socket loads only for signed-in users.
- **PWA:**
  - `vite-plugin-pwa` (Workbox) replaces the hand-written service worker.
  - Products and the home feed fall back to cache when offline.
  - A "New version available" prompt replaces silent updates.
- **Monitoring:** optional Sentry in the storefront too (`VITE_SENTRY_DSN`). The SDK is a separate chunk, loaded only when a DSN is set.
- **Bugs found along the way:**
  - The wallet-only checkout was blocked when the Razorpay script failed to load.
  - Purchased items came back in the bag on the next sign-in. The client clears the bag through a debounced sync that is lost if the page navigates right away; the backend now clears them inside the order transaction.
  - A rate-limited sign-in said "Invalid credentials". It now says "Too many sign-in attempts", and only failed attempts count toward the limit.
  - The duplicate `#root` id is fixed.

Notes:

- **Deploy both repos together.**
  - The new backend rejects the amount-only create-order request that the storefront on `main` sends. The new storefront sends only the cart, which the backend on `main` rejects.
  - Online (Razorpay) checkout fails in the gap between the two deploys. Wallet-only orders are unaffected.
  - Deploy the backend first, then the storefront straight after.
- Main bundle: 139 KB gzip, down from 154 KB. React 19 itself costs about 17 KB gzip, which the lazy socket and the dropped icon/carousel libraries more than pay for.
- Icons are now lucide everywhere, so a few glyphs look slightly different (stroke style). The half-star rating keeps its old look.
- New optional env vars:
  - Backend: `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `RELEASE`, and `API_RATE_LIMIT_PER_MIN` (default 200; raised only for E2E).
  - Storefront: `VITE_SENTRY_DSN`, `VITE_SENTRY_TRACES_SAMPLE_RATE`, `VITE_RELEASE`.
- Running E2E locally:
  - Start Mongo (replica set) and Redis, the backend on :5000, and `vite build && vite preview --port 3000`.
  - Then run `E2E_MONGO_URI=mongodb://localhost:27017/vkart_e2e?replicaSet=rs0&directConnection=true npm run test:e2e`.
  - The seed refuses any database whose name lacks `dev`, `e2e` or `test`.
  - Sign-ins: shopper `shopper` / `Shopper@123`; admin `admin@vkart.test` / `Admin@12345`.

Manual verification checklist:

1. **Visual check.** Click through the storefront and admin on desktop and phone. Look for spacing, borders or font sizes that look off (Tailwind 4), and icons that are missing or look wrong.
2. **Product page.** The gallery swipes and zooms and the thumbnails work. On the home page, the product rails scroll with arrows and by swipe.
3. **Razorpay test mode.** Check out with a card, with a coupon, and with a partial wallet. Also check out paying fully from the wallet.
4. **Bag after an order.** Place an order, sign out, sign back in: the bag is empty.
5. **Notifications.** Customer notifications arrive live, and "mark all read" works.
6. **PWA.** Load the site, go offline (DevTools → Network → Offline), and browse products you've seen. After a new deploy, the update prompt appears.
7. **Admin.** Advance an order through its stages. The `/` quick search works.
8. **GitHub Actions.** Once a PR exists, both the `test` and `e2e` jobs are green.

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
- Sentry DSN (optional; Phase 3 shipped the wiring, inert until a DSN is set)
- Dataset choice (Phase 9)
