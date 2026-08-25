import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductModal from "../ProductModal";

const PRODUCT = {
  id: 1,
  title: "Test Product",
  category: "gadgets",
  price: 999,
  description: "A great product.",
  image: "test.png",
  rating: { rate: 4.5, count: 12 },
};

describe("ProductModal Component", () => {
  test("renders nothing when there is no product", () => {
    const { container } = render(<ProductModal product={null} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders product details", () => {
    render(<ProductModal product={PRODUCT} onClose={jest.fn()} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("₹999")).toBeInTheDocument();
    expect(screen.getByText("(12 Reviews)")).toBeInTheDocument();
    expect(screen.getByText("gadgets")).toBeInTheDocument();
  });

  test("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<ProductModal product={PRODUCT} onClose={onClose} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onAddToCart with the product when Add to Cart is clicked", () => {
    const onAddToCart = jest.fn();
    render(<ProductModal product={PRODUCT} onClose={jest.fn()} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledWith(PRODUCT);
  });

  test("locks page scroll while open and restores it on unmount", () => {
    const { unmount } = render(<ProductModal product={PRODUCT} onClose={jest.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
