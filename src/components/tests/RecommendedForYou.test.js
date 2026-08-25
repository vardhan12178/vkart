import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import RecommendedForYou from "../RecommendedForYou";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");
jest.mock("react-slick", () => ({ children }) => <div data-testid="slider-mock">{children}</div>);

const makeProducts = (count, overrides = {}) =>
  Array.from({ length: count }, (_, i) => ({
    _id: `p${i}`,
    title: `Product ${i}`,
    price: 100 + i,
    thumbnail: "thumb.png",
    ...overrides,
  }));

describe("RecommendedForYou Component", () => {
  let queryClient;

  const renderWidget = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RecommendedForYou />
        </BrowserRouter>
      </QueryClientProvider>
    );

  beforeEach(() => {
    axios.get.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  test("renders nothing when there are fewer than 4 products", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: makeProducts(3), personalized: true } });
    const { container } = renderWidget();
    await new Promise((r) => setTimeout(r, 0));
    expect(container).toBeEmptyDOMElement();
  });

  test('shows "Trending now" for non-personalized results', async () => {
    axios.get.mockResolvedValueOnce({ data: { products: makeProducts(5), personalized: false } });
    renderWidget();
    expect(await screen.findByText("Trending now")).toBeInTheDocument();
    expect(screen.getByText("Popular Picks")).toBeInTheDocument();
  });

  test('shows "Picked for you" for personalized results', async () => {
    axios.get.mockResolvedValueOnce({ data: { products: makeProducts(5), personalized: true } });
    renderWidget();
    expect(await screen.findByText("Picked for you")).toBeInTheDocument();
    expect(screen.getByText("Recommended for You")).toBeInTheDocument();
  });

  test("renders product cards with a discount badge", async () => {
    axios.get.mockResolvedValueOnce({
      data: { products: makeProducts(5, { discountPercentage: 15 }), personalized: true },
    });
    renderWidget();
    expect(await screen.findByText("Product 0")).toBeInTheDocument();
    expect(screen.getAllByText("-15%").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /product 0/i })[0]).toHaveAttribute("href", "/product/p0");
  });

  test('links "View All" to the products page', async () => {
    axios.get.mockResolvedValueOnce({ data: { products: makeProducts(5), personalized: true } });
    renderWidget();
    expect(await screen.findByRole("link", { name: /view all/i })).toHaveAttribute("href", "/products");
  });
});
