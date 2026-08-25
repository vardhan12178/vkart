import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminReviews from "../admin/AdminReviews";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const REVIEWS = [
  {
    productId: "p1",
    productTitle: "Wireless Mouse",
    review: { _id: "r1", comment: "Great product", reviewerName: "Alice", rating: 5, isHidden: false },
  },
  {
    productId: "p2",
    productTitle: "Keyboard",
    review: { _id: "r2", comment: "Not so good", reviewerName: "Bob", rating: 2, isHidden: true },
  },
];

describe("AdminReviews Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.patch.mockReset();
    axios.delete.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderReviews = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/reviews"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/reviews" element={<AdminReviews />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the review list", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: REVIEWS } });
    renderReviews();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Wireless Mouse")).toBeInTheDocument();
    expect(within(table).getByText("Keyboard")).toBeInTheDocument();
    expect(within(table).getByText("Hidden")).toBeInTheDocument();
  });

  test("shows the empty state when there are no reviews", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: [] } });
    renderReviews();
    expect(await screen.findByText(/no reviews found/i)).toBeInTheDocument();
  });

  test("shows an error state when reviews fail to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderReviews();
    expect(await screen.findByText(/failed to load reviews/i)).toBeInTheDocument();
  });

  test("filters reviews by search term", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: REVIEWS } });
    renderReviews();
    const table = await screen.findByRole("table");

    fireEvent.change(screen.getByPlaceholderText(/search by product/i), { target: { value: "keyboard" } });

    expect(within(table).queryByText("Wireless Mouse")).not.toBeInTheDocument();
    expect(within(table).getByText("Keyboard")).toBeInTheDocument();
  });

  test("hides a visible review", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: REVIEWS } });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderReviews();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("Wireless Mouse").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: /^hide$/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/reviews/p1/r1/toggle");
    });
  });

  test("shows a hidden review again", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: REVIEWS } });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderReviews();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("Keyboard").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: /^show$/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/reviews/p2/r2/toggle");
    });
  });

  test("deletes a review", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: REVIEWS } });
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderReviews();
    const table = await screen.findByRole("table");

    const row = within(table).getByText("Wireless Mouse").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/admin/reviews/p1/r1");
    });
  });

  test("hides moderation actions for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: { reviews: REVIEWS } });
    renderReviews({ adminRole: "customer_service", permissions: { reviews: "read" } });
    const table = await screen.findByRole("table");

    expect(within(table).queryByText("Actions")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^hide$/i })).not.toBeInTheDocument();
  });
});
