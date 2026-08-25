import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import ClientSync from "../ClientSync";
import axios from "../axiosInstance";
import cartReducer from "../../redux/cartSlice";
import wishlistReducer from "../../redux/wishlistSlice";

jest.mock("../axiosInstance");

describe("ClientSync Component", () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.put.mockReset();
    localStorage.clear();
  });

  const renderSync = ({ isAuthenticated = false } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state,
        cart: cartReducer,
        wishlist: wishlistReducer,
      },
    });
    return {
      store,
      ...render(
        <Provider store={store}>
          <ClientSync />
        </Provider>
      ),
    };
  };

  test("does not fetch anything when the user is not authenticated", async () => {
    renderSync({ isAuthenticated: false });
    await new Promise((r) => setTimeout(r, 50));
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("adopts the server cart/wishlist directly when there is no local guest data", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/cart") return Promise.resolve({ data: { cart: [{ _id: "p1", quantity: 2 }] } });
      if (url === "/api/profile/wishlist") return Promise.resolve({ data: { wishlist: [{ _id: "p2" }] } });
      return Promise.resolve({ data: {} });
    });
    const { store } = renderSync({ isAuthenticated: true });

    await waitFor(() => {
      expect(store.getState().cart).toEqual([{ _id: "p1", quantity: 2 }]);
    });
    expect(store.getState().wishlist).toEqual([{ _id: "p2" }]);
    // No guest data existed, so nothing should be pushed back to the server.
    expect(axios.put).not.toHaveBeenCalled();
  });

  test("merges local guest cart/wishlist into the server data and pushes the merge back", async () => {
    localStorage.setItem("vkart_cart", JSON.stringify([{ _id: "guest1", quantity: 1 }]));
    localStorage.setItem("vkart_wishlist", JSON.stringify([{ _id: "guestw1" }]));
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/cart") return Promise.resolve({ data: { cart: [{ _id: "server1", quantity: 1 }] } });
      if (url === "/api/profile/wishlist") return Promise.resolve({ data: { wishlist: [{ _id: "serverw1" }] } });
      return Promise.resolve({ data: {} });
    });
    axios.put.mockResolvedValue({ data: {} });
    const { store } = renderSync({ isAuthenticated: true });

    await waitFor(() => {
      expect(store.getState().cart).toHaveLength(2);
    });
    expect(store.getState().cart.map((i) => i._id).sort()).toEqual(["guest1", "server1"]);
    expect(store.getState().wishlist.map((i) => i._id).sort()).toEqual(["guestw1", "serverw1"]);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/profile/cart",
        expect.objectContaining({ cart: expect.any(Array) })
      );
    });
    // Guest localStorage is cleared immediately to avoid re-merging on refresh.
    expect(localStorage.getItem("vkart_cart")).toBeNull();
    expect(localStorage.getItem("vkart_wishlist")).toBeNull();
  });

  test("combines quantities for the same item present in both guest and server carts", async () => {
    localStorage.setItem("vkart_cart", JSON.stringify([{ _id: "shared", quantity: 3 }]));
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile/cart") return Promise.resolve({ data: { cart: [{ _id: "shared", quantity: 1 }] } });
      if (url === "/api/profile/wishlist") return Promise.resolve({ data: { wishlist: [] } });
      return Promise.resolve({ data: {} });
    });
    axios.put.mockResolvedValue({ data: {} });
    const { store } = renderSync({ isAuthenticated: true });

    await waitFor(() => {
      expect(store.getState().cart).toHaveLength(1);
    });
    // Takes the max, rather than summing, per mergeCart's implementation.
    expect(store.getState().cart[0].quantity).toBe(3);
  });
});
