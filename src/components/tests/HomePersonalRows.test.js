import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Home from "../home/Home";
import { fetchProducts, fetchSimilar } from "../shop/catalogApi";
import cartReducer from "../../redux/cartSlice";
import uiReducer from "../../redux/uiSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import authReducer from "../../redux/authSlice";

jest.mock("../shop/catalogApi", () => ({
  ...jest.requireActual("../shop/catalogApi"),
  fetchProducts: jest.fn(),
  fetchSimilar: jest.fn(),
}));

const card = (slug, extra = {}) => ({
  slug,
  title: `Brand ${slug}`,
  brand: "Brand",
  category: "mobiles",
  price: 1000,
  mrp: 1000,
  discountPercent: 0,
  priceRange: { min: 1000, max: 1000 },
  image: null,
  ...extra,
});

const renderHome = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Provider
        store={configureStore({
          reducer: {
            cart: cartReducer,
            ui: uiReducer,
            wishlist: wishlistReducer,
            auth: authReducer,
          },
        })}
      >
        <HelmetProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </HelmetProvider>
      </Provider>
    </QueryClientProvider>
  );

describe("Home personal rows", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchProducts
      .mockReset()
      .mockResolvedValue({ products: [card("deal-1")], total: 1, facets: {} });
    fetchSimilar.mockReset();
  });

  test("a first-time visitor sees no personal rows", async () => {
    renderHome();
    await screen.findAllByText("Top deals");
    expect(screen.queryByText("Recently viewed")).not.toBeInTheDocument();
    expect(fetchSimilar).not.toHaveBeenCalled();
  });

  test("shows recently viewed and recommends similar products the shopper hasn't seen", async () => {
    localStorage.setItem(
      "vkart:recently-viewed",
      JSON.stringify([card("seen-a"), card("seen-b"), card("seen-c")])
    );
    fetchSimilar.mockImplementation(async (slug) => ({
      products:
        slug === "seen-a"
          ? [card("rec-1"), card("seen-b"), card("rec-2")]
          : [card("rec-3"), card("rec-1")],
    }));
    renderHome();

    expect(await screen.findByText("Recently viewed")).toBeInTheDocument();
    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("rec-3", { exact: false })).toBeInTheDocument());
    expect(fetchSimilar.mock.calls.map((c) => c[0])).toEqual(["seen-a", "seen-b"]); // only the last two viewed seed it
    // each recommendation once, nothing already viewed
    expect(screen.getAllByText("Brand rec-1".replace("Brand ", ""), { exact: false })).toHaveLength(
      1
    );
    expect(screen.getAllByText("seen-b", { exact: false })).toHaveLength(1); // only in "Recently viewed"
  });
});
