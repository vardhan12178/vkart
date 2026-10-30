import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import cartReducer from "../../redux/cartSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import CatalogPreviewList from "../catalogPreview/CatalogPreviewList";
import { fetchProducts, fetchProduct } from "../catalogPreview/catalogApi";
import { showToast } from "../../utils/toast";

jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
jest.mock("../catalogPreview/catalogApi", () => {
  const actual = jest.requireActual("../catalogPreview/catalogApi");
  return { ...actual, fetchProducts: jest.fn(), fetchProduct: jest.fn(), getSource: () => "api", onSourceChange: () => () => {} };
});

const card = (slug, extra = {}) => ({
  id: `id-${slug}`, sku: `${slug}-1`, slug, title: `Brand ${slug}`, brand: "Brand", category: "mobiles",
  image: { md: `${slug}.webp` }, price: 30000, mrp: 40000, discountPercent: 25, priceRange: { min: 30000, max: 35000 },
  colors: [], variantCount: 4, inStock: true, options: { Storage: "128GB", Color: "Black" }, needsSize: false, defaultInStock: true, ...extra,
});

describe("CatalogPreviewList tiles", () => {
  let store;
  beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); }); // category bar scrolls the active tab into view
  beforeEach(() => {
    showToast.mockClear();
    fetchProduct.mockReset().mockReturnValue(new Promise(() => {}));
    store = configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer } });
  });

  const renderList = (products) => {
    fetchProducts.mockResolvedValue({ products, total: products.length, pages: 1, facets: { brands: [], price: { min: 0, max: 50000 } } });
    render(
      <HelmetProvider>
        <Provider store={store}>
          <MemoryRouter initialEntries={["/catalog-preview?cat=mobiles"]}><CatalogPreviewList /></MemoryRouter>
        </Provider>
      </HelmetProvider>
    );
  };

  it("adds the variant the tile shows straight to the cart", async () => {
    renderList([card("phone")]);
    fireEvent.click(await screen.findByRole("button", { name: "Add Brand phone to cart" }));
    expect(store.getState().cart).toEqual([expect.objectContaining({
      catalog: "v2", productId: "id-phone", sku: "phone-1", price: 30000, selectedVariants: "128GB · Black", quantity: 1,
    })]);
    expect(showToast).toHaveBeenCalledWith("Added to cart · 128GB · Black", "success");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks for a size on clothing and for options when the shown variant is sold out", async () => {
    renderList([card("shirt", { category: "fashion", needsSize: true }), card("rare", { defaultInStock: false })]);
    fireEvent.click(await screen.findByRole("button", { name: "Select size for Brand shirt" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(fetchProduct).toHaveBeenCalledWith("shirt");
    expect(screen.getByRole("button", { name: "See options for Brand rare" })).toBeInTheDocument();
    expect(store.getState().cart).toEqual([]);
  });
});
