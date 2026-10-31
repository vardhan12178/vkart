import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import cartReducer from "../../redux/cartSlice";
import uiReducer from "../../redux/uiSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import CatalogPreviewProduct from "../catalogPreview/CatalogPreviewProduct";
import { fetchProduct, fetchDelivery } from "../catalogPreview/catalogApi";
import { showToast } from "../../utils/toast";

jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
jest.mock("../catalogPreview/catalogApi", () => {
  const actual = jest.requireActual("../catalogPreview/catalogApi");
  return { ...actual, fetchProduct: jest.fn(), fetchSimilar: jest.fn(() => Promise.resolve({ products: [] })), fetchDelivery: jest.fn() };
});

const variant = (size, extra = {}) => ({
  sku: `SHIRT-${size}`, options: { Size: size }, price: 1499, mrp: 2499, discountPercent: 40, stock: 5, isDefault: size === "M", keySpecs: {}, ...extra,
});
const shirt = {
  id: "p1", slug: "linen-shirt", title: "Linen Shirt", brand: "Brand", category: "fashion", categoryPath: ["fashion", "men", "shirts"],
  keySpecs: { gender: "Men" }, highlights: [], specs: {}, source: { urls: ["https://example.com/shirt"], fetchedAt: "2026-10" },
  variantOptions: [{ name: "Size", values: ["S", "M", "L"].map((value) => ({ value })) }],
  media: { groupBy: "Size", groups: {}, common: [{ thumb: "t.webp", md: "m.webp", lg: "l.webp", alt: "shirt" }] },
  variants: [variant("S"), variant("M"), variant("L")], priceRange: { min: 1499, max: 1499 }, inStock: true,
};

function Where() {
  const loc = useLocation();
  return <p data-testid="where">{loc.pathname + loc.search}</p>;
}

const renderPage = (url) => {
  const store = configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer, ui: uiReducer } });
  render(
    <HelmetProvider>
      <Provider store={store}>
        <MemoryRouter initialEntries={[url]}>
          <Routes><Route path="/products/:slug" element={<><CatalogPreviewProduct /><Where /></>} /></Routes>
        </MemoryRouter>
      </Provider>
    </HelmetProvider>
  );
  return store;
};

describe("CatalogPreviewProduct", () => {
  beforeAll(() => { window.scrollTo = jest.fn(); });
  beforeEach(() => {
    localStorage.clear();
    showToast.mockClear();
    fetchProduct.mockReset().mockResolvedValue(shirt);
    fetchDelivery.mockReset();
  });

  it("opens the variant named in the URL and keeps the URL in step with the choice", async () => {
    renderPage("/products/linen-shirt?variant=SHIRT-L");
    expect(await screen.findByText("Size:")).toBeInTheDocument();
    expect(screen.getByText("Size:").parentElement).toHaveTextContent("Size: L");

    fireEvent.click(screen.getByRole("button", { name: "S" }));
    expect(screen.getByTestId("where")).toHaveTextContent("/products/linen-shirt?variant=SHIRT-S");
  });

  it("shows the size guide with the chosen size highlighted", async () => {
    renderPage("/products/linen-shirt");
    fireEvent.click(await screen.findByRole("button", { name: "Size guide" }));
    const dialog = screen.getByRole("dialog", { name: /size guide: men's tops/i });
    const row = within(dialog).getByRole("row", { name: /^M 40$/ });
    expect(row).toHaveAttribute("aria-current", "true");
    fireEvent.click(within(dialog).getByRole("button", { name: "Centimetres" }));
    expect(within(dialog).getByRole("row", { name: /^M 102$/ })).toBeInTheDocument();
  });

  it("copies the link when sharing on a desktop", async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    renderPage("/products/linen-shirt");
    fireEvent.click(await screen.findByRole("button", { name: "Share" }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith("Link copied", "success"));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("checks delivery for the remembered PIN code", async () => {
    localStorage.setItem("vkart:pincode", "560038");
    fetchDelivery.mockResolvedValue({
      pincode: "560038", valid: true, serviceable: true, zone: "metro", days: { min: 1, max: 2 },
      place: { area: "Indiranagar", district: "Bengaluru Urban", state: "Karnataka" }, cod: true, installation: false,
    });
    renderPage("/products/linen-shirt");
    expect(await screen.findByText(/Indiranagar, Bengaluru Urban, Karnataka 560038/)).toBeInTheDocument();
    expect(fetchDelivery).toHaveBeenCalledWith("560038", "fashion-men");
    expect(screen.getByText("Free delivery")).toBeInTheDocument(); // ₹1,499 is over the ₹999 threshold
    expect(screen.getByText(/Tomorrow, /)).toBeInTheDocument();
  });
});
