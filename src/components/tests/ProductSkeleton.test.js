import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductSkeleton from "../product/ProductSkeleton";

describe("ProductSkeleton Component", () => {
  test("renders a pulsing placeholder card without crashing", () => {
    const { container } = render(<ProductSkeleton />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
