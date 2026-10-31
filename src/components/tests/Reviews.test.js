import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RatingChip, ReviewsSection } from "../shop/Reviews";

const data = {
  average: 4.4, count: 1591, reviewCount: 175, sample: true,
  stars: [{ stars: 5, count: 1100 }, { stars: 4, count: 300 }, { stars: 3, count: 100 }, { stars: 2, count: 40 }, { stars: 1, count: 51 }],
  reviews: [
    { id: "r1", stars: 5, title: "Zoom is unreal", body: "Read the carvings from across the tank.", name: "Kritika Agarwal", city: "Lucknow", date: "2026-10-10", variant: "Storage: 512GB, Color: Black", helpful: 47 },
    { id: "r2", stars: 3, title: "Pricey accessories", body: "Cases cost a lot.", name: "Venkat Naidu", city: "Tirupati", date: "2026-10-04", variant: null, helpful: 0 },
  ],
};

describe("Reviews", () => {
  it("shows the rating chip with count, and nothing without a rating", () => {
    const { container, rerender } = render(<RatingChip rating={{ average: 4.36, count: 12840 }} />);
    expect(screen.getByText("4.4")).toBeInTheDocument();
    expect(screen.getByText("(12,840)")).toBeInTheDocument();
    rerender(<RatingChip rating={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the summary, breakdown and reviews, labelled as sample content", () => {
    render(<ReviewsSection data={data} />);
    expect(screen.getByText("1,591 ratings and 175 reviews")).toBeInTheDocument();
    expect(screen.getByText(/sample reviews/i)).toBeInTheDocument();
    expect(screen.getByText("Zoom is unreal")).toBeInTheDocument();
    expect(screen.getByText("Storage: 512GB, Color: Black")).toBeInTheDocument();
    expect(screen.getByText("Kritika Agarwal")).toBeInTheDocument();
    expect(screen.getByText(/10 Oct 2026/)).toBeInTheDocument();
  });

  it("counts a helpful vote once and lets the reader take it back", () => {
    render(<ReviewsSection data={data} />);
    const button = screen.getByRole("button", { name: "Helpful (47)" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Helpful (48)" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Helpful (48)" }));
    expect(screen.getByRole("button", { name: "Helpful (47)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Helpful" })).toBeInTheDocument();
  });

  it("says when there are no reviews", () => {
    render(<ReviewsSection data={null} />);
    expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
  });
});
