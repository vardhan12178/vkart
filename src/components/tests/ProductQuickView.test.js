import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import ProductQuickView from "../product/ProductQuickView";

const PRODUCT = {
  _id: "p1",
  title: "Quick View Product",
  category: "gadgets",
  price: 800,
  discountPercentage: 20,
  description: "Preview description.",
  images: ["img1.png", "img2.png"],
  thumbnail: "thumb.png",
  rating: 4,
  stock: 5,
};

describe("ProductQuickView Component", () => {
  const renderQuickView = (props = {}) =>
    render(
      <BrowserRouter>
        <ProductQuickView product={PRODUCT} onClose={jest.fn()} onAdd={jest.fn()} {...props} />
      </BrowserRouter>
    );

  test("renders nothing when there is no product", () => {
    const { container } = render(
      <BrowserRouter>
        <ProductQuickView product={null} onClose={jest.fn()} onAdd={jest.fn()} />
      </BrowserRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders product details with the discount badge", () => {
    renderQuickView();
    expect(screen.getByText("Quick View Product")).toBeInTheDocument();
    expect(screen.getByText("₹800")).toBeInTheDocument();
    expect(screen.getByText("Save 20%")).toBeInTheDocument();
    expect(screen.getByText(/ready to ship/i)).toBeInTheDocument();
  });

  test("switches the active image when a thumbnail is clicked", () => {
    renderQuickView();
    const thumb2 = screen.getByRole("button", { name: /view image 2 of 2/i });
    fireEvent.click(thumb2);
    expect(thumb2).toHaveAttribute("aria-pressed", "true");
  });

  test("closes when the Escape key is pressed", () => {
    const onClose = jest.fn();
    renderQuickView({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("closes when the backdrop is clicked", () => {
    const onClose = jest.fn();
    renderQuickView({ onClose });
    fireEvent.click(screen.getByLabelText(/close product preview/i, { selector: 'button[tabindex="-1"]' }));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onAdd with the product when in stock", () => {
    const onAdd = jest.fn();
    renderQuickView({ onAdd });
    fireEvent.click(screen.getByRole("button", { name: /add to bag/i }));
    expect(onAdd).toHaveBeenCalledWith(PRODUCT);
  });

  test("disables adding to bag when out of stock", () => {
    renderQuickView({ product: { ...PRODUCT, stock: 0 } });
    const btn = screen.getByRole("button", { name: /unavailable/i });
    expect(btn).toBeDisabled();
    expect(screen.getByText(/currently unavailable/i)).toBeInTheDocument();
  });

  test('links "View full details" to the product page', () => {
    renderQuickView();
    expect(screen.getByRole("link", { name: /view full details/i })).toHaveAttribute("href", "/product/p1");
  });
});
