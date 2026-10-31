import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import cartReducer from "../../redux/cartSlice";
import uiReducer from "../../redux/uiSlice";
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
    store = configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer, ui: uiReducer } });
  });

  function Where() {
    const loc = useLocation();
    return <p data-testid="where">{loc.search}</p>;
  }

  const renderList = (products, url = "/products?cat=mobiles", facets = {}) => {
    fetchProducts.mockResolvedValue({ products, total: products.length, pages: 1, facets: { brands: [], price: { min: 0, max: 50000 }, ...facets } });
    render(
      <HelmetProvider>
        <Provider store={store}>
          <MemoryRouter initialEntries={[url]}><CatalogPreviewList /><Where /></MemoryRouter>
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

  it("lists all products when no category is picked", async () => {
    renderList([card("phone")], "/products");
    expect(await screen.findByRole("heading", { name: "All products" })).toBeInTheDocument();
    expect(fetchProducts).toHaveBeenLastCalledWith(expect.not.objectContaining({ category: expect.anything() }));
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  });

  it("searches with the words and price range from the URL, best match first", async () => {
    renderList([card("phone")], "/products?q=gaming%20phone&max=30000");
    expect(await screen.findByRole("heading", { name: 'Results for "gaming phone"' })).toBeInTheDocument();
    expect(fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ q: "gaming phone", maxPrice: 30000, sort: "relevance" }));
    expect(screen.getByText("Under ₹30,000")).toBeInTheDocument();
  });

  it("offers the AI assistant when a search finds nothing", async () => {
    renderList([], "/products?q=flying%20car");
    fireEvent.click(await screen.findByRole("button", { name: "Ask VKart" }));
    expect(store.getState().ui.isChatOpen).toBe(true);
  });

  const specs = [
    { key: "ram", label: "RAM", kind: "multi", options: [{ value: "8", label: "8 GB", count: 17 }, { value: "12", label: "12 GB", count: 24 }] },
    { key: "5g", label: "Network", kind: "flag", options: [{ value: "1", label: "5G", count: 45 }] },
  ];
  const ratings = [{ min: 4, count: 46 }, { min: 3, count: 48 }];

  it("shows the category's filters and keeps choices in the URL", async () => {
    renderList([card("phone")], "/products?cat=mobiles", { specs, ratings });
    const sidebar = (await screen.findAllByText("RAM"))[0].closest("aside");
    expect(within(sidebar).getByText("Network")).toBeInTheDocument();

    fireEvent.click(within(sidebar).getByText("12 GB"));
    expect(screen.getByTestId("where")).toHaveTextContent("f_ram=12");
    await waitFor(() => expect(fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ category: "mobiles", f_ram: "12" })));

    fireEvent.click(within(sidebar).getByText("8 GB"));
    fireEvent.click(within(sidebar).getByText(/4\s*& above/));
    await waitFor(() => expect(fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ f_ram: "12,8", minRating: 4 })));
    // Chips use the option labels; Clear all empties the URL's filters but keeps the category
    expect(screen.getByRole("button", { name: "12 GB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4★ & above" })).toBeInTheDocument();
    fireEvent.click(within(sidebar).getByRole("button", { name: "Clear all" }));
    expect(screen.getByTestId("where")).toHaveTextContent(/^\?cat=mobiles$/);
  });

  it("opens a shared link with its filters applied", async () => {
    renderList([card("phone")], "/products?cat=mobiles&brand=Apple,Samsung&f_5g=1&off=25&sort=rating", { specs, ratings });
    await waitFor(() => expect(fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({
      brand: "Apple,Samsung", f_5g: "1", minDiscount: 25, sort: "rating",
    })));
    expect(await screen.findByRole("button", { name: "5G" })).toBeInTheDocument(); // chip
    expect(screen.getByRole("button", { name: "25%+ off" })).toBeInTheDocument();
  });

  it("drops category filters when switching category", async () => {
    renderList([card("phone")], "/products?cat=mobiles&f_ram=8&q=pro", { specs, ratings });
    fireEvent.click(await screen.findByRole("button", { name: "Laptops" }));
    expect(screen.getByTestId("where")).toHaveTextContent(/^\?cat=laptops&q=pro$/);
  });
});
