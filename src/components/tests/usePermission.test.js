import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import usePermission from "../admin/usePermission";

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

function Probe({ module }) {
  const { adminRole, canRead, canWrite } = usePermission(module);
  return (
    <div>
      <span data-testid="role">{adminRole ?? "null"}</span>
      <span data-testid="canRead">{String(canRead)}</span>
      <span data-testid="canWrite">{String(canWrite)}</span>
    </div>
  );
}

describe("usePermission hook", () => {
  const renderProbe = ({ adminRole, permissions, module = "orders" }) =>
    render(
      <MemoryRouter initialEntries={["/admin/orders"]}>
        <Routes>
          <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
            <Route path="/admin/orders" element={<Probe module={module} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  test("reports read-only access for a module granted 'read'", () => {
    renderProbe({ adminRole: "employee", permissions: { orders: "read" } });
    expect(screen.getByTestId("canRead")).toHaveTextContent("true");
    expect(screen.getByTestId("canWrite")).toHaveTextContent("false");
  });

  test("reports full access for a module granted 'write'", () => {
    renderProbe({ adminRole: "employee", permissions: { orders: "write" } });
    expect(screen.getByTestId("canRead")).toHaveTextContent("true");
    expect(screen.getByTestId("canWrite")).toHaveTextContent("true");
  });

  test("reports no access for a module absent from the permissions map", () => {
    renderProbe({ adminRole: "employee", permissions: { coupons: "write" } });
    expect(screen.getByTestId("canRead")).toHaveTextContent("false");
    expect(screen.getByTestId("canWrite")).toHaveTextContent("false");
  });

  test("grants full access to super_admin regardless of the permissions map", () => {
    renderProbe({ adminRole: "super_admin", permissions: {} });
    expect(screen.getByTestId("canRead")).toHaveTextContent("true");
    expect(screen.getByTestId("canWrite")).toHaveTextContent("true");
  });

  test("normalizes a missing adminRole to null rather than undefined", () => {
    renderProbe({ adminRole: undefined, permissions: undefined });
    expect(screen.getByTestId("role")).toHaveTextContent("null");
    expect(screen.getByTestId("canRead")).toHaveTextContent("false");
  });
});
