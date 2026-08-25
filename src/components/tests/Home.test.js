import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Home from "../Home";
import axios from "../axiosInstance";
import cartReducer from "../../redux/cartSlice";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
jest.mock("../product/ProductQuickView", () => (props) =>
  props.product ? <div data-testid="quick-view-mock">Quick view: {props.product.title}</div> : null
);

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const stripMotionProps = (props) => {
    const { initial, animate, exit, variants, transition, whileHover, whileTap, whileInView, viewport, custom, ...validProps } = props;
    return validProps;
  };
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tagName) => ({ children, ...props }) =>
          mockReact.createElement(tagName, stripMotionProps(props), children),
      }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const FEATURED_PRODUCT = { _id: "feat1", title: "Featured Widget", price: 1000, discountPercentage: 10, thumbnail: "f.png" };
const NEW_ARRIVAL_PRODUCT = { _id: "new1", title: "New Gadget", price: 800, thumbnail: "n.png" };

const HOME_DATA = {
  featured: [FEATURED_PRODUCT],
  newArrivals: [NEW_ARRIVAL_PRODUCT],
  activeSale: null,
  stats: { avgRating: 4.6, totalReviews: 1200, totalProducts: 350 },
};

describe("Home Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    showToast.mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderHome = ({ user = null } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated: !!user, isAdmin: false, user }) => state,
        cart: cartReducer,
      },
      preloadedState: { auth: { isAuthenticated: !!user, isAdmin: false, user }, cart: [] },
    });
    return {
      store,
      ...render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <BrowserRouter>
              <Home />
            </BrowserRouter>
          </Provider>
        </QueryClientProvider>
      ),
    };
  };

  test("renders featured products and new arrivals", async () => {
    axios.get.mockResolvedValueOnce({ data: HOME_DATA });
    renderHome();
    expect(await screen.findByText("Featured Widget")).toBeInTheDocument();
    expect(screen.getByText("New Gadget")).toBeInTheDocument();
  });

  test("shows the platform stats", async () => {
    axios.get.mockResolvedValueOnce({ data: HOME_DATA });
    renderHome();
    await screen.findByText("Featured Widget");
    expect(screen.getByText(/4\.6/)).toBeInTheDocument();
    expect(screen.getByText("1,200+")).toBeInTheDocument();
    expect(screen.getByText("350+")).toBeInTheDocument();
  });

  test("shows the active sale banner when present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        ...HOME_DATA,
        activeSale: {
          name: "Republic Day Sale",
          endDate: "2099-01-26T00:00:00.000Z",
          categories: [{ discountPercent: 30 }],
        },
      },
    });
    renderHome();
    expect(await screen.findByText("Republic Day Sale")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  test("adds a featured product to the cart", async () => {
    axios.get.mockResolvedValueOnce({ data: HOME_DATA });
    const { store } = renderHome();
    await screen.findByText("Featured Widget");

    fireEvent.click(screen.getByRole("button", { name: /add featured widget to cart/i }));

    expect(store.getState().cart).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("Added to your bag", "success");
  });

  test("opens the quick view for a product", async () => {
    axios.get.mockResolvedValueOnce({ data: HOME_DATA });
    renderHome();
    await screen.findByText("Featured Widget");

    fireEvent.click(screen.getByRole("button", { name: /quick view featured widget/i }));
    expect(await screen.findByTestId("quick-view-mock")).toHaveTextContent("Featured Widget");
  });

  test("shows the 2FA nudge for a signed-in user without 2FA enabled, and dismisses it", async () => {
    axios.get.mockResolvedValueOnce({ data: HOME_DATA });
    renderHome({ user: { _id: "u1", twoFactorEnabled: false, suppress2faPrompt: false } });
    await screen.findByText("Featured Widget");

    expect(screen.getByText(/protect your account/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /maybe later/i }));

    await waitFor(() => {
      expect(screen.queryByText(/protect your account/i)).not.toBeInTheDocument();
    });
  });

  test("does not show the 2FA nudge when the user already has 2FA enabled", async () => {
    axios.get.mockResolvedValueOnce({ data: HOME_DATA });
    renderHome({ user: { _id: "u1", twoFactorEnabled: true } });
    await screen.findByText("Featured Widget");

    expect(screen.queryByText(/protect your account/i)).not.toBeInTheDocument();
  });
});
