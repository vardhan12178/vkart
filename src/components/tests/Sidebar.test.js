import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import Sidebar from "../Sidebar";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const CATEGORIES = [
  { slug: "electronics", label: "Electronics" },
  { slug: "fashion", label: "Fashion" },
];

describe("Sidebar Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderSidebar = (props = {}) => {
    const defaultProps = {
      categoryFilter: "",
      ratingFilter: 0,
      onCategoryChange: jest.fn(),
      onSearch: jest.fn(),
      onRatingChange: jest.fn(),
    };
    const merged = { ...defaultProps, ...props };
    return {
      ...merged,
      ...render(
        <QueryClientProvider client={queryClient}>
          <Sidebar {...merged} />
        </QueryClientProvider>
      ),
    };
  };

  test("renders categories fetched from the filters API", async () => {
    axios.get.mockResolvedValueOnce({ data: { categories: CATEGORIES } });
    renderSidebar();
    expect(await screen.findByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Fashion")).toBeInTheDocument();
  });

  test("shows an error message when categories fail to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderSidebar();
    expect(await screen.findByText(/failed to load categories/i)).toBeInTheDocument();
  });

  test("selecting a category calls onCategoryChange with its slug", async () => {
    axios.get.mockResolvedValueOnce({ data: { categories: CATEGORIES } });
    const { onCategoryChange } = renderSidebar();
    await screen.findByText("Electronics");

    fireEvent.click(screen.getByText("Electronics"));
    expect(onCategoryChange).toHaveBeenCalledWith("electronics");
  });

  test("selecting the already-active category clears it", async () => {
    axios.get.mockResolvedValueOnce({ data: { categories: CATEGORIES } });
    const { onCategoryChange } = renderSidebar({ categoryFilter: "electronics" });
    await screen.findByText("Electronics");

    fireEvent.click(screen.getByText("Electronics"));
    expect(onCategoryChange).toHaveBeenCalledWith("");
  });

  test("selecting a rating calls onRatingChange, and re-selecting clears it", async () => {
    axios.get.mockResolvedValue({ data: { categories: [] } });
    const { onRatingChange } = renderSidebar();

    // There are 4 rating rows (5,4,3,2); click the first one (5-star).
    const ratingButtons = screen.getAllByText("& Up").map((el) => el.closest("button"));
    fireEvent.click(ratingButtons[0]);
    expect(onRatingChange).toHaveBeenCalledWith(5);

    fireEvent.click(ratingButtons[0]);
    expect(onRatingChange).toHaveBeenLastCalledWith(null);
  });

  test("shows a RESET button when a filter is active and clears all filters on click", async () => {
    axios.get.mockResolvedValue({ data: { categories: CATEGORIES } });
    const { onCategoryChange, onSearch, onRatingChange } = renderSidebar({ categoryFilter: "electronics" });
    await screen.findByText("Electronics");

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(onCategoryChange).toHaveBeenCalledWith("");
    expect(onSearch).toHaveBeenCalledWith("");
    expect(onRatingChange).toHaveBeenCalledWith(null);
  });

  test("does not show a RESET button when no filter is active", async () => {
    axios.get.mockResolvedValue({ data: { categories: CATEGORIES } });
    renderSidebar();
    await screen.findByText("Electronics");
    expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
  });

  test("shows a 'more categories' toggle beyond 16 items", async () => {
    const manyCats = Array.from({ length: 20 }, (_, i) => ({ slug: `cat-${i}`, label: `Category ${i}` }));
    axios.get.mockResolvedValueOnce({ data: { categories: manyCats } });
    renderSidebar();

    expect(await screen.findByText(/\+ 4 more categories/i)).toBeInTheDocument();
    expect(screen.queryByText("Category 19")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/\+ 4 more categories/i));
    expect(screen.getByText("Category 19")).toBeInTheDocument();
  });
});
