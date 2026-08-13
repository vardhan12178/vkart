# VKart Code Audit — Dead Code, Reusability, MVC

Audit of the current codebase against three questions: what's dummy/unused, what frontend code should be shared components or split up, and where the backend deviates from clean MVC. Grounded in actual grep/line-count results, not guesses.

## 1. Dead / dummy code (safe to remove)

- `src/components/Dropdown.js` — never imported anywhere. `CustomDropdown.js` is the component actually used (`Products.js` imports that one). Delete `Dropdown.js`.
- `backend/middleware/admin.js` (`isAdmin`) — orphaned since the RBAC migration; nothing imports it anymore.
- `AdminHeader.js` has three decorative, non-functional controls: the desktop and mobile search inputs (no `onChange`, no state, no submit — pure visual), the "Quick Search" suggestion buttons (Recent orders / Popular products / Customer list — no `onClick`), and "View All Notifications" (no `onClick`, no destination). Either wire these up or remove them — right now they look interactive but do nothing.
- The legacy `PATCH /users/:id/role` toggle-admin action on the Users page now overlaps with the Employees flow — it can leave someone with `roles:["admin"]` but no `adminRole`/permissions, which silently locks them out of every admin page instead of erroring clearly. Worth hiding now that Employees is the real path in.
- `Settings.freeShippingThreshold` / `Settings.primeEnabled` — exist on the model, and the admin API already accepts updates to them, but nothing in checkout logic reads them (`order.controller.js` still hardcodes `FREE_SHIPPING_THRESHOLD = 999`; nothing checks `primeEnabled` anywhere). Already on the project backlog — confirmed still true.
- Opposite problem: `Settings.gstNumber` / `Settings.address` are real (used on the invoice PDF's "Sold by" block) but have no admin UI field to ever set them — currently only settable by editing the DB directly.

## 2. Frontend reusability — no shared component library exists

There's no `src/components/ui/` (or equivalent) at all — every page reimplements its own primitives from scratch. Concrete duplicates found, several introduced by the RBAC build this session:

- `Modal` — identical implementation in `AdminUsers.js` and `AdminEmployees.js`
- `InputGroup` — identical implementation in `AdminSettings.js` and `AdminProfile.js`
- `avatarInitial()` — duplicated in `AdminUsers.js` and `AdminEmployees.js`
- `ROLE_LABELS` map — duplicated three times: `AdminHeader.js`, `AdminEmployees.js`, `AdminProfile.js`

Recommended fix: `src/components/admin/ui/` for shared primitives (Modal, InputGroup, StatCard, Th, Badge) and a single `src/constants/adminRoles.js` exporting `ROLE_LABELS`/`MODULES`, imported everywhere instead of copy-pasted. This is mechanical, low-risk work.

## 3. Frontend files worth splitting

Full `src` is ~22.4k lines; most files are reasonably sized. These ten are the outliers — each mixes data-fetching, form state, and heavy JSX in a single file and would benefit from being broken into subcomponents and/or extracted hooks:

| File | Lines |
|---|---|
| `Profile.js` | 973 |
| `ProductCard.js` | 890 |
| `admin/AdminProducts.js` | 842 |
| `CheckoutForm.js` | 759 |
| `admin/AdminOrderDetails.js` | 705 |
| `Home.js` | 684 |
| `Products.js` | 661 |
| `Login.js` | 616 |
| `Register.js` | 614 |
| `admin/AdminDashboard.js` | 597 |

`Login.js`/`Register.js` in particular likely share a lot of form logic (validation, error handling, 2FA/Google auth) that could become one shared hook instead of two parallel 600-line implementations.

## 4. Backend — MVC gaps

Routes themselves are clean — checked for direct DB/model access inside `routes/*.js` and found none; all data access already goes through controllers. The real gaps are inside the controllers:

- **No service layer for the two heaviest controllers.** `order.controller.js` (821 lines) — `createOrder` alone is ~250 lines handling pricing, coupon validation, stock checks, wallet debits, and notification creation inline. `product.controller.js` (841 lines) has similarly large functions. `backend/services/` already exists and is used for email/AI/refund-scheduling — order and product logic should move there too instead of living directly in the controller.
- **`round2()` reimplemented 4 times** — `coupon.controller.js`, `payment.controller.js`, `order.controller.js`, and `models/Order.js` each define their own copy instead of importing the canonical one from `utils/calc.js`.
- **`toIdString`/`secureEqual` duplicated across 4 controllers** — `order`, `wallet`, `membership`, `payment`. Should be one `utils/helpers.js`.
- **`new Razorpay(...)` instantiated 3 separate times** — `payment.controller.js`, `membership.controller.js`, `wallet.controller.js` — instead of one shared client in `utils/razorpay.js`.

(These three duplication items were already flagged on the existing project backlog — re-confirmed all still present in current code.)

**One clean result worth noting:** checked every controller export against every route file for orphaned/dead endpoints — found none. Every exported controller function is reachable, either via a route or as a legitimate internal import by another controller/service.

## Suggested order of attack

1. Dead-code removal (§1) — quick, essentially zero risk.
2. Shared admin UI components + constants (§2) — medium effort, mechanical, touches several files but no behavior change.
3. Backend service extraction + dedup (§4) — highest value for "proper MVC," but touches order/payment/pricing logic directly, so it's the one to do carefully with tests run after.
4. Large file splits (§3) — biggest total effort, lowest urgency; good to do opportunistically when touching those files for other reasons rather than as a big-bang rewrite.
