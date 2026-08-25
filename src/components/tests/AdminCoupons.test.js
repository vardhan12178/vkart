import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminCoupons from "../admin/AdminCoupons";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const COUPONS = [
  {
    _id: "c1",
    code: "SAVE10",
    type: "percent",
    value: 10,
    minOrder: 500,
    usedCount: 2,
    usageLimit: 100,
    validTo: "2030-01-01T00:00:00.000Z",
    isActive: true,
    isPublic: true,
  },
];

describe("AdminCoupons Component", () => {
  let queryClient;
  let confirmSpy;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.patch.mockReset();
    axios.delete.mockReset();
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  const renderCoupons = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/coupons"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/coupons" element={<AdminCoupons />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the coupon list", async () => {
    axios.get.mockResolvedValueOnce({ data: { coupons: COUPONS } });
    renderCoupons();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("SAVE10")).toBeInTheDocument();
    expect(within(table).getByText("10%")).toBeInTheDocument();
  });

  test("shows the empty state when there are no coupons", async () => {
    axios.get.mockResolvedValueOnce({ data: { coupons: [] } });
    renderCoupons();
    expect(await screen.findByText(/no coupons yet/i)).toBeInTheDocument();
  });

  test("shows an error banner when the coupon list fails to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderCoupons();
    expect(await screen.findAllByText(/failed to load coupons/i)).not.toHaveLength(0);
  });

  test("blocks coupon creation when required fields are missing", async () => {
    axios.get.mockResolvedValueOnce({ data: { coupons: [] } });
    renderCoupons();
    await screen.findByText(/no coupons yet/i);

    fireEvent.click(screen.getByRole("button", { name: /new coupon/i }));
    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));

    expect(await screen.findByText(/code, type, value and expiry date are required/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("creates a coupon with the entered fields", async () => {
    axios.get.mockResolvedValue({ data: { coupons: [] } });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderCoupons();
    await screen.findByText(/no coupons yet/i);

    fireEvent.click(screen.getByRole("button", { name: /new coupon/i }));
    fireEvent.change(screen.getByPlaceholderText("e.g. SAVE10"), { target: { value: "welcome20" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "20" } });
    fireEvent.change(screen.getByText("Valid To *").nextElementSibling, {
      target: { value: "2030-06-01T00:00" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/coupons",
        expect.objectContaining({ code: "WELCOME20", value: 20 })
      );
    });
    expect(await screen.findByText(/coupon created/i)).toBeInTheDocument();
  });

  test("edits an existing coupon and calls PATCH", async () => {
    axios.get.mockResolvedValue({ data: { coupons: COUPONS } });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderCoupons();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("SAVE10").closest("tr");
    // Row buttons in DOM order: [0] status toggle, [1] edit (pencil), [2] delete (trash).
    fireEvent.click(within(row).getAllByRole("button")[1]);

    expect(screen.getByText("Edit Coupon")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^update$/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        "/api/coupons/c1",
        expect.objectContaining({ code: "SAVE10" })
      );
    });
    expect(await screen.findByText(/coupon updated/i)).toBeInTheDocument();
  });

  test("deletes a coupon after confirmation", async () => {
    axios.get.mockResolvedValue({ data: { coupons: COUPONS } });
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderCoupons();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("SAVE10").closest("tr");
    fireEvent.click(within(row).getAllByRole("button")[2]); // delete (trash) button

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/coupons/c1");
    });
    expect(await screen.findByText(/coupon deleted/i)).toBeInTheDocument();
  });

  test("does not delete when the confirmation dialog is dismissed", async () => {
    confirmSpy.mockReturnValue(false);
    axios.get.mockResolvedValue({ data: { coupons: COUPONS } });
    renderCoupons();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("SAVE10").closest("tr");
    fireEvent.click(within(row).getAllByRole("button")[1]);

    expect(axios.delete).not.toHaveBeenCalled();
  });

  test("toggles a coupon's active status", async () => {
    axios.get.mockResolvedValue({ data: { coupons: COUPONS } });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderCoupons();
    const table = await screen.findByRole("table");

    fireEvent.click(within(table).getByText("Active"));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/coupons/c1", { isActive: false });
    });
  });

  test("hides create/edit/delete controls for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: { coupons: COUPONS } });
    renderCoupons({ adminRole: "customer_service", permissions: { coupons: "read" } });
    const table = await screen.findByRole("table");

    expect(screen.queryByRole("button", { name: /new coupon/i })).not.toBeInTheDocument();
    expect(within(table).queryByText("Actions")).not.toBeInTheDocument();
  });
});
