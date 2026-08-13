import React from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import { canAccess } from "../../utils/adminPermissions";

/**
 * Route guard for admin pages. Blocks direct-URL access to a module the
 * logged-in employee doesn't have at least read access to, redirecting them
 * to the dashboard instead of rendering the page. Pairs with the sidebar
 * filtering in AdminSidebar, which hides the nav link for the same reason.
 */
export default function RequireModule({ module, children }) {
  const { adminRole, permissions } = useOutletContext() || {};

  if (!canAccess(adminRole, permissions, module, "read")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
