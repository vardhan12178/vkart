import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../../redux/cartSlice";
import QuickAdd from "../catalogPreview/QuickAdd";
import { fetchProduct } from "../catalogPreview/catalogApi";
import { showToast } from "../../utils/toast";

jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
jest.mock("../catalogPreview/catalogApi", () => {
  const actual = jest.requireActual("../catalogPreview/catalogApi");
  return { ...actual, fetchProduct: jest.fn() };
});

const variant = (sku, storage, color, extra = {}) => ({
  sku, options: { Storage: storage, Color: color }, price: storage === "256GB" ? 50000 : 60000, mrp: 70000, discountPercent: 10, inStock: true, ...extra,
});

const phone = {
  id: "p1",
  slug: "test-phone",
  title: "Brand Test Phone",
  brand: "Brand",
  category: "mobiles",
  media: { groupBy: "Color", groups: { Black: [{ thumb: "b-t.webp", md: "b-md.webp" }], Blue: [{ thumb: "u-t.webp", md: "u-md.webp" }] }, common: [] },
  variantOptions: [
    { name: "Storage", values: [{ value: "256GB" }, { value: "512GB" }] },
    { name: "Color", values: [{ value: "Black", hex: "#000" }, { value: "Blue", hex: "#00f" }] },
  ],
  variants: [
    { ...variant("tp-256-black", "256GB", "Black"), isDefault: true },
    variant("tp-512-black", "512GB", "Black"),
    variant("tp-256-blue", "256GB", "Blue", { inStock: false }),
  ],
};

describe("QuickAdd", () => {
  let store;
  beforeEach(() => {
    showToast.mockClear();
    fetchProduct.mockResolvedValue(phone);
    store = configureStore({ reducer: { cart: cartReducer } });
  });

  const renderSheet = (onClose = jest.fn()) => {
    render(
      <Provider store={store}>
        <MemoryRouter><QuickAdd slug="test-phone" onClose={onClose} /></MemoryRouter>
      </Provider>
    );
    return onClose;
  };

  it("adds the chosen variant to the cart and closes", async () => {
    const onClose = renderSheet();
    fireEvent.click(await screen.findByRole("button", { name: "512GB" }));
    expect(screen.getByText("₹60,000")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(store.getState().cart).toEqual([expect.objectContaining({
      catalog: "v2", productId: "p1", sku: "tp-512-black", price: 60000, thumbnail: "b-md.webp", selectedVariants: "512GB · Black", quantity: 1,
    })]);
    expect(onClose).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith("Added to cart · 512GB · Black", "success");
  });

  it("blocks out-of-stock variants", async () => {
    renderSheet();
    fireEvent.click(await screen.findByRole("button", { name: "Blue" }));
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /buy now/i })).toBeDisabled();
  });
});
