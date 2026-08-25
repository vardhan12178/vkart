import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import ProductCard from "../ProductCard";
import axios from "../axiosInstance";
import cartReducer from "../../redux/cartSlice";
import wishlistReducer from "../../redux/wishlistSlice";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
jest.mock("react-slick", () => (props) => <div data-testid="slider-mock">{props.children}</div>);
jest.mock("../ReviewModal", () => (props) =>
  props.isOpen ? <div data-testid="review-modal-mock">Review Modal Open</div> : null
);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeAll(() => {
  Object.defineProperty(window, "scrollTo", { writable: true, value: jest.fn() });
  global.IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

const PRODUCT = {
  _id: "prod1",
  title: "Test Headphones",
  brand: "Acme",
  category: "electronics",
  price: 2000,
  discountPercentage: 10,
  rating: 4.3,
  stock: 5,
  description: "Great sound quality.",
  images: ["img1.png"],
  thumbnail: "img1.png",
  reviews: [],
  variants: [],
};

const PRODUCT_WITH_VARIANTS = {
  ...PRODUCT,
  variants: [{ type: "Color", options: ["Black", "White"] }],
};

describe("ProductCard (Product Detail Page) Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    mockNavigate.mockClear();
    showToast.mockClear();
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const mockProductEndpoints = (product) => {
    axios.get.mockImplementation((url) => {
      if (url === `/api/products/${product._id}`) return Promise.resolve({ data: product });
      if (url === `/api/products/${product._id}/similar`) return Promise.resolve({ data: { products: [] } });
      if (url === "/api/sales/active") return Promise.resolve({ data: { sale: null } });
      if (url === "/api/products") return Promise.resolve({ data: { products: [] } });
      return Promise.resolve({ data: {} });
    });
  };

  const renderProductCard = ({ isAuthenticated = false, cart = [], wishlist = [] } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state,
        cart: cartReducer,
        wishlist: wishlistReducer,
      },
      preloadedState: { auth: { isAuthenticated, isAdmin: false, user: null }, cart, wishlist },
    });
    return {
      store,
      ...render(
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <MemoryRouter initialEntries={["/product/prod1"]}>
                <Routes>
                  <Route path="/product/:id" element={<ProductCard />} />
                </Routes>
              </MemoryRouter>
            </Provider>
          </QueryClientProvider>
        </HelmetProvider>
      ),
    };
  };

  test("shows a loading message before the product resolves", () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderProductCard();
    expect(screen.getByText(/preparing the details/i)).toBeInTheDocument();
  });

  test("shows an error message when the product fails to load", async () => {
    axios.get.mockRejectedValue(new Error("not found"));
    renderProductCard();
    expect(await screen.findByText(/we could not find this product/i)).toBeInTheDocument();
  });

  test("renders product title, brand, and price", async () => {
    mockProductEndpoints(PRODUCT);
    renderProductCard();
    expect(await screen.findByRole("heading", { name: "Test Headphones" })).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getAllByText("₹2,000").length).toBeGreaterThan(0);
  });

  test("increments and decrements the quantity", async () => {
    mockProductEndpoints(PRODUCT);
    renderProductCard();
    await screen.findByRole("heading", { name: "Test Headphones" });

    // The quantity value sits in the <span> between the -/+ buttons; query
    // relative to the decrease button since a page elsewhere also renders a
    // bare "3"/"2" (a rating breakdown count).
    const qtyValue = () => screen.getByLabelText(/decrease quantity/i).nextElementSibling;

    fireEvent.click(screen.getByLabelText(/increase quantity/i));
    fireEvent.click(screen.getByLabelText(/increase quantity/i));
    expect(qtyValue()).toHaveTextContent("3");

    fireEvent.click(screen.getByLabelText(/decrease quantity/i));
    expect(qtyValue()).toHaveTextContent("2");
  });

  test("adds the product to the cart with the selected quantity", async () => {
    mockProductEndpoints(PRODUCT);
    const { store } = renderProductCard();
    await screen.findByRole("heading", { name: "Test Headphones" });

    fireEvent.click(screen.getByLabelText(/increase quantity/i));
    fireEvent.click(screen.getAllByRole("button", { name: /add to bag/i })[0]);

    expect(store.getState().cart).toHaveLength(1);
    expect(store.getState().cart[0].quantity).toBe(2);
    expect(showToast).toHaveBeenCalledWith("Added 2 to cart", "success");
  });

  test("blocks adding to cart until a required variant is selected", async () => {
    mockProductEndpoints(PRODUCT_WITH_VARIANTS);
    const { store } = renderProductCard();
    await screen.findByRole("heading", { name: "Test Headphones" });

    fireEvent.click(screen.getAllByRole("button", { name: /add to bag/i })[0]);
    expect(showToast).toHaveBeenCalledWith("Please select a Color", "error");
    expect(store.getState().cart).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Black" }));
    fireEvent.click(screen.getAllByRole("button", { name: /add to bag/i })[0]);

    expect(store.getState().cart).toHaveLength(1);
    expect(store.getState().cart[0].selectedVariants).toBe("Color: Black");
  });

  test("buy now adds to cart and navigates to the cart page", async () => {
    mockProductEndpoints(PRODUCT);
    const { store } = renderProductCard();
    await screen.findByRole("heading", { name: "Test Headphones" });

    fireEvent.click(screen.getAllByRole("button", { name: /buy now/i })[0]);

    expect(store.getState().cart).toHaveLength(1);
    expect(mockNavigate).toHaveBeenCalledWith("/cart");
  });

  test("disables adding to bag and hides Buy Now when out of stock", async () => {
    mockProductEndpoints({ ...PRODUCT, stock: 0 });
    renderProductCard();
    await screen.findByRole("heading", { name: "Test Headphones" });

    const outOfStockButtons = screen.getAllByRole("button", { name: /out of stock/i });
    expect(outOfStockButtons.length).toBeGreaterThan(0);
    outOfStockButtons.forEach((btn) => expect(btn).toBeDisabled());
    expect(screen.queryByRole("button", { name: /buy now/i })).not.toBeInTheDocument();
  });

  test("toggles the product in the wishlist", async () => {
    mockProductEndpoints(PRODUCT);
    const { store } = renderProductCard();
    await screen.findByRole("heading", { name: "Test Headphones" });

    fireEvent.click(screen.getByRole("button", { name: /save item/i }));

    expect(store.getState().wishlist).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("Added to wishlist", "success");
  });

  test("redirects to login when an unauthenticated user tries to write a review", async () => {
    mockProductEndpoints(PRODUCT);
    renderProductCard({ isAuthenticated: false });
    await screen.findByRole("heading", { name: "Test Headphones" });

    fireEvent.click(screen.getByRole("button", { name: /write review/i }));

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/login?redirect="));
  });

  test("opens the review modal for an authenticated user", async () => {
    mockProductEndpoints(PRODUCT);
    renderProductCard({ isAuthenticated: true });
    await screen.findByRole("heading", { name: "Test Headphones" });

    fireEvent.click(screen.getByRole("button", { name: /write review/i }));

    expect(await screen.findByTestId("review-modal-mock")).toBeInTheDocument();
  });
});
