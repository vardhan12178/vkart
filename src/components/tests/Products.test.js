import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import Products from "../Products";
import axios from "../axiosInstance";
import wishlistReducer from "../../redux/wishlistSlice";
import cartReducer from "../../redux/cartSlice";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
jest.mock("../Sidebar", () => () => <div data-testid="sidebar-mock" />);
jest.mock("../CustomDropdown", () => () => <div data-testid="dropdown-mock" />);
jest.mock("../product/ProductQuickView", () => (props) =>
  props.product ? (
    <div data-testid="quick-view-mock">
      Quick view: {props.product.title}
      <button onClick={props.onClose}>Close Quick View</button>
    </div>
  ) : null
);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const PRODUCT_A = {
  _id: "prodA",
  title: "Widget A",
  category: "gadgets",
  price: 500,
  thumbnail: "a.png",
  discountPercentage: 10,
  rating: 4.2,
};
const PRODUCT_B = {
  _id: "prodB",
  title: "Widget B",
  category: "gadgets",
  price: 700,
  thumbnail: "b.png",
};

const pageOf = (products, opts = {}) => ({
  products,
  pagination: { page: opts.page || 1, totalPages: opts.totalPages || 1, total: opts.total ?? products.length },
  activeSale: opts.activeSale || null,
});

describe("Products Component", () => {
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

  const renderProducts = ({ wishlist = [], cart = [] } = {}) => {
    const store = configureStore({
      reducer: { wishlist: wishlistReducer, cart: cartReducer },
      preloadedState: { wishlist, cart },
    });
    return {
      store,
      ...render(
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <BrowserRouter>
                <Products />
              </BrowserRouter>
            </Provider>
          </QueryClientProvider>
        </HelmetProvider>
      ),
    };
  };

  test("renders the product grid", async () => {
    axios.get.mockResolvedValueOnce({ data: pageOf([PRODUCT_A, PRODUCT_B]) });
    renderProducts();
    expect(await screen.findByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
    expect(screen.getByText("-10%")).toBeInTheDocument();
  });

  test("shows the empty state and clears filters", async () => {
    axios.get.mockResolvedValue({ data: pageOf([]) });
    renderProducts();
    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    // Still renders the empty state after clearing (no products mocked either way).
    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  test("toggles a product into the wishlist", async () => {
    axios.get.mockResolvedValueOnce({ data: pageOf([PRODUCT_A]) });
    const { store } = renderProducts();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getByRole("button", { name: /save widget a/i }));

    expect(store.getState().wishlist).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("Added to Wishlist", "success");
  });

  test("adds a product to the cart", async () => {
    axios.get.mockResolvedValueOnce({ data: pageOf([PRODUCT_A]) });
    const { store } = renderProducts();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getAllByText(/add to cart/i)[0]);

    expect(store.getState().cart).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("Added to Cart", "success");
  });

  test("selects products for comparison and navigates to the compare page", async () => {
    axios.get.mockResolvedValueOnce({ data: pageOf([PRODUCT_A, PRODUCT_B]) });
    renderProducts();
    await screen.findByText("Widget A");

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(screen.getAllByText("2").length).toBeGreaterThan(0); // compare count badge(s)

    // Accessible name is "Compare2" since the count badge is a sibling <span>
    // inside the same button with no separating text.
    fireEvent.click(screen.getByRole("button", { name: /^compare/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/compare?ids=prodA,prodB");
  });

  test("opens the quick view for a product", async () => {
    axios.get.mockResolvedValueOnce({ data: pageOf([PRODUCT_A]) });
    renderProducts();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getByRole("button", { name: /quick view widget a/i }));
    expect(screen.getByTestId("quick-view-mock")).toHaveTextContent("Widget A");

    fireEvent.click(screen.getByText("Close Quick View"));
    expect(screen.queryByTestId("quick-view-mock")).not.toBeInTheDocument();
  });

  test("shows the active sale banner when the backend reports one", async () => {
    axios.get.mockResolvedValueOnce({
      data: pageOf([PRODUCT_A], { activeSale: { name: "Diwali Sale" } }),
    });
    renderProducts();
    expect(await screen.findByText("Diwali Sale")).toBeInTheDocument();
    expect(screen.getByText(/limited-time sale/i)).toBeInTheDocument();
  });

  test('shows "Show More" and fetches the next page', async () => {
    axios.get.mockImplementation((url, config) => {
      const page = config?.params?.page || 1;
      if (page === 1) return Promise.resolve({ data: pageOf([PRODUCT_A], { page: 1, totalPages: 2, total: 2 }) });
      return Promise.resolve({ data: pageOf([PRODUCT_B], { page: 2, totalPages: 2, total: 2 }) });
    });
    renderProducts();
    await screen.findByText("Widget A");

    fireEvent.click(screen.getByRole("button", { name: /show more/i }));

    expect(await screen.findByText("Widget B")).toBeInTheDocument();
  });
});
