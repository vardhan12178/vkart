import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import ComparePage from "../shop/ComparePage";
import { fetchProduct, fetchProducts } from "../shop/catalogApi";
import { addToCompare, readCompare, compareUrl } from "../shop/compareList";

jest.mock("../shop/catalogApi", () => ({
  ...jest.requireActual("../shop/catalogApi"),
  fetchProduct: jest.fn(),
  fetchProducts: jest.fn(),
}));

const product = (slug, price, specs) => ({
  slug,
  title: `Brand ${slug}`,
  brand: "Brand",
  category: "mobiles",
  rating: { average: 4.4, count: 100 },
  priceRange: { min: price, max: price },
  media: { groupBy: "Color", groups: {}, common: [] },
  variantOptions: [],
  specs,
  variants: [{ sku: `${slug}-1`, options: { Color: "Black" }, price, mrp: price, isDefault: true }],
});
const PHONES = {
  a: product("a", 30000, {
    Display: { size: "6.1 inch", panel: "OLED" },
    Battery: { capacity: "4000 mAh" },
  }),
  b: product("b", 40000, {
    Display: { size: "6.7 inch", panel: "OLED" },
    Battery: { capacity: "5000 mAh" },
    Camera: { main: "50 MP" },
  }),
};

function Where() {
  const l = useLocation();
  return <p data-testid="where">{l.pathname + l.search}</p>;
}
const renderCompare = (url) =>
  render(
    <HelmetProvider>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route
              path="/compare"
              element={
                <>
                  <ComparePage />
                  <Where />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

describe("ComparePage", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchProduct.mockReset().mockImplementation(async (slug) => PHONES[slug] || null);
    fetchProducts.mockReset();
  });

  test("compares products from the URL and can show only the differences", async () => {
    renderCompare("/compare?p=a,b");
    const table = await screen.findByRole("table");
    expect(await within(table).findByText("6.7 inch")).toBeInTheDocument();
    expect(within(table).getByText("Camera")).toBeInTheDocument();
    expect(within(table).getAllByText("OLED")).toHaveLength(2);

    fireEvent.click(screen.getByLabelText("Show only differences"));
    expect(within(table).queryByText("Panel")).not.toBeInTheDocument(); // same on both
    expect(within(table).getByText("Capacity")).toBeInTheDocument();
  });

  test("adds a product by search and removes one, keeping the URL in step", async () => {
    fetchProducts.mockResolvedValue({
      products: [
        { slug: "b", title: "Brand b", price: 40000, priceRange: { min: 40000 }, image: null },
      ],
    });
    renderCompare("/compare?p=a");
    await screen.findByRole("table");
    fireEvent.change(screen.getByLabelText("Search products to compare"), {
      target: { value: "brand" },
    });
    fireEvent.click(await screen.findByRole("button", { name: /Brand b/ }));
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/compare?p=a%2Cb"));
    expect(readCompare()).toEqual(["a", "b"]);

    fireEvent.click(await screen.findByRole("button", { name: "Remove Brand a" }));
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/compare?p=b"));
  });

  test("the compare list keeps four at most and builds shareable URLs", () => {
    ["a", "b", "c", "d", "e"].forEach(addToCompare);
    expect(readCompare()).toEqual(["b", "c", "d", "e"]);
    expect(compareUrl(["b", "c"])).toBe("/compare?p=b,c");
    expect(compareUrl([])).toBe("/compare");
  });

  test("an empty compare page points to the shop", () => {
    renderCompare("/compare");
    expect(screen.getByText("Nothing to compare yet")).toBeInTheDocument();
  });
});
