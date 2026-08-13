import { useOutletContext } from "react-router-dom";
import { canAccess } from "../../utils/adminPermissions";

/**
 * Reads adminRole/permissions from the AdminLayout Outlet context (set from
 * the /api/admin/verify response) and reports read/write access for a module.
 * Must be called from a component rendered inside AdminLayout's <Outlet>.
 */
export default function usePermission(module) {
  const { adminRole, permissions } = useOutletContext() || {};
  return {
    adminRole: adminRole || null,
    canRead: canAccess(adminRole, permissions, module, "read"),
    canWrite: canAccess(adminRole, permissions, module, "write"),
  };
}
