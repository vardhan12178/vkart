import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import MobileTabBar, { showsTabBar } from "../MobileTabBar";
import cartReducer from "../../redux/cartSlice";
import authReducer from "../../redux/authSlice";
import { OPEN_SEARCH_EVENT } from "../../utils/uiEvents";

const renderBar = (path = "/", { signedIn = false, cart = [] } = {}) =>
  render(
    <Provider
      store={configureStore({
        reducer: { cart: cartReducer, auth: authReducer },
        preloadedState: { cart, auth: { isAuthenticated: signedIn, isAdmin: false, user: null } },
      })}
    >
      <MemoryRouter initialEntries={[path]}>
        <MobileTabBar />
      </MemoryRouter>
    </Provider>
  );

describe("MobileTabBar", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  test("shows on browsing pages and hides where something else owns the bottom edge", () => {
    expect(
      ["/", "/products", "/products?cat=mobiles", "/wishlist", "/orders", "/profile"].every(
        showsTabBar
      )
    ).toBe(true);
    expect(
      ["/products/iphone-17", "/cart", "/order-success/abc", "/login", "/admin/catalog"].some(
        showsTabBar
      )
    ).toBe(false);
    renderBar("/products/iphone-17");
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  test("links, bag count and sign-in state", () => {
    renderBar("/products", {
      cart: [
        { catalog: "v2", productId: "a", sku: "A", quantity: 2 },
        { catalog: "v2", productId: "b", sku: "B", quantity: 1 },
      ],
    });
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Bag, 3 items" })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  test("signed-in shoppers get Account, and Search asks the header to open", () => {
    renderBar("/", { signedIn: true });
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/profile");
    const opened = jest.fn();
    window.addEventListener(OPEN_SEARCH_EVENT, opened);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(opened).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_SEARCH_EVENT, opened);
  });
});
