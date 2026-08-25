import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminMembership from "../admin/AdminMembership";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const PLANS = [
  {
    _id: "plan1",
    name: "Monthly",
    slug: "monthly",
    durationDays: 30,
    price: 199,
    originalPrice: 299,
    features: ["Free shipping"],
    isPopular: true,
    isActive: true,
  },
];

describe("AdminMembership Component", () => {
  let queryClient;
  let confirmSpy;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => confirmSpy.mockRestore());

  const renderMembership = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/membership"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/membership" element={<AdminMembership />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders plan cards with pricing", async () => {
    axios.get.mockResolvedValueOnce({ data: PLANS });
    renderMembership();
    expect(await screen.findByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("₹199")).toBeInTheDocument();
    expect(screen.getByText("Free shipping")).toBeInTheDocument();
  });

  test("shows the empty state when there are no plans", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    renderMembership();
    expect(await screen.findByText(/no plans created yet/i)).toBeInTheDocument();
  });

  test("shows an error banner when plans fail to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderMembership();
    expect(await screen.findAllByText(/failed to load plans/i)).not.toHaveLength(0);
  });

  test("creates a new plan with the entered fields", async () => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderMembership();
    await screen.findByText(/no plans created yet/i);

    fireEvent.click(screen.getByRole("button", { name: /new plan/i }));
    fireEvent.change(screen.getByPlaceholderText("Monthly"), { target: { value: "Quarterly" } });
    fireEvent.change(screen.getByPlaceholderText("monthly"), { target: { value: "quarterly" } });
    fireEvent.change(screen.getByText("Duration (days)").nextElementSibling, { target: { value: "90" } });
    fireEvent.change(screen.getByText("Price (₹)").nextElementSibling, { target: { value: "499" } });
    fireEvent.change(screen.getByPlaceholderText("Feature perk text"), { target: { value: "Priority support" } });

    fireEvent.click(screen.getByRole("button", { name: /^create plan$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/membership/admin/plans",
        expect.objectContaining({
          name: "Quarterly",
          slug: "quarterly",
          durationDays: 90,
          price: 499,
          features: ["Priority support"],
        })
      );
    });
    expect(await screen.findByText(/plan created/i)).toBeInTheDocument();
  });

  test("edits an existing plan and calls PUT", async () => {
    axios.get.mockResolvedValue({ data: PLANS });
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    renderMembership();
    await screen.findByText("Monthly");

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.getByText("Edit Plan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Monthly")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^update plan$/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/membership/admin/plans/plan1",
        expect.objectContaining({ name: "Monthly" })
      );
    });
    expect(await screen.findByText(/plan updated/i)).toBeInTheDocument();
  });

  test("deletes a plan after confirmation", async () => {
    axios.get.mockResolvedValue({ data: PLANS });
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderMembership();
    await screen.findByText("Monthly");

    const buttons = screen.getAllByRole("button");
    const deleteBtn = buttons[buttons.length - 1]; // trash icon is the last action button
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/membership/admin/plans/plan1");
    });
    expect(await screen.findByText(/plan deleted/i)).toBeInTheDocument();
  });

  test("hides create/edit/delete controls for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: PLANS });
    renderMembership({ adminRole: "customer_service", permissions: { membership: "read" } });
    await screen.findByText("Monthly");

    expect(screen.queryByRole("button", { name: /new plan/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
  });
});
