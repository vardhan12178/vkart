import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Orders from "../Orders";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
let mockRouteParams = {};
let mockSearchParams = new URLSearchParams();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockRouteParams,
  useSearchParams: () => [mockSearchParams],
}));

jest.mock("../OrderCard", () => (props) => (
  <div data-testid={`order-${props.order._id}`}>
    {props.order._id} - defaultOpen:{String(props.defaultOpen)}
  </div>
));

describe("Orders Component", () => {
  let queryClient;

  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    mockNavigate.mockClear();
    mockRouteParams = {};
    mockSearchParams = new URLSearchParams();
    axios.get.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderOrders = (isAuthenticated = true) => {
    const store = configureStore({
      reducer: { auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <Orders />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );
  };

  test("redirects to login and renders nothing when the user is not authenticated", () => {
    const { container } = renderOrders(false);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the empty state when there are no orders", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    renderOrders();
    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse products/i })).toBeInTheDocument();
  });

  test("shows an error state and allows retrying when the fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderOrders();
    expect(await screen.findByText(/unable to load orders/i)).toBeInTheDocument();

    axios.get.mockResolvedValueOnce({ data: [] });
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument();
  });

  test("redirects to login on a 401 response instead of showing the error state", async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });
    renderOrders();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
    expect(screen.queryByText(/unable to load orders/i)).not.toBeInTheDocument();
  });

  test("renders orders sorted most-recent-first and shows the order count", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: "old-order", createdAt: "2024-01-01T00:00:00.000Z" },
        { _id: "new-order", createdAt: "2024-06-01T00:00:00.000Z" },
      ],
    });
    renderOrders();

    expect(await screen.findByText(/2 orders/i)).toBeInTheDocument();
    const rendered = screen.getAllByTestId(/order-/);
    expect(rendered[0]).toHaveAttribute("data-testid", "order-new-order");
    expect(rendered[1]).toHaveAttribute("data-testid", "order-old-order");
  });

  test("marks the order referenced by the route param as defaultOpen", async () => {
    mockRouteParams = { orderId: "target-order" };
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: "target-order", createdAt: "2024-01-01T00:00:00.000Z" },
        { _id: "other-order", createdAt: "2024-02-01T00:00:00.000Z" },
      ],
    });
    renderOrders();

    expect(await screen.findByTestId("order-target-order")).toHaveTextContent("defaultOpen:true");
    expect(screen.getByTestId("order-other-order")).toHaveTextContent("defaultOpen:false");
  });
});
