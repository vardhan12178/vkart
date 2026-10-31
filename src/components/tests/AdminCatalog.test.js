import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminCatalog from "../admin/AdminCatalog";
import axios from "../axiosInstance";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const variant = (sku, label, price, mrp, stock, isDefault = false) => ({ sku, label, price, mrp, stock, isDefault, discountPercent: 0 });
const row = (over = {}) => ({
  id: "p1", slug: "phone-a", title: "Phone A", brand: "Brand", category: "mobiles", status: "draft", isFeatured: false,
  image: null, priceRange: { min: 20000, max: 24000 }, stock: 13, lowStock: true, outOfStock: 0, rating: null,
  variants: [variant("A-128", "128GB", 20000, 25000, 10, true), variant("A-256", "256GB", 24000, 29000, 3)],
  ...over,
});
const page = (products, counts = { all: 1, active: 0, draft: 1, archived: 0, low: 1, out: 0 }) =>
  ({ data: { products, total: products.length, page: 1, pages: 1, counts } });

describe("AdminCatalog", () => {
  let queryClient;
  beforeEach(() => {
    axios.get.mockReset();
    axios.patch.mockReset();
    axios.post.mockReset();
    showToast.mockClear();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  });

  const renderPage = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/catalog"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/catalog" element={<AdminCatalog />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("lists products with counts and edits a variant's price and stock", async () => {
    axios.get.mockResolvedValue(page([row()]));
    axios.patch.mockResolvedValueOnce({ data: row({ priceRange: { min: 19000, max: 24000 }, variants: [variant("A-128", "128GB", 19000, 25000, 0, true), variant("A-256", "256GB", 24000, 29000, 3)] }) });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /^Phone A Brand/ }));
    expect(screen.getByRole("tab", { name: /Draft\s*1/ })).toBeInTheDocument();

    const price = screen.getByLabelText("Price for 128GB");
    fireEvent.change(price, { target: { value: "30000" } });
    expect(screen.getByText("MRP can't be lower than price")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Save" })[0]).toBeDisabled();

    fireEvent.change(price, { target: { value: "19000" } });
    fireEvent.change(screen.getByLabelText("Stock for 128GB"), { target: { value: "0" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledWith("/api/admin/v2/products/p1/variants/A-128", { price: 19000, stock: 0 }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith("Saved 128GB", "success"));
  });

  test("publishes all drafts and changes status in bulk", async () => {
    axios.get.mockResolvedValue(page([row(), row({ id: "p2", title: "Phone B", slug: "phone-b" })], { all: 2, active: 0, draft: 2, archived: 0, low: 0, out: 0 }));
    axios.post.mockResolvedValue({ data: { matched: 2, updated: 2, status: "active" } });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Publish all drafts" }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/admin/v2/products/bulk-status", { ids: "all", filter: { status: "draft" }, status: "active" }));

    fireEvent.click(screen.getByLabelText("Select Phone B"));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    await waitFor(() => expect(axios.post).toHaveBeenLastCalledWith("/api/admin/v2/products/bulk-status", { ids: ["p2"], status: "archived" }));
  });

  test("filters by tab and search", async () => {
    axios.get.mockResolvedValue(page([row()]));
    renderPage();
    await screen.findByRole("button", { name: /^Phone A Brand/ });
    fireEvent.click(screen.getByRole("tab", { name: /Low stock/ }));
    await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith("/api/admin/v2/products", { params: expect.objectContaining({ stock: "low", page: 1 }) }));
    fireEvent.change(screen.getByLabelText("Search products"), { target: { value: "A-128" } });
    await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith("/api/admin/v2/products", { params: expect.objectContaining({ q: "A-128" }) }));
  });

  test("read-only staff can browse but not edit", async () => {
    axios.get.mockResolvedValue(page([row()]));
    renderPage({ adminRole: "support", permissions: { products: "read" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Phone A Brand/ }));
    expect(screen.getByLabelText("Price for 128GB")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publish all drafts" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Status of Phone A")).toBeDisabled();
  });
});
