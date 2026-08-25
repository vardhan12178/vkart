import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminOrderDetails from "../admin/AdminOrderDetails";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const ORDER = {
  _id: "order123456",
  orderId: "VK-2001",
  stage: "PLACED",
  totalPrice: 2000,
  createdAt: "2024-01-01T00:00:00.000Z",
  customer: { name: "Jane Buyer", email: "jane@example.com", phone: "9999999999" },
  products: [{ name: "Widget", quantity: 1, price: 2000, lineTotal: 2000 }],
  shippingAddress: "10 Test Street",
  returnStatus: "NONE",
  refundStatus: "NONE",
};

describe("AdminOrderDetails Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.patch.mockReset();
    axios.post.mockReset();
    mockNavigate.mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderDetails = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/orders/order123456"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders order details with customer and total", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDER });
    renderDetails();
    expect(await screen.findByText(/VK-2001/)).toBeInTheDocument();
    expect(screen.getByText("Jane Buyer")).toBeInTheDocument();
    expect(screen.getAllByText("₹2,000").length).toBeGreaterThan(0);
  });

  test("advances the order to the next stage", async () => {
    axios.get.mockResolvedValue({ data: ORDER });
    axios.patch.mockResolvedValueOnce({ data: { order: { ...ORDER, stage: "CONFIRMED" } } });
    renderDetails();
    await screen.findByText(/VK-2001/);

    fireEvent.click(screen.getByRole("button", { name: /mark as confirmed/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/orders/order123456/stage", { stage: "CONFIRMED" });
    });
    expect(await screen.findByText(/status updated to confirmed/i)).toBeInTheDocument();
  });

  test("cancels the order", async () => {
    axios.get.mockResolvedValue({ data: ORDER });
    axios.patch.mockResolvedValueOnce({ data: { order: { ...ORDER, stage: "CANCELLED" } } });
    renderDetails();
    await screen.findByText(/VK-2001/);

    fireEvent.click(screen.getByRole("button", { name: /cancel order/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/orders/order123456/stage", { stage: "CANCELLED" });
    });
  });

  test("hides all status-change controls and shows a read-only notice for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDER });
    renderDetails({ adminRole: "customer_service", permissions: { orders: "read" } });
    await screen.findByText(/VK-2001/);

    expect(screen.queryByRole("button", { name: /mark as confirmed/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel order/i })).not.toBeInTheDocument();
    expect(screen.getByText(/read-only access/i)).toBeInTheDocument();
  });

  test("hides status-change controls once the order reaches a terminal stage", async () => {
    axios.get.mockResolvedValueOnce({ data: { ...ORDER, stage: "DELIVERED" } });
    renderDetails();
    await screen.findByText(/VK-2001/);

    expect(screen.queryByRole("button", { name: /cancel order/i })).not.toBeInTheDocument();
  });

  test("updates the return status once a return has been requested", async () => {
    axios.get.mockResolvedValue({ data: { ...ORDER, returnStatus: "REQUESTED" } });
    axios.patch.mockResolvedValueOnce({ data: { order: { ...ORDER, returnStatus: "APPROVED" } } });
    renderDetails();
    await screen.findByText(/VK-2001/);

    fireEvent.click(screen.getByRole("button", { name: /set approved/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/orders/order123456/return", { status: "APPROVED" });
    });
    expect(await screen.findByText(/return status: approved/i)).toBeInTheDocument();
  });

  test("initiates a wallet refund once the order is cancelled and refund-eligible", async () => {
    axios.get.mockResolvedValue({ data: { ...ORDER, stage: "CANCELLED" } });
    axios.post.mockResolvedValueOnce({ data: { order: { ...ORDER, stage: "CANCELLED", refundStatus: "PROCESSED" } } });
    renderDetails();
    await screen.findByText(/VK-2001/);

    fireEvent.click(screen.getByRole("button", { name: /refund to wallet/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/admin/orders/order123456/refund", { method: "WALLET" });
    });
    expect(await screen.findByText(/refund wallet/i)).toBeInTheDocument();
  });

  test("shows a not-found state with an error toast instead of a blank page when the order fails to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderDetails();

    expect(await screen.findByText(/order not found/i)).toBeInTheDocument();
    expect(await screen.findByText(/failed to load order details/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to orders/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/orders");
  });
});
