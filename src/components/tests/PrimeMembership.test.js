import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import PrimeMembership from "../PrimeMembership";
import axios from "../axiosInstance";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

const PLAN = {
  _id: "plan1",
  name: "Prime Monthly",
  durationDays: 30,
  price: 199,
  originalPrice: 299,
  features: ["Free shipping", "Early access"],
  isPopular: true,
};

describe("PrimeMembership Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    showToast.mockClear();
    window.Razorpay = jest.fn(function () {
      this.on = jest.fn();
      this.open = jest.fn();
    });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderPrime = ({ isAuthenticated = true, statusData = null } = {}) => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/membership/plans") return Promise.resolve({ data: [PLAN] });
      if (url === "/api/membership/status") return Promise.resolve({ data: statusData });
      return Promise.resolve({ data: {} });
    });

    const store = configureStore({
      reducer: { auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PrimeMembership />
        </Provider>
      </QueryClientProvider>
    );
  };

  test("shows a loading spinner before plans resolve", () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    const store = configureStore({
      reducer: { auth: (state = { isAuthenticated: true, isAdmin: false, user: null }) => state },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PrimeMembership />
        </Provider>
      </QueryClientProvider>
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("renders plan pricing and features", async () => {
    renderPrime();
    expect(await screen.findByText("Prime Monthly")).toBeInTheDocument();
    expect(screen.getByText("₹199")).toBeInTheDocument();
    expect(screen.getByText("₹299")).toBeInTheDocument();
    expect(screen.getByText("Free shipping")).toBeInTheDocument();
  });

  test("shows the active membership banner for a current Prime member", async () => {
    renderPrime({
      statusData: {
        isPrime: true,
        membership: { endDate: "2026-12-31T00:00:00.000Z", history: [] },
      },
    });
    expect(await screen.findByText(/you're a prime member/i)).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  test("blocks purchase and shows a toast when the user is not authenticated", async () => {
    renderPrime({ isAuthenticated: false });
    fireEvent.click(await screen.findByRole("button", { name: /get prime/i }));

    expect(showToast).toHaveBeenCalledWith("Please login first", "error");
    expect(screen.queryByText(/pay with/i)).not.toBeInTheDocument();
  });

  test("opens the payment method picker when an authenticated user selects a plan", async () => {
    renderPrime();
    fireEvent.click(await screen.findByRole("button", { name: /get prime/i }));

    expect(screen.getByText(/pay with/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm & pay ₹199/i })).toBeInTheDocument();
  });

  test("purchases a plan, opens Razorpay with the selected method, and verifies on success", async () => {
    let capturedOptions = null;
    window.Razorpay = jest.fn(function (options) {
      capturedOptions = options;
      this.on = jest.fn();
      this.open = jest.fn();
    });
    axios.post.mockImplementation((url) => {
      if (url === "/api/membership/purchase") {
        return Promise.resolve({
          data: { orderId: "order-1", amount: 19900, currency: "INR", plan: PLAN },
        });
      }
      if (url === "/api/membership/verify") {
        return Promise.resolve({ data: { success: true, membership: {}, isPrime: true } });
      }
      return Promise.resolve({ data: {} });
    });

    renderPrime();
    fireEvent.click(await screen.findByRole("button", { name: /get prime/i }));
    fireEvent.click(screen.getByRole("button", { name: /netbanking/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/membership/purchase", { planId: "plan1" });
    });
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());
    expect(capturedOptions.method).toEqual(
      expect.objectContaining({ card: false, netbanking: true, paylater: false })
    );

    await act(async () => {
      await capturedOptions.handler({
        razorpay_order_id: "order-1",
        razorpay_payment_id: "pay-1",
        razorpay_signature: "sig-1",
      });
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/membership/verify", {
        razorpay_order_id: "order-1",
        razorpay_payment_id: "pay-1",
        razorpay_signature: "sig-1",
        planId: "plan1",
      });
    });
    expect(showToast).toHaveBeenCalledWith("Welcome to VKart Prime!", "success");
  });

  test("shows a toast when verification fails after payment", async () => {
    let capturedOptions = null;
    window.Razorpay = jest.fn(function (options) {
      capturedOptions = options;
      this.on = jest.fn();
      this.open = jest.fn();
    });
    axios.post.mockImplementation((url) => {
      if (url === "/api/membership/purchase") {
        return Promise.resolve({
          data: { orderId: "order-1", amount: 19900, currency: "INR", plan: PLAN },
        });
      }
      if (url === "/api/membership/verify") {
        return Promise.reject(new Error("verification failed"));
      }
      return Promise.resolve({ data: {} });
    });

    renderPrime();
    fireEvent.click(await screen.findByRole("button", { name: /get prime/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());

    await act(async () => {
      await capturedOptions.handler({
        razorpay_order_id: "order-1",
        razorpay_payment_id: "pay-1",
        razorpay_signature: "sig-1",
      });
    });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Verification failed", "error");
    });
  });

  test("shows a toast when the purchase order cannot be created", async () => {
    axios.post.mockResolvedValueOnce({ data: {} }); // no orderId
    renderPrime();
    fireEvent.click(await screen.findByRole("button", { name: /get prime/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Failed to initiate payment", "error");
    });
    expect(window.Razorpay).not.toHaveBeenCalled();
  });
});
