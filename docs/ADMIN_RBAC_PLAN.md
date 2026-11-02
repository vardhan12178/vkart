# VKart Admin RBAC — Employees & Permissions

Implementation plan for role-based access control on the admin panel: named roles, a per-module read/write permission matrix, a super_admin bypass, and an Employees management page.

## 1. Design recap (agreed)

- **Roles**: `super_admin`, `product_manager`, `customer_service`, `reviewer`, `order_manager`, `sales_manager` (extensible later).
- **Modules** (10): `products`, `orders`, `coupons`, `sales`, `membership`, `users`, `reviews`, `settings`, `notifications`, `employees`.
- **Access per module**: `none` | `read` | `write`. `write` implies `read`. `none` means the module is completely invisible — no nav item, no route access, no API access.
- **Role presets** pre-check boxes in the UI when a role is picked, but the source of truth for authorization is always the stored `permissions` object, not the role label — so individual modules can be overridden per employee after picking a preset.
- **super_admin** bypasses the permissions object entirely (hardcoded full access), so their matrix is irrelevant — UI fades/disables it when `super_admin` is selected.
- **Only an existing super_admin can grant super_admin.** A regular employee with `employees: write` can add/edit employees and assign any *other* role, but the super_admin option is blocked for them even though they can write to the Employees module. This needs its own explicit check, separate from the normal module-permission check.
- Open call (my recommendation, flagging it so it's a conscious choice): permission checks should hit the DB/cache on each admin request rather than trusting the JWT payload, so that revoking or downgrading someone's access takes effect immediately instead of waiting for their token to expire. The codebase already has a similar pattern for token revocation (`isTokenRevoked`, Redis-first with Mongo fallback) — permission checks can piggyback on the same `req.user.userId` lookup.

## 2. Current state (for reference)

- Admin gating today is a single flat check: `roles: ["admin"]` on the `User` document, enforced by `middleware/admin.js` (`isAdmin`) and `middleware/auth.js` (`requireAdmin`) — both just check `roles.includes("admin")`.
- No env-based admin gating exists anywhere in the code — it's 100% DB-driven.
- Admin-gated routes live across 9 files: `admin.users.routes.js`, `admin.reviews.routes.js`, `admin.settings.routes.js`, `admin.notifications.routes.js`, `product.routes.js`, `order.routes.js`, `coupon.routes.js`, `sale.routes.js`, `membership.routes.js` — mapping 1:1 to the 9 existing modules.
- Frontend: `AdminSidebar.js` has a hardcoded `navLinks` array; `AdminLayout.js` gates entry via `/api/admin/verify`; `App.js` nests all admin pages under one `<Route path="/admin">` guarded only by a boolean `isAdmin` — no per-page or per-module guard exists today.

## 3. Backend changes

### 3.1 Data model (`backend/models/User.js`)

Add two fields, keep `roles` as-is (it still gates "can this account reach the admin panel at all"):

```js
adminRole: {
  type: String,
  enum: ["super_admin", "product_manager", "customer_service", "reviewer", "order_manager", "sales_manager", null],
  default: null,
},
permissions: {
  type: Map,
  of: { type: String, enum: ["read", "write"] }, // absent key == "none"
  default: {},
},
```

Using a `Map` (or plain object) with absent-key-means-none avoids storing a "none" value at all — matches "unchecked module doesn't render."

### 3.2 Permission config (new file, e.g. `backend/config/permissions.js`)

Single source of truth so backend and any future admin tooling agree on the module list and role presets:

```js
export const MODULES = [
  "products", "orders", "coupons", "sales", "membership",
  "users", "reviews", "settings", "notifications", "employees",
];

export const ROLE_PRESETS = {
  product_manager:   { products: "write" },
  customer_service:  { users: "write" },
  reviewer:          { reviews: "write" },
  order_manager:     { orders: "write" },
  sales_manager:     { coupons: "write", sales: "write", membership: "write" },
  super_admin:       {}, // irrelevant — bypassed entirely
};
```

### 3.3 Middleware (`backend/middleware/permissions.js`, new)

Replaces `isAdmin`/`requireAdmin` on module-specific routes (base admin-panel-entry checks like `/admin/verify` can keep using the existing `roles.includes("admin")` check unchanged):

```js
export function requirePermission(module, level = "read") {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.userId).select("adminRole permissions blocked");
    if (!user || user.blocked) return res.status(403).json({ message: "Forbidden" });

    if (user.adminRole === "super_admin") return next();

    const granted = user.permissions?.get?.(module) || user.permissions?.[module];
    const ok = level === "read" ? (granted === "read" || granted === "write") : granted === "write";
    if (!ok) return res.status(403).json({ message: `Missing ${level} access to ${module}` });

    next();
  };
}

// Extra guard, stacked in addition to requirePermission("employees","write")
export function requireSuperAdminForRoleAssignment(req, res, next) {
  if (req.body?.adminRole === "super_admin" && req.user?.adminRole !== "super_admin") {
    return res.status(403).json({ message: "Only a super admin can grant super admin access" });
  }
  next();
}
```

(This does one extra DB read per admin request — acceptable at this scale, and it's what makes revocation instant. Can add a short-TTL cache later if it matters.)

### 3.4 New Employees API (`backend/routes/admin.employees.routes.js` + `admin.employees.controller.js`)

| Method | Path | Guard |
|---|---|---|
| GET | `/api/admin/employees` | `requirePermission("employees", "read")` |
| POST | `/api/admin/employees` | `requirePermission("employees", "write")`, `requireSuperAdminForRoleAssignment` |
| PATCH | `/api/admin/employees/:id` | same as POST |
| DELETE | `/api/admin/employees/:id` (revoke access) | `requirePermission("employees", "write")` + block if target is `super_admin` and actor isn't |

POST behavior: look up by email in existing `User` collection.
- Found → add `"admin"` to `roles` if missing, set `adminRole` + `permissions`.
- Not found → v1: return 404 "no account with that email yet, ask them to sign up first." (Real invite-by-email flow is a stretch goal, see §6.)

### 3.5 Update existing admin auth flows

`auth.controller.js` — `adminLogin`, `adminGoogleAuth`, `refresh`/token-renew paths: include `adminRole` in the JWT payload alongside `roles` (permissions themselves are re-fetched from DB per-request per §3.3, not trusted from the token). `verifyAdmin` response should also return `adminRole` and `permissions` so the frontend can build nav/UI without a second round trip.

### 3.6 Route-by-route swap

Every existing `requireAdmin`/`isAdmin` on a module route becomes `requirePermission(module, level)` — reads use `"read"`, mutations use `"write"`:

| File | Change |
|---|---|
| `product.routes.js` | GET routes → `requirePermission("products","read")`; POST/PUT/DELETE → `"write"` |
| `order.routes.js` | GET → read; PATCH (status updates) → write |
| `coupon.routes.js` | GET `/all` → read; POST/PATCH/DELETE → write |
| `sale.routes.js` | GET → read; POST/PUT/DELETE → write |
| `membership.routes.js` | GET `/admin/plans` → read; POST/PUT/DELETE → write |
| `admin.users.routes.js` | GET `/users` → `requirePermission("users","read")`; block/reset-password/disable-2fa/role/delete → `"write"` |
| `admin.reviews.routes.js` | GET → read; delete/moderate → write |
| `admin.settings.routes.js` | GET → read; update → write |
| `admin.notifications.routes.js` | GET → read; mutations → write |
| new `admin.employees.routes.js` | per §3.4 |

### 3.7 One-time migration script

Small script (or a one-off run in `backend/scripts/`) to set your existing account: `adminRole: "super_admin"`, keep `roles: ["user","admin"]` as-is. No other accounts need touching — anyone without `adminRole` set simply isn't an admin-panel employee.

## 4. Frontend changes

### 4.1 Carry permissions into the app

`AdminLayout.js`'s existing `/api/admin/verify` query already runs on every admin mount — extend its response (per §3.5) to include `adminRole` + `permissions`, and pass them down via the existing `<Outlet context={...}>` (already used for `refreshProfile`) so every admin page can read `const { permissions, adminRole } = useOutletContext()`.

### 4.2 `AdminSidebar.js`

Filter the hardcoded `navLinks` array by permission before rendering — add `module` to each entry and drop it if `adminRole !== "super_admin"` and `permissions[module]` is unset:

```js
const navLinks = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", module: null }, // always visible
  { name: "Products", icon: Package, path: "/admin/products", module: "products" },
  ...
  { name: "Employees", icon: UsersRound, path: "/admin/employees", module: "employees" }, // new
];
```

### 4.3 Route guards (`App.js`)

Currently every admin page sits under one `isAdmin`-only guard with no per-module check — add a small wrapper so direct URL access is blocked too, not just hidden nav:

```jsx
<Route path="products" element={<RequireModule module="products"><AdminProducts/></RequireModule>} />
```

`RequireModule` reads permissions from context (§4.1) and redirects to `/admin/dashboard` (or a 403 page) if the module isn't granted.

### 4.4 Read-only enforcement inside pages

For modules granted `read` but not `write` (e.g. a sales_manager viewing Orders read-only), each `Admin*.js` page needs its edit/delete/create buttons disabled or hidden — smallest approach is a `usePermission(module)` hook returning `{ canRead, canWrite }`, used to conditionally render action buttons in `AdminProducts.js`, `AdminOrders.js`, `AdminReviews.js`, `AdminUsers.js`, `AdminCoupons.js`, `AdminSales.js`, `AdminMembership.js`, `AdminSettings.js`.

### 4.5 New page: `AdminEmployees.js`

- Table: name/email, role badge, module summary, "Manage access" + "Revoke" actions. Gated by `employees:read` to view, `employees:write` to act.
- Add/Edit modal: email input (existing users only, per §3.4), role dropdown (presets), permission checklist below (auto-filled from preset, editable) — disabled entirely when role = `super_admin`.
- "Super Admin" option in the role dropdown only rendered if the *current logged-in user* is `super_admin` (defense in depth — backend already blocks it too, per §3.3).

## 5. Suggested execution order

1. **Backend data model + config** — User model fields, `permissions.js` config, migration script for your account.
2. **Middleware** — `requirePermission`, `requireSuperAdminForRoleAssignment`; update `verifyAdmin`/`adminLogin`/`adminGoogleAuth` to return/include `adminRole`.
3. **Employees API** — new routes + controller (build and test with Postman/curl before touching the UI).
4. **Swap existing routes** — go file by file through §3.6, one module at a time, testing each in isolation.
5. **Frontend plumbing** — `AdminLayout` context, `usePermission` hook, `RequireModule` guard.
6. **Sidebar filtering** — smallest visible win, good checkpoint.
7. **Employees page** — the biggest UI piece, build last since it depends on everything above existing and working.
8. **Read-only UI pass** — disable write affordances per page for read-only modules.
9. **End-to-end test** — create one throwaway account per role, verify nav/API/UI all agree for each.

## 6. Stretch goals (not required for v1)

- Audit log: who blocked/reset/deleted what — matters more once multiple employees have write access to sensitive actions.
- True invite-by-email flow (currently requires the person to already have an account).
- Self-serve "transfer super_admin" flow, with confirmation, instead of DB-only.
- Multiple roles per employee (currently one `adminRole` + one `permissions` object per user — fine for the described use case, but worth knowing it's a single-role model, not multi-role).

## 7. Testing checklist

- [ ] Each role, logged in fresh, sees only its granted modules in the sidebar.
- [ ] Direct URL to an ungranted module redirects/blocks rather than rendering.
- [ ] `read`-only employee cannot trigger any write API call (buttons hidden AND backend rejects if called directly).
- [ ] Non-super_admin with `employees:write` cannot assign `super_admin` via API even by crafting the request manually.
- [ ] Revoking an employee's access takes effect without them needing to log out (per §1 DB-lookup decision).
- [ ] Existing single-super-admin flow (your account) still works unchanged through this migration.
