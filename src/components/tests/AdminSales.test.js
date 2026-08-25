import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminSales from "../admin/AdminSales";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const SALES = [
  {
    _id: "sale1",
    name: "Summer Sale",
    slug: "summer-sale",
    startDate: "2020-01-01T00:00:00.000Z",
    endDate: "2099-01-01T00:00:00.000Z", // always "live" for the test
    isActive: true,
    categories: [{ category: "electronics", discountPercent: 20, primeDiscountPercent: 5 }],
  },
];

describe("AdminSales Component", () => {
  let queryClient;
  let confirmSpy;

  const mockGet = (sales) => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/sales") return Promise.resolve({ data: sales });
      if (url === "/api/products/filters") {
        return Promise.resolve({ data: { categories: [{ slug: "electronics" }, { slug: "fashion" }] } });
      }
      return Promise.resolve({ data: {} });
    });
  };

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

  const renderSales = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/sales"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/sales" element={<AdminSales />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the sales list with a live status badge", async () => {
    mockGet(SALES);
    renderSales();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Summer Sale")).toBeInTheDocument();
    expect(within(table).getByText(/live/i)).toBeInTheDocument();
  });

  test("shows the empty state when there are no sales", async () => {
    mockGet([]);
    renderSales();
    expect(await screen.findByText(/no sales created yet/i)).toBeInTheDocument();
  });

  test("shows an error banner when sales fail to load", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/sales") return Promise.reject(new Error("network down"));
      return Promise.resolve({ data: {} });
    });
    renderSales();
    expect(await screen.findAllByText(/failed to load sales/i)).not.toHaveLength(0);
  });

  test("creates a sale with a category discount", async () => {
    mockGet([]);
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderSales();
    await screen.findByText(/no sales created yet/i);

    fireEvent.click(screen.getByRole("button", { name: /new sale/i }));
    fireEvent.change(screen.getByText("Name *").nextElementSibling, { target: { value: "Diwali Sale" } });
    fireEvent.change(screen.getByPlaceholderText("republic-day-sale"), { target: { value: "diwali-sale" } });
    fireEvent.change(screen.getByText("Start Date *").nextElementSibling, { target: { value: "2025-01-01T00:00" } });
    fireEvent.change(screen.getByText("End Date *").nextElementSibling, { target: { value: "2025-01-15T00:00" } });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "electronics" } });
    fireEvent.change(screen.getByPlaceholderText("Disc %"), { target: { value: "25" } });

    fireEvent.click(screen.getByRole("button", { name: /^create sale$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/sales",
        expect.objectContaining({
          name: "Diwali Sale",
          slug: "diwali-sale",
          categories: [{ category: "electronics", discountPercent: 25, primeDiscountPercent: 0 }],
        })
      );
    });
    expect(await screen.findByText(/sale created/i)).toBeInTheDocument();
  });

  test("edits an existing sale and calls PUT", async () => {
    mockGet(SALES);
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    renderSales();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("Summer Sale").closest("tr");
    fireEvent.click(within(row).getAllByRole("button")[0]); // edit (pencil)

    expect(screen.getByText("Edit Sale")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^update sale$/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/sales/sale1",
        expect.objectContaining({ name: "Summer Sale" })
      );
    });
    expect(await screen.findByText(/sale updated/i)).toBeInTheDocument();
  });

  test("deletes a sale after confirmation", async () => {
    mockGet(SALES);
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderSales();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("Summer Sale").closest("tr");
    fireEvent.click(within(row).getAllByRole("button")[1]); // delete (trash)

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/sales/sale1");
    });
    expect(await screen.findByText(/sale deleted/i)).toBeInTheDocument();
  });

  test("hides create/edit/delete controls for a viewer without write access", async () => {
    mockGet(SALES);
    renderSales({ adminRole: "customer_service", permissions: { sales: "read" } });
    const table = await screen.findByRole("table");

    expect(screen.queryByRole("button", { name: /new sale/i })).not.toBeInTheDocument();
    expect(within(table).queryByText("Actions")).not.toBeInTheDocument();
  });
});
