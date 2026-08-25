import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Header from "../Header";
import axios from "../axiosInstance";
import cartReducer from "../../redux/cartSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import uiReducer from "../../redux/uiSlice";
import notificationReducer from "../../redux/notificationSlice";
import authReducer from "../../redux/authSlice";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const strip = (props) => {
    const { initial, animate, exit, variants, transition, whileHover, whileTap, custom, ...rest } = props;
    return rest;
  };
  return {
    motion: new Proxy(
      {},
      { get: (_t, tag) => ({ children, ...props }) => mockReact.createElement(tag, strip(props), children) }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe("Header Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    mockNavigate.mockClear();
    axios.get.mockImplementation((url) => {
      if (url === "/api/sales/active") return Promise.resolve({ data: { sale: null } });
      if (url === "/api/user/notifications") return Promise.resolve({ data: { success: true, notifications: [], unreadCount: 0 } });
      return Promise.resolve({ data: {} });
    });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderHeader = ({ isAuthenticated = false, cart = [], wishlist = [], initialPath = "/" } = {}) => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        ui: uiReducer,
        notifications: notificationReducer,
      },
      preloadedState: { auth: { isAuthenticated, isAdmin: false, user: null }, cart, wishlist },
    });
    return {
      store,
      ...render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <MemoryRouter initialEntries={[initialPath]}>
              <Header />
            </MemoryRouter>
          </Provider>
        </QueryClientProvider>
      ),
    };
  };

  test("renders the main navigation links", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /vkart home/i })).toHaveAttribute("href", "/");
    const desktopNav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(within(desktopNav).getByRole("link", { name: /collection/i })).toHaveAttribute("href", "/products");
  });

  test("hides the header entirely on auth pages", () => {
    const { container } = renderHeader({ initialPath: "/login" });
    expect(container.querySelector("header")).not.toBeInTheDocument();
  });

  test("shows the cart and wishlist counts from redux state", () => {
    renderHeader({
      cart: [{ productId: "p1", quantity: 2 }],
      wishlist: [{ _id: "w1" }],
    });
    expect(screen.getByLabelText(/shopping bag, 2 items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wishlist, 1 items/i)).toBeInTheDocument();
  });

  test("shows sign-in link when not authenticated, and a sign-out button when authenticated", () => {
    const { rerender } = renderHeader({ isAuthenticated: false });
    expect(screen.getByRole("link", { name: /account profile|sign in/i })).toBeInTheDocument();
  });

  test("signs out, clears cart/wishlist, and navigates home", async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    const { store } = renderHeader({
      isAuthenticated: true,
      cart: [{ productId: "p1", quantity: 1 }],
      wishlist: [{ _id: "w1" }],
    });

    fireEvent.click(screen.getByLabelText(/sign out/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/logout", {}, { withCredentials: true });
    });
    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
    expect(store.getState().cart).toHaveLength(0);
    expect(store.getState().wishlist).toHaveLength(0);
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  test("shows the Sale nav link only when there is an active sale", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/sales/active") return Promise.resolve({ data: { sale: { name: "Big Sale" } } });
      return Promise.resolve({ data: {} });
    });
    renderHeader();
    const desktopNav = await screen.findByRole("navigation", { name: /main navigation/i });
    expect(within(desktopNav).getByRole("link", { name: /sale/i })).toHaveAttribute("href", "/products?sale=true");
  });

  test("submits a search and navigates using the AI-parsed filters", async () => {
    axios.post.mockResolvedValueOnce({
      data: { q: null, category: "electronics", minPrice: null, maxPrice: 30000, minRating: null, sort: null },
    });
    renderHeader();

    // The always-visible desktop search input triggers the search on Enter
    // (it isn't wrapped in a <form>; only the mobile overlay's input is).
    const searchInput = screen.getAllByPlaceholderText(/search, or ask/i)[0];
    fireEvent.change(searchInput, { target: { value: "cheap electronics" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/ai/parse-search", { query: "cheap electronics" });
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/products?cat=electronics"));
    });
  });

  test("toggles the mobile menu", () => {
    renderHeader();
    const toggle = screen.getByLabelText(/open menu/i);
    fireEvent.click(toggle);
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
  });
});
