import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import AdminReviews from "../admin/AdminReviews";

jest.mock("../axiosInstance", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() },
}));
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

const rows = [
  {
    id: "a",
    slug: "phone-a",
    product: "Phone A",
    name: "Asha R.",
    stars: 5,
    title: "Great",
    body: "Loved it so much.",
    status: "published",
    helpful: 2,
    date: "2026-10-30",
  },
  {
    id: "b",
    slug: "phone-b",
    product: "Phone B",
    name: "Ravi K.",
    stars: 1,
    title: "",
    body: "Rude text here, hide me.",
    status: "hidden",
    helpful: 0,
    date: "2026-10-29",
  },
];

const renderIt = (permissions) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={["/admin/reviews"]}>
        <Routes>
          <Route path="/admin" element={<OutletWith ctx={{ adminRole: null, permissions }} />}>
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
const { Outlet } = jest.requireActual("react-router-dom");
function OutletWith({ ctx }) {
  return <Outlet context={ctx} />;
}

describe("AdminReviews", () => {
  beforeEach(() => {
    axiosInstance.get.mockReset();
    axiosInstance.patch.mockReset();
  });

  test("lists reviews and lets a moderator hide or show them", async () => {
    axiosInstance.get.mockResolvedValue({ data: { reviews: rows, total: 2, page: 1, pages: 1 } });
    axiosInstance.patch.mockResolvedValue({ data: {} });
    window.history.pushState({}, "", "/admin/reviews");
    renderIt({ reviews: "write" });
    expect(await screen.findByText("Phone A")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /^hide$/i })[0]);
    await waitFor(() =>
      expect(axiosInstance.patch).toHaveBeenCalledWith("/api/admin/v2/reviews/a", {
        status: "hidden",
      })
    );
    fireEvent.click(screen.getByRole("button", { name: /^show$/i }));
    await waitFor(() =>
      expect(axiosInstance.patch).toHaveBeenCalledWith("/api/admin/v2/reviews/b", {
        status: "published",
      })
    );
  });

  test("read-only moderators see no hide buttons", async () => {
    axiosInstance.get.mockResolvedValue({ data: { reviews: rows, total: 2, page: 1, pages: 1 } });
    renderIt({ reviews: "read" });
    expect(await screen.findByText("Phone A")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^hide$/i })).not.toBeInTheDocument();
  });
});
