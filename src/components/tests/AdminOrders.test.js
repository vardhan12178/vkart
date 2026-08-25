import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminOrders from "../admin/AdminOrders";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const ORDERS = [
  {
    _id: "order1",
    orderId: "VK-1001",
    customer: { name: "John Doe", email: "john@example.com" },
    totalPrice: 1500,
    stage: "PLACED",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "order2",
    orderId: "VK-1002",
    customer: { name: "Sara Return", email: "sara@example.com" },
    totalPrice: 2500,
    stage: "DELIVERED",
    returnStatus: "REQUESTED",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
];

describe("AdminOrders Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    mockNavigate.mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderOrders = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminOrders />
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the orders table with revenue stats", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDERS });
    renderOrders();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("John Doe")).toBeInTheDocument();
    expect(within(table).getByText("Sara Return")).toBeInTheDocument();
    expect(screen.getByText("₹4,000")).toBeInTheDocument(); // total revenue stat
  });

  test("filters orders by search term", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDERS });
    renderOrders();
    const table = await screen.findByRole("table");

    fireEvent.change(screen.getByPlaceholderText(/search orders/i), { target: { value: "sara" } });

    expect(within(table).queryByText("John Doe")).not.toBeInTheDocument();
    expect(within(table).getByText("Sara Return")).toBeInTheDocument();
  });

  test("filters orders by stage from the dropdown", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDERS });
    renderOrders();
    const table = await screen.findByRole("table");

    fireEvent.click(screen.getByRole("button", { name: /filter status/i }));
    // "DELIVERED" also appears as a status badge on matching rows, so scope
    // the click to the filter dropdown panel itself.
    const filterPanel = screen.getByText("Select Status").parentElement;
    fireEvent.click(within(filterPanel).getByText("DELIVERED"));

    expect(within(table).queryByText("John Doe")).not.toBeInTheDocument();
    expect(within(table).getByText("Sara Return")).toBeInTheDocument();
  });

  test("filters to only orders with an active return", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDERS });
    renderOrders();
    const table = await screen.findByRole("table");

    fireEvent.click(screen.getByRole("button", { name: /^returns$/i }));

    expect(within(table).queryByText("John Doe")).not.toBeInTheDocument();
    expect(within(table).getByText("Sara Return")).toBeInTheDocument();
  });

  test("navigates to the order detail page when a row is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDERS });
    renderOrders();
    const table = await screen.findByRole("table");

    fireEvent.click(within(table).getByText("John Doe"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/orders/order1");
  });

  test("shows the empty state and clears filters", async () => {
    axios.get.mockResolvedValueOnce({ data: ORDERS });
    renderOrders();
    await screen.findByRole("table");

    fireEvent.change(screen.getByPlaceholderText(/search orders/i), { target: { value: "no-match-xyz" } });
    expect(await screen.findByText(/no orders found/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });
});
