import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import RequireModule from "../admin/RequireModule";

// Renders a tiny layout that mirrors AdminLayout's Outlet context shape, so
// RequireModule's useOutletContext() call resolves the way it does in the
// real app (context is only readable by a route nested under this one).
function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

describe("RequireModule (admin route permission gate)", () => {
  const renderGuarded = ({ adminRole, permissions, module = "coupons" }) =>
    render(
      <MemoryRouter initialEntries={["/admin/coupons"]}>
        <Routes>
          <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
            <Route
              path="/admin/coupons"
              element={
                <RequireModule module={module}>
                  <div>Gated Coupons Page</div>
                </RequireModule>
              }
            />
            <Route path="/admin/dashboard" element={<div>Dashboard Landing</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  test("renders the gated page when the employee has read access to the module", () => {
    renderGuarded({ adminRole: "employee", permissions: { coupons: "read" } });
    expect(screen.getByText("Gated Coupons Page")).toBeInTheDocument();
  });

  test("renders the gated page for super_admin even with no explicit permissions", () => {
    renderGuarded({ adminRole: "super_admin", permissions: {} });
    expect(screen.getByText("Gated Coupons Page")).toBeInTheDocument();
  });

  test("redirects to the dashboard instead of rendering when the employee lacks access", () => {
    renderGuarded({ adminRole: "employee", permissions: { orders: "write" } });
    expect(screen.queryByText("Gated Coupons Page")).not.toBeInTheDocument();
    expect(screen.getByText("Dashboard Landing")).toBeInTheDocument();
  });

  test("redirects when there is no permissions context at all (e.g. context not yet loaded)", () => {
    renderGuarded({ adminRole: undefined, permissions: undefined });
    expect(screen.queryByText("Gated Coupons Page")).not.toBeInTheDocument();
    expect(screen.getByText("Dashboard Landing")).toBeInTheDocument();
  });

  test("write-only permission still grants access since the guard only requires read", () => {
    renderGuarded({ adminRole: "employee", permissions: { coupons: "write" } });
    expect(screen.getByText("Gated Coupons Page")).toBeInTheDocument();
  });
});
