import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Compare from "../Compare";
import axios from "../axiosInstance";
import cartReducer from "../../redux/cartSlice";

jest.mock("../axiosInstance");

const PRODUCT_A = { _id: "p1", title: "Widget A", thumbnail: "a.png", price: 500 };
const PRODUCT_B = { _id: "p2", title: "Widget B", thumbnail: "b.png", price: 700 };

describe("Compare Component", () => {
  const renderCompare = (initialPath = "/compare?ids=p1,p2") => {
    const store = configureStore({ reducer: { cart: cartReducer }, preloadedState: { cart: [] } });
    return {
      store,
      ...render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/compare" element={<Compare />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      ),
    };
  };

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
  });

  test("shows the empty state when no products are selected", () => {
    renderCompare("/compare");
    expect(screen.getByText("Compare Products")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse collection/i })).toHaveAttribute("href", "/products");
  });

  test("renders the selected products", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products/p1") return Promise.resolve({ data: PRODUCT_A });
      if (url === "/api/products/p2") return Promise.resolve({ data: PRODUCT_B });
      return Promise.resolve({ data: null });
    });
    renderCompare();
    expect(await screen.findByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
    expect(screen.getByText("2 Items Selected")).toBeInTheDocument();
  });

  test("removes a product from the comparison", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products/p1") return Promise.resolve({ data: PRODUCT_A });
      if (url === "/api/products/p2") return Promise.resolve({ data: PRODUCT_B });
      return Promise.resolve({ data: null });
    });
    renderCompare();
    await screen.findByText("Widget A");

    const removeButtons = screen.getAllByLabelText(/remove product from comparison/i);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("1 Item Selected")).toBeInTheDocument();
    });
  });

  test("clears all compared products", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products/p1") return Promise.resolve({ data: PRODUCT_A });
      if (url === "/api/products/p2") return Promise.resolve({ data: PRODUCT_B });
      return Promise.resolve({ data: null });
    });
    renderCompare();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getByLabelText(/clear all compared products/i));

    expect(await screen.findByText("Compare Products")).toBeInTheDocument();
  });

  test("adds a compared product to the cart", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products/p1") return Promise.resolve({ data: PRODUCT_A });
      if (url === "/api/products/p2") return Promise.resolve({ data: PRODUCT_B });
      return Promise.resolve({ data: null });
    });
    const { store } = renderCompare();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getAllByRole("button", { name: /add to cart/i })[0]);

    expect(store.getState().cart).toHaveLength(1);
  });

  test("fetches and displays an AI comparison verdict", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products/p1") return Promise.resolve({ data: PRODUCT_A });
      if (url === "/api/products/p2") return Promise.resolve({ data: PRODUCT_B });
      return Promise.resolve({ data: null });
    });
    axios.post.mockResolvedValueOnce({
      data: {
        available: true,
        overallPickId: "p1",
        overallReason: "Better value overall.",
        perProduct: [{ id: "p1", bestFor: "Budget shoppers" }],
      },
    });
    renderCompare();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getByRole("button", { name: /get ai comparison/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/ai/compare", { ids: ["p1", "p2"] });
    });
    expect(await screen.findByText(/better value overall/i)).toBeInTheDocument();
    expect(screen.getByText(/budget shoppers/i)).toBeInTheDocument();
  });

  test("shows an error message when the AI comparison request fails", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products/p1") return Promise.resolve({ data: PRODUCT_A });
      if (url === "/api/products/p2") return Promise.resolve({ data: PRODUCT_B });
      return Promise.resolve({ data: null });
    });
    axios.post.mockRejectedValueOnce(new Error("AI service down"));
    renderCompare();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getByRole("button", { name: /get ai comparison/i }));

    expect(await screen.findByText(/couldn't generate a comparison/i)).toBeInTheDocument();
  });
});
