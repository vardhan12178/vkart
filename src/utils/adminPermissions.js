// Shared client-side permission check, mirroring backend/middleware/permissions.js.
// This is a UX convenience only (hide nav, disable buttons, block direct URLs) —
// the backend re-checks every write on every request, so this file is never
// the actual security boundary.

export function canAccess(adminRole, permissions, module, level = "read") {
  if (!module) return true; // modules with no gate (e.g. Dashboard) are always visible
  if (adminRole === "super_admin") return true;

  const granted = permissions?.[module];
  if (level === "read") return granted === "read" || granted === "write";
  return granted === "write";
}
