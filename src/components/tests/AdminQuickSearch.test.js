import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminQuickSearch from "../admin/AdminQuickSearch";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderSearch = (props = {}) =>
  render(
    <MemoryRouter>
      <AdminQuickSearch adminRole="super_admin" permissions={{}} {...props} />
    </MemoryRouter>
  );

describe("AdminQuickSearch", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("offers searches of list pages and section jumps for the typed term", () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: /search the admin panel/i });
    fireEvent.change(input, { target: { value: "ord" } });

    expect(screen.getByRole("option", { name: /search orders for “ord”/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /search products for “ord”/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /go to orders/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /go to settings/i })).not.toBeInTheDocument();
  });

  it("navigates to the first result with ?q on Enter, and arrow keys move the selection", () => {
    renderSearch();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "jane doe" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/products?q=jane%20doe");

    fireEvent.change(input, { target: { value: "jane" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenLastCalledWith("/admin/orders?q=jane");
  });

  it("only shows sections the admin has permission for", () => {
    renderSearch({ adminRole: "order_manager", permissions: { orders: "write" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "s" } });

    expect(screen.getByRole("option", { name: /search orders/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /search products/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /go to settings/i })).not.toBeInTheDocument();
  });

  it("focuses the desktop search when '/' is pressed outside an input", () => {
    renderSearch();
    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("selects a result on mouse down and calls onDone", () => {
    const onDone = jest.fn();
    renderSearch({ variant: "mobile", onDone });
    fireEvent.mouseDown(screen.getByRole("option", { name: /go to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    expect(onDone).toHaveBeenCalled();
  });
});
