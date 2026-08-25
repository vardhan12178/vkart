import React from "react";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import CheckoutForm from "../CheckoutForm";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const VALID_CART = [
  { productId: "p1", title: "Widget", quantity: 2, price: 100, thumbnail: "" },
];

describe("CheckoutForm Component", () => {
  let queryClient;
  let originalRazorpay;
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env.REACT_APP_RAZORPAY_KEY_ID;
    process.env.REACT_APP_RAZORPAY_KEY_ID = "rzp_test_key";
  });

  afterAll(() => {
    process.env.REACT_APP_RAZORPAY_KEY_ID = originalEnv;
  });

  beforeEach(() => {
    mockNavigate.mockClear();
    axios.get.mockReset();
    axios.post.mockReset();
    originalRazorpay = window.Razorpay;

    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/addresses") return Promise.resolve({ data: { addresses: [] } });
      if (url === "/api/wallet") return Promise.resolve({ data: { balance: 0 } });
      return Promise.resolve({ data: {} });
    });

    // Present by default so the Pay Now buttons (disabled while !rzpReady)
    // are interactive; individual tests override this when they need to
    // capture the options passed to `new Razorpay(...)`.
    window.Razorpay = jest.fn(function () {
      this.on = jest.fn();
      this.open = jest.fn();
    });

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => {
    window.Razorpay = originalRazorpay;
  });

  const renderCheckout = ({
    isAuthenticated = true,
    cart = VALID_CART,
    onOrderPlaced = jest.fn(),
    totalAmount = 200,
  } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state,
        cart: (state = cart) => state,
      },
    });
    const utils = render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <CheckoutForm onOrderPlaced={onOrderPlaced} totalAmount={totalAmount} />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );
    return { ...utils, onOrderPlaced };
  };

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/^email address/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/address line 1/i), { target: { value: "123 Main St" } });
    fireEvent.change(screen.getByLabelText(/^city/i), { target: { value: "Pune" } });
    fireEvent.change(screen.getByLabelText(/^state/i), { target: { value: "MH" } });
    fireEvent.change(screen.getByLabelText(/pincode/i), { target: { value: "411001" } });
  };

  test("shows the sign-in gate instead of the form when the user is not authenticated", async () => {
    renderCheckout({ isAuthenticated: false });
    expect(await screen.findByText(/sign in to continue/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  test("blocks the review overlay and shows validation errors when required fields are empty", async () => {
    renderCheckout();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/profile/addresses"));

    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/review your order/i)).not.toBeInTheDocument();
  });

  test("rejects an invalid phone number and pincode", async () => {
    renderCheckout();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "12345" } });
    fireEvent.change(screen.getByLabelText(/pincode/i), { target: { value: "12" } });

    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/valid 10-digit mobile/i)).toBeInTheDocument();
      expect(screen.getByText(/valid 6-digit pincode/i)).toBeInTheDocument();
    });
  });

  test("prefills the form from the default saved address", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/addresses") {
        return Promise.resolve({
          data: {
            addresses: [
              {
                _id: "addr1",
                fullName: "Saved Person",
                phone: "9876500000",
                email: "saved@example.com",
                address1: "Saved Street",
                city: "Mumbai",
                state: "MH",
                pincode: "400001",
                isDefault: true,
              },
            ],
          },
        });
      }
      if (url === "/api/wallet") return Promise.resolve({ data: { balance: 0 } });
      return Promise.resolve({ data: {} });
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue("Saved Person");
    });
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue("9876500000");
  });

  test("selecting a different saved address fills the form with its details", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/addresses") {
        return Promise.resolve({
          data: {
            addresses: [
              { _id: "a1", fullName: "Person One", phone: "9111111111", city: "Pune", state: "MH", pincode: "411001", address1: "St 1", isDefault: true },
              { _id: "a2", fullName: "Person Two", phone: "9222222222", city: "Delhi", state: "DL", pincode: "110001", address1: "St 2" },
            ],
          },
        });
      }
      if (url === "/api/wallet") return Promise.resolve({ data: { balance: 0 } });
      return Promise.resolve({ data: {} });
    });

    renderCheckout();
    await waitFor(() => expect(screen.getByLabelText(/full name/i)).toHaveValue("Person One"));

    fireEvent.click(screen.getByText("Person Two"));

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue("Person Two");
    });
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue("9222222222");
  });

  test("shows the wallet top-up control only once the wallet checkbox is checked and balance is insufficient", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/addresses") return Promise.resolve({ data: { addresses: [] } });
      if (url === "/api/wallet") return Promise.resolve({ data: { balance: 50 } });
      return Promise.resolve({ data: {} });
    });

    renderCheckout({ totalAmount: 200 });
    await waitFor(() => expect(screen.getByText(/balance: ₹50/i)).toBeInTheDocument());

    expect(screen.queryByPlaceholderText(/add money/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/use wallet balance/i));
    expect(await screen.findByPlaceholderText(/add money/i)).toBeInTheDocument();
  });

  test("does not show the top-up control when the wallet balance already covers the total", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/addresses") return Promise.resolve({ data: { addresses: [] } });
      if (url === "/api/wallet") return Promise.resolve({ data: { balance: 500 } });
      return Promise.resolve({ data: {} });
    });

    renderCheckout({ totalAmount: 200 });
    await waitFor(() => expect(screen.getByText(/balance: ₹500/i)).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText(/use wallet balance/i));
    expect(screen.queryByPlaceholderText(/add money/i)).not.toBeInTheDocument();
  });

  test("places a wallet-only order and skips Razorpay entirely when wallet fully covers the total", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/addresses") return Promise.resolve({ data: { addresses: [] } });
      if (url === "/api/wallet") return Promise.resolve({ data: { balance: 500 } });
      return Promise.resolve({ data: {} });
    });
    window.Razorpay = jest.fn();
    const onOrderPlaced = jest.fn().mockResolvedValue("order-123");

    renderCheckout({ totalAmount: 200, onOrderPlaced });
    await waitFor(() => expect(screen.getByText(/balance: ₹500/i)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/use wallet balance/i));
    fillValidForm();

    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    expect(await screen.findByText(/review your order/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

    await waitFor(() => {
      expect(onOrderPlaced).toHaveBeenCalledWith(
        expect.objectContaining({ method: "WALLET", walletUsed: 200 })
      );
    });
    expect(window.Razorpay).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/order-success/order-123", { replace: true });
    });
  });

  test("creates a Razorpay order for the payable balance when wallet is unused", async () => {
    let capturedOptions = null;
    window.Razorpay = jest.fn(function (options) {
      capturedOptions = options;
      this.on = jest.fn();
      this.open = jest.fn();
    });
    axios.post.mockImplementation((url) => {
      if (url === "/api/razorpay/create-order") {
        return Promise.resolve({
          data: { success: true, orderId: "rzp_order_1", amount: 20000, currency: "INR" },
        });
      }
      return Promise.resolve({ data: {} });
    });

    renderCheckout({ totalAmount: 200 });
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/wallet"));
    fillValidForm();

    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);
    expect(await screen.findByText(/review your order/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/razorpay/create-order", {
        amount: 200,
        currency: "INR",
      });
    });
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());
    expect(capturedOptions.order_id).toBe("rzp_order_1");
    expect(capturedOptions.amount).toBe(20000);
  });

  test("completes the order after the Razorpay handler verifies payment", async () => {
    let capturedOptions = null;
    window.Razorpay = jest.fn(function (options) {
      capturedOptions = options;
      this.on = jest.fn();
      this.open = jest.fn();
    });
    axios.post.mockImplementation((url) => {
      if (url === "/api/razorpay/create-order") {
        return Promise.resolve({
          data: { success: true, orderId: "rzp_order_1", amount: 20000, currency: "INR" },
        });
      }
      if (url === "/api/razorpay/verify") {
        return Promise.resolve({ data: { success: true, verificationToken: "verify-tok" } });
      }
      return Promise.resolve({ data: {} });
    });
    const onOrderPlaced = jest.fn().mockResolvedValue("order-456");

    renderCheckout({ totalAmount: 200, onOrderPlaced });
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/wallet"));
    fillValidForm();
    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);
    expect(await screen.findByText(/review your order/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());

    await act(async () => {
      await capturedOptions.handler({
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "rzp_order_1",
        razorpay_signature: "sig_1",
      });
    });

    await waitFor(() => {
      expect(onOrderPlaced).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "CARD",
          payment: {
            paymentId: "pay_1",
            paymentOrderId: "rzp_order_1",
            signature: "sig_1",
            verificationToken: "verify-tok",
          },
        })
      );
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/order-success/order-456", { replace: true });
    });
  });

  test("shows a verification error and does not navigate when payment verification fails", async () => {
    let capturedOptions = null;
    window.Razorpay = jest.fn(function (options) {
      capturedOptions = options;
      this.on = jest.fn();
      this.open = jest.fn();
    });
    axios.post.mockImplementation((url) => {
      if (url === "/api/razorpay/create-order") {
        return Promise.resolve({
          data: { success: true, orderId: "rzp_order_1", amount: 20000, currency: "INR" },
        });
      }
      if (url === "/api/razorpay/verify") {
        return Promise.resolve({ data: { success: false } });
      }
      return Promise.resolve({ data: {} });
    });
    const onOrderPlaced = jest.fn();

    renderCheckout({ totalAmount: 200, onOrderPlaced });
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/wallet"));
    fillValidForm();
    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);
    expect(await screen.findByText(/review your order/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());

    await act(async () => {
      await capturedOptions.handler({
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "rzp_order_1",
        razorpay_signature: "sig_1",
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/payment verification failed/i)).toBeInTheDocument();
    });
    expect(onOrderPlaced).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows an error when Razorpay order creation fails server-side", async () => {
    window.Razorpay = jest.fn();
    axios.post.mockImplementation((url) => {
      if (url === "/api/razorpay/create-order") {
        return Promise.resolve({ data: { success: false } });
      }
      return Promise.resolve({ data: {} });
    });

    renderCheckout({ totalAmount: 200 });
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/wallet"));
    fillValidForm();
    const submitButtons = screen.getAllByRole("button", { name: /pay now/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);
    expect(await screen.findByText(/review your order/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to initialize payment/i)).toBeInTheDocument();
    });
  });
});
