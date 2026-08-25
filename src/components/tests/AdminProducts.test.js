import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminProducts from "../admin/AdminProducts";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");
jest.mock("../ProductImageUploader", () => () => <div data-testid="image-uploader-mock" />);

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const PRODUCTS = [
  { _id: "p1", title: "Wireless Mouse", category: "Electronics", brand: "Acme", price: 999, stock: 20, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { _id: "p2", title: "Draft Keyboard", category: "Electronics", brand: "Acme", price: 1999, stock: 0, isActive: false, createdAt: "2024-02-01T00:00:00.000Z" },
];

describe("AdminProducts Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderProducts = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/products"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/products" element={<AdminProducts />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the inventory table", async () => {
    axios.get.mockResolvedValueOnce({ data: PRODUCTS });
    renderProducts();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Wireless Mouse")).toBeInTheDocument();
    expect(within(table).getByText("Draft Keyboard")).toBeInTheDocument();
  });

  test("filters to only active products via the tab", async () => {
    axios.get.mockResolvedValueOnce({ data: PRODUCTS });
    renderProducts();
    const table = await screen.findByRole("table");

    fireEvent.click(screen.getByRole("button", { name: "Active" }));

    expect(within(table).getByText("Wireless Mouse")).toBeInTheDocument();
    expect(within(table).queryByText("Draft Keyboard")).not.toBeInTheDocument();
  });

  test("filters products by search term", async () => {
    axios.get.mockResolvedValueOnce({ data: PRODUCTS });
    renderProducts();
    const table = await screen.findByRole("table");

    fireEvent.change(screen.getByPlaceholderText(/search inventory/i), { target: { value: "keyboard" } });

    expect(within(table).queryByText("Wireless Mouse")).not.toBeInTheDocument();
    expect(within(table).getByText("Draft Keyboard")).toBeInTheDocument();
  });

  test("shows the empty state and clears filters", async () => {
    axios.get.mockResolvedValueOnce({ data: PRODUCTS });
    renderProducts();
    await screen.findByRole("table");

    fireEvent.change(screen.getByPlaceholderText(/search inventory/i), { target: { value: "no-such-product" } });
    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear all filters/i }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  test("hides the Add Product button for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: PRODUCTS });
    renderProducts({ adminRole: "customer_service", permissions: { products: "read" } });
    await screen.findByRole("table");
    expect(screen.queryByRole("button", { name: /add product/i })).not.toBeInTheDocument();
  });

  test("creates a new product with numeric fields coerced correctly", async () => {
    // mockResolvedValue (not Once): a successful save invalidates the
    // products query, which triggers a refetch beyond the initial load.
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderProducts();
    await screen.findByText(/no products found/i);

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(screen.getByText("New Product")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/wireless noise cancelling/i), {
      target: { value: "New Gadget" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "499" } });
    // "0" placeholder is shared by Discount (%) and Stock Qty; Stock Qty is the second.
    fireEvent.change(screen.getAllByPlaceholderText("0")[1], { target: { value: "10" } });

    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/admin/products",
        expect.objectContaining({ title: "New Gadget", price: 499 })
      );
    });
    expect(await screen.findByText(/product created successfully/i)).toBeInTheDocument();
  });

  test("edits an existing product, prefilling the form and calling PUT", async () => {
    // mockResolvedValue (not Once): a successful save invalidates the
    // products query, which triggers a refetch beyond the initial load.
    axios.get.mockResolvedValue({ data: PRODUCTS });
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    renderProducts();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("Wireless Mouse").closest("tr");
    fireEvent.click(within(row).getByRole("button"));

    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Wireless Mouse")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/admin/products/p1",
        expect.objectContaining({ title: "Wireless Mouse" })
      );
    });
    expect(await screen.findByText(/product updated successfully/i)).toBeInTheDocument();
  });

  test("shows an error toast when the product list fails to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderProducts();
    expect(await screen.findByText(/failed to load products/i)).toBeInTheDocument();
  });
});
