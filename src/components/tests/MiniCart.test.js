import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../../redux/cartSlice";
import uiReducer, { openMiniCart } from "../../redux/uiSlice";
import MiniCart from "../MiniCart";

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const strip = ({ initial, animate, exit, transition, ...rest }) => rest;
  return {
    motion: new Proxy({}, { get: (_t, tag) => ({ children, ...props }) => mockReact.createElement(tag, strip(props), children) }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const line = (id, price, extra = {}) => ({
  catalog: "v2", productId: id, sku: `${id}-1`, slug: id, title: `Item ${id}`, price, thumbnail: "", quantity: 1, selectedVariants: "Black", ...extra,
});

function Where() {
  const loc = useLocation();
  return <p data-testid="where">{loc.pathname + loc.search}</p>;
}

const renderCart = (cart, lastKey = null) => {
  const store = configureStore({ reducer: { cart: cartReducer, ui: uiReducer }, preloadedState: { cart } });
  store.dispatch(openMiniCart(lastKey));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/products"]}>
        <Routes><Route path="*" element={<><MiniCart /><Where /></>} /></Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

describe("MiniCart", () => {
  test("shows the added line, subtotal and how far free delivery is", () => {
    renderCart([line("a", 300), line("b", 200, { quantity: 2 })], "b::Black");
    expect(screen.getByRole("dialog", { name: "Shopping cart" })).toBeInTheDocument();
    expect(screen.getByText("Added to cart")).toBeInTheDocument();
    expect(screen.getByText("Subtotal (3 items)")).toBeInTheDocument();
    expect(screen.getByText("₹700")).toBeInTheDocument();
    expect(screen.getByText("₹299")).toBeInTheDocument(); // ₹999 - ₹700 left for free delivery
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "70");
    expect(screen.getAllByRole("link", { name: /Item/ })[0]).toHaveAttribute("href", "/products/b?variant=b-1");
  });

  test("changes quantities, removes lines and unlocks free delivery", () => {
    const store = renderCart([line("a", 600)]);
    expect(screen.getByText("Your cart (1)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity of Item a" }));
    expect(store.getState().cart[0].quantity).toBe(2);
    expect(screen.getByText("You've unlocked free delivery")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Item a" }));
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  test("checkout goes to the cart's payment step and closes the drawer", () => {
    const store = renderCart([line("a", 600)]);
    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));
    expect(screen.getByTestId("where")).toHaveTextContent("/cart?checkout=1");
    expect(store.getState().ui.miniCart.open).toBe(false);
  });

  test("closes on Escape", () => {
    const store = renderCart([line("a", 600)]);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(store.getState().ui.miniCart.open).toBe(false);
  });
});
