import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Cart from "../Cart";
import axios from "../axiosInstance";
import cartReducer from "../../redux/cartSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

jest.mock("../CheckoutForm", () => (props) => (
  <div data-testid="checkout-form-mock">
    <div data-testid="checkout-total">{props.totalAmount}</div>
    <button onClick={() => props.onOrderPlaced({ address: "123 Test St", method: "CARD", walletUsed: 0 })}>
      Simulate Order Placed
    </button>
    <button
      onClick={() =>
        props.onOrderPlaced({ address: "123 Test St", method: "CARD", walletUsed: 0 }).catch(() => {})
      }
    >
      Simulate Order Placed (swallow error)
    </button>
  </div>
));

const PRODUCT = {
  productId: "p1",
  title: "Test Widget",
  price: 500,
  quantity: 1,
  thumbnail: "widget.png",
  category: "gadgets",
};

describe("Cart Component", () => {
  let queryClient;

  const renderCart = ({ isAuthenticated = true, cart = [], wishlist = [] } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state,
        cart: cartReducer,
        wishlist: wishlistReducer,
      },
      preloadedState: { auth: { isAuthenticated, isAdmin: false, user: null }, cart, wishlist },
    });
    return {
      store,
      ...render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <BrowserRouter>
              <Cart />
            </BrowserRouter>
          </Provider>
        </QueryClientProvider>
      ),
    };
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    axios.get.mockReset();
    axios.post.mockReset();
    showToast.mockClear();
  });

  test("shows the sign-in gate when the user is not authenticated", () => {
    renderCart({ isAuthenticated: false, cart: [PRODUCT] });
    expect(screen.getByRole("link", { name: /sign in to your bag/i })).toBeInTheDocument();
  });

  test("shows the fully-empty state when both cart and wishlist are empty", () => {
    renderCart({ cart: [], wishlist: [] });
    expect(screen.getByText(/your bag is waiting/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore the collection/i })).toBeInTheDocument();
  });

  test("renders cart items with computed pricing", () => {
    renderCart({ cart: [PRODUCT] });
    expect(screen.getByText("Test Widget")).toBeInTheDocument();
    // subtotal 500, shipping 50 (below 999 threshold), total 550
    expect(screen.getAllByText("₹550").length).toBeGreaterThan(0);
    expect(screen.getByText(/add .*for free shipping/i)).toBeInTheDocument();
  });

  test("shows free shipping once subtotal reaches 999", () => {
    renderCart({ cart: [{ ...PRODUCT, price: 1000 }] });
    expect(screen.getByText(/free shipping unlocked/i)).toBeInTheDocument();
  });

  test("increments and decrements item quantity", () => {
    const { store } = renderCart({ cart: [{ ...PRODUCT, quantity: 1 }] });

    // Increment/decrement buttons sit either side of the quantity span.
    const qtyButtons = screen.getByText("1").parentElement.querySelectorAll("button");
    fireEvent.click(qtyButtons[1]); // increment
    expect(store.getState().cart[0].quantity).toBe(2);

    fireEvent.click(qtyButtons[0]); // decrement
    expect(store.getState().cart[0].quantity).toBe(1);
  });

  test("removes an item after confirming", () => {
    const { store } = renderCart({ cart: [PRODUCT] });
    fireEvent.click(screen.getByLabelText(/remove item/i));
    expect(screen.getByText("Remove?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(store.getState().cart).toHaveLength(0);
  });

  test("moves an item to the wishlist", () => {
    const { store } = renderCart({ cart: [PRODUCT] });
    fireEvent.click(screen.getByRole("button", { name: /save for later/i }));
    expect(store.getState().cart).toHaveLength(0);
    expect(store.getState().wishlist).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("Moved to Wishlist", "success");
  });

  test("moves a wishlist item back to the cart", () => {
    const { store } = renderCart({ cart: [], wishlist: [PRODUCT] });
    fireEvent.click(screen.getByRole("button", { name: /move to cart/i }));
    expect(store.getState().cart).toHaveLength(1);
    expect(store.getState().wishlist).toHaveLength(0);
  });

  test("applies a valid promo code and reflects the discount in the total", async () => {
    axios.post.mockResolvedValueOnce({
      data: { valid: true, code: "SAVE50", discount: 50, description: "Flat 50 off" },
    });
    renderCart({ cart: [PRODUCT] });

    fireEvent.change(screen.getByPlaceholderText("Coupon Code"), { target: { value: "save50" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/coupons/validate", {
        code: "SAVE50",
        subtotal: 500,
      });
    });
    expect(await screen.findByText("SAVE50")).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining("SAVE50"), "success");
  });

  test("shows an error toast for an invalid promo code", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: "Coupon expired" } } });
    renderCart({ cart: [PRODUCT] });

    fireEvent.change(screen.getByPlaceholderText("Coupon Code"), { target: { value: "BAD" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Coupon expired", "error");
    });
    expect(screen.queryByText("BAD")).not.toBeInTheDocument();
  });

  test("fetches and displays available coupons on request", async () => {
    axios.get.mockResolvedValueOnce({
      data: { coupons: [{ code: "WELCOME10", type: "percent", value: 10 }] },
    });
    renderCart({ cart: [PRODUCT] });

    fireEvent.click(screen.getByRole("button", { name: /view available coupons/i }));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/coupons/public");
    });
    expect(await screen.findByText("WELCOME10")).toBeInTheDocument();
  });

  test("reveals the checkout form with the correct total when proceeding", () => {
    renderCart({ cart: [PRODUCT] });
    fireEvent.click(screen.getAllByRole("button", { name: /^checkout/i })[0]);
    expect(screen.getByTestId("checkout-form-mock")).toBeInTheDocument();
    expect(screen.getByTestId("checkout-total")).toHaveTextContent("550");
  });

  test("places an order, clears the cart, and shows a success toast", async () => {
    axios.post.mockResolvedValueOnce({ data: { _id: "order-1" } });
    const { store } = renderCart({ cart: [PRODUCT] });

    fireEvent.click(screen.getAllByRole("button", { name: /^checkout/i })[0]);
    fireEvent.click(screen.getByText("Simulate Order Placed"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/orders",
        expect.objectContaining({ shippingAddress: "123 Test St" })
      );
    });
    await waitFor(() => {
      expect(store.getState().cart).toHaveLength(0);
    });
    expect(showToast).toHaveBeenCalledWith("Order placed successfully", "success");
  });

  test("shows an inline error banner and does not clear the cart when order placement fails", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: "Payment declined" } } });
    const { store } = renderCart({ cart: [PRODUCT] });

    fireEvent.click(screen.getAllByRole("button", { name: /^checkout/i })[0]);
    fireEvent.click(screen.getByText("Simulate Order Placed (swallow error)"));

    await waitFor(() => {
      expect(screen.getByText("Payment declined")).toBeInTheDocument();
    });
    expect(store.getState().cart).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("Payment declined", "error");
  });

  test("recovers gracefully from a duplicate-order (409) response by clearing the cart anyway", async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 409, data: { orderId: "existing-order" } } });
    const { store } = renderCart({ cart: [PRODUCT] });

    fireEvent.click(screen.getAllByRole("button", { name: /^checkout/i })[0]);
    fireEvent.click(screen.getByText("Simulate Order Placed"));

    await waitFor(() => {
      expect(store.getState().cart).toHaveLength(0);
    });
  });
});
