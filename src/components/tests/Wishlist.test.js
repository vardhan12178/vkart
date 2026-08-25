import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import Wishlist from "../Wishlist";
import cartReducer from "../../redux/cartSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import { showToast } from "../../utils/toast";

jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

const ITEM_A = { _id: "p1", title: "Saved Widget", price: 500, discountPercentage: 20, category: "gadgets", thumbnail: "a.png" };
const ITEM_B = { _id: "p2", title: "Saved Gadget", price: 300, category: "accessories", thumbnail: "b.png" };

describe("Wishlist Component", () => {
  const renderWishlist = (wishlist = []) => {
    const store = configureStore({
      reducer: { cart: cartReducer, wishlist: wishlistReducer },
      preloadedState: { cart: [], wishlist },
    });
    return {
      store,
      ...render(
        <HelmetProvider>
          <Provider store={store}>
            <BrowserRouter>
              <Wishlist />
            </BrowserRouter>
          </Provider>
        </HelmetProvider>
      ),
    };
  };

  beforeEach(() => {
    showToast.mockClear();
  });

  test("shows the empty state when there are no saved items", () => {
    renderWishlist([]);
    expect(screen.getByText("Nothing saved—yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore the collection/i })).toHaveAttribute("href", "/products");
  });

  test("renders saved items with pricing and discount", () => {
    renderWishlist([ITEM_A, ITEM_B]);
    expect(screen.getByText("Saved Widget")).toBeInTheDocument();
    expect(screen.getByText("Saved Gadget")).toBeInTheDocument();
    expect(screen.getByText("-20%")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  test("moves an item to the cart and removes it from the wishlist", () => {
    const { store } = renderWishlist([ITEM_A]);
    fireEvent.click(screen.getByRole("button", { name: /move to bag/i }));

    expect(store.getState().cart).toHaveLength(1);
    expect(store.getState().wishlist).toHaveLength(0);
    expect(showToast).toHaveBeenCalledWith("Moved to cart", "success");
  });

  test("removes a single item from the wishlist", () => {
    const { store } = renderWishlist([ITEM_A, ITEM_B]);
    fireEvent.click(screen.getByLabelText(/remove saved widget from saved items/i));

    expect(store.getState().wishlist).toHaveLength(1);
    expect(store.getState().wishlist[0]._id).toBe("p2");
    expect(showToast).toHaveBeenCalledWith("Removed from saved items", "success");
  });

  test("clears the entire wishlist", () => {
    const { store } = renderWishlist([ITEM_A, ITEM_B]);
    fireEvent.click(screen.getByLabelText(/clear all saved items/i));

    expect(store.getState().wishlist).toHaveLength(0);
    expect(showToast).toHaveBeenCalledWith("Saved items cleared", "success");
  });
});
