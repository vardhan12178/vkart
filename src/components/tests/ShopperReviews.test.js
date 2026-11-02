import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "../axiosInstance";
import authReducer from "../../redux/authSlice";
import ShopperReviews from "../shop/ShopperReviews";

jest.mock("../axiosInstance", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

const review = (extra = {}) => ({
  id: "r1",
  name: "Asha R.",
  stars: 5,
  title: "Great phone",
  body: "Battery lasts two days easily.",
  variant: "Color: Black",
  date: "2026-10-30",
  helpful: 3,
  verified: true,
  mine: false,
  voted: false,
  ...extra,
});
const reply = (extra = {}) => ({
  data: {
    reviews: [review()],
    total: 1,
    page: 1,
    pages: 1,
    canReview: false,
    myReview: null,
    signedIn: false,
    ...extra,
  },
});

const renderIt = (signedIn = false) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { ...authReducer(undefined, { type: "x" }), isAuthenticated: signedIn },
    },
  });
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Provider store={store}>
        <MemoryRouter>
          <ShopperReviews slug="phone-a" />
        </MemoryRouter>
      </Provider>
    </QueryClientProvider>
  );
};

describe("ShopperReviews", () => {
  beforeEach(() => Object.values(axios).forEach((f) => f.mockReset()));

  test("shows verified reviews and a sign-in hint to visitors", async () => {
    axios.get.mockResolvedValue(reply());
    renderIt(false);
    expect(await screen.findByText("Great phone")).toBeInTheDocument();
    expect(screen.getByText(/verified buyer$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /verified buyer reviews \(1\)/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /write a review/i })).not.toBeInTheDocument();
  });

  test("explains who can review when a signed-in shopper has no delivered order", async () => {
    axios.get.mockResolvedValue(reply({ signedIn: true }));
    renderIt(true);
    expect(await screen.findByText(/only shoppers whose order was delivered/i)).toBeInTheDocument();
  });

  test("an eligible buyer can post a review", async () => {
    axios.get.mockResolvedValue(reply({ reviews: [], total: 0, canReview: true, signedIn: true }));
    axios.post.mockResolvedValue({ data: review() });
    renderIt(true);
    fireEvent.click(await screen.findByRole("button", { name: /write a review/i }));

    fireEvent.click(screen.getByRole("button", { name: /post review/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/pick a star rating/i);

    fireEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: "Lovely screen, average camera." },
    });
    fireEvent.click(screen.getByRole("button", { name: /post review/i }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith("/api/v2/products/phone-a/reviews", {
        stars: 4,
        title: "",
        body: "Lovely screen, average camera.",
      })
    );
  });

  test("voting helpful calls the API; authors see edit and delete instead", async () => {
    axios.get.mockResolvedValue(
      reply({
        reviews: [review(), review({ id: "r2", mine: true, title: "Mine" })],
        total: 2,
        signedIn: true,
      })
    );
    axios.post.mockResolvedValue({ data: { voted: true, helpful: 4 } });
    renderIt(true);
    fireEvent.click(await screen.findByRole("button", { name: /helpful \(3\)/i }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/v2/reviews/r1/helpful"));
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  test("renders nothing when the reviews endpoint is unavailable", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    renderIt(false);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: /verified buyer/i })).not.toBeInTheDocument();
  });
});
