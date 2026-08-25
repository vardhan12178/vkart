import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminDashboard from "../admin/AdminDashboard";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const now = new Date();
const ORDERS = [
  {
    _id: "order1",
    orderId: "VK-1",
    totalPrice: 1000,
    stage: "DELIVERED",
    createdAt: now.toISOString(),
    customer: { name: "Alice" },
    userId: "u1",
    products: [{ name: "Widget", quantity: 2, price: 500, lineTotal: 1000, image: "" }],
  },
  {
    _id: "order2",
    orderId: "VK-2",
    totalPrice: 500,
    stage: "PLACED",
    createdAt: now.toISOString(),
    customer: { name: "Bob" },
    userId: "u2",
    products: [{ name: "Gadget", quantity: 1, price: 500, lineTotal: 500, image: "" }],
  },
];
const USERS = [{ _id: "u1" }, { _id: "u2" }, { _id: "u3" }];

describe("AdminDashboard Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    mockNavigate.mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const mockData = (orders, users) => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/orders") return Promise.resolve({ data: orders });
      if (url === "/api/admin/users") return Promise.resolve({ data: users });
      return Promise.resolve({ data: {} });
    });
  };

  const renderDashboard = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders computed stats from orders and users", async () => {
    mockData(ORDERS, USERS);
    renderDashboard();

    expect(await screen.findByText("₹1,500")).toBeInTheDocument(); // total revenue
    const totalOrdersCard = screen.getByText("Total Orders").closest("div").parentElement;
    expect(totalOrdersCard).toHaveTextContent("2");
  });

  test("shows an error banner when the dashboard fails to load", async () => {
    axios.get.mockRejectedValue(new Error("network down"));
    renderDashboard();
    expect(await screen.findByText(/could not sync dashboard data/i)).toBeInTheDocument();
  });

  test("lists recent orders and navigates to the order detail page on click", async () => {
    mockData(ORDERS, USERS);
    renderDashboard();

    const orderEntry = await screen.findByText("VK-1", { exact: false });
    fireEvent.click(orderEntry);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/orders/order1");
  });

  test("lists top products by revenue", async () => {
    mockData(ORDERS, USERS);
    renderDashboard();
    expect(await screen.findByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("Gadget")).toBeInTheDocument();
  });

  test("shows empty states when there are no orders at all", async () => {
    mockData([], []);
    renderDashboard();
    expect(await screen.findByText(/no recent orders found/i)).toBeInTheDocument();
    expect(screen.getByText(/no sales in this period/i)).toBeInTheDocument();
    expect(screen.getByText(/no active orders/i)).toBeInTheDocument();
  });

  test("navigates to the orders and products pages from the quick links", async () => {
    mockData(ORDERS, USERS);
    renderDashboard();
    await screen.findByText("Widget");

    fireEvent.click(screen.getByRole("button", { name: /view all orders/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/orders");

    fireEvent.click(screen.getByRole("button", { name: /view all products/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/products");
  });

  test("switches the analytics time range", async () => {
    mockData(ORDERS, USERS);
    renderDashboard();
    await screen.findByText("Widget");

    const sevenDayBtn = screen.getByRole("button", { name: "7 Days" });
    fireEvent.click(sevenDayBtn);
    expect(sevenDayBtn.className).toEqual(expect.stringContaining("bg-white"));
  });
});
