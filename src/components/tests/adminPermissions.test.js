import { canAccess } from "../../utils/adminPermissions";

describe("canAccess (admin RBAC gate)", () => {
  test("modules with no gate are always accessible regardless of role", () => {
    expect(canAccess(null, {}, undefined, "read")).toBe(true);
    expect(canAccess("employee", {}, undefined, "write")).toBe(true);
    expect(canAccess(null, null, "", "write")).toBe(true);
  });

  test("super_admin can access every module at every level, even with no permissions object", () => {
    expect(canAccess("super_admin", undefined, "orders", "read")).toBe(true);
    expect(canAccess("super_admin", undefined, "orders", "write")).toBe(true);
    expect(canAccess("super_admin", {}, "settings", "write")).toBe(true);
  });

  test("a non-admin role with read permission can read but not write", () => {
    const permissions = { orders: "read" };
    expect(canAccess("employee", permissions, "orders", "read")).toBe(true);
    expect(canAccess("employee", permissions, "orders", "write")).toBe(false);
  });

  test("a non-admin role with write permission can both read and write", () => {
    const permissions = { orders: "write" };
    expect(canAccess("employee", permissions, "orders", "read")).toBe(true);
    expect(canAccess("employee", permissions, "orders", "write")).toBe(true);
  });

  test("a module missing from the permissions map is denied at every level", () => {
    const permissions = { orders: "write" };
    expect(canAccess("employee", permissions, "coupons", "read")).toBe(false);
    expect(canAccess("employee", permissions, "coupons", "write")).toBe(false);
  });

  test("a completely missing permissions object denies access for non-super-admins", () => {
    expect(canAccess("employee", undefined, "orders", "read")).toBe(false);
    expect(canAccess("employee", null, "orders", "write")).toBe(false);
  });

  test("defaults to read-level access when no level is specified", () => {
    expect(canAccess("employee", { orders: "read" }, "orders")).toBe(true);
    expect(canAccess("employee", { orders: undefined }, "orders")).toBe(false);
  });

  test("an unrecognized permission value (e.g. legacy 'none') is treated as no access", () => {
    const permissions = { orders: "none" };
    expect(canAccess("employee", permissions, "orders", "read")).toBe(false);
    expect(canAccess("employee", permissions, "orders", "write")).toBe(false);
  });
});
