import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Stars from "../Stars";

describe("Stars Component", () => {
  test("renders 5 full stars for a perfect rating", () => {
    const { container } = render(<Stars value={5} />);
    expect(container.querySelectorAll("svg")).toHaveLength(5);
    // No half-star or empty-star icon classes present.
    expect(container.querySelectorAll(".text-gray-200")).toHaveLength(0);
  });

  test("renders 0 full stars and 5 empty stars for a zero rating", () => {
    const { container } = render(<Stars value={0} />);
    expect(container.querySelectorAll(".text-gray-200")).toHaveLength(5);
  });

  test("rounds a rating like 3.7 to the nearest half star (3.5)", () => {
    const { container } = render(<Stars value={3.7} />);
    // 3 full + 1 half + 1 empty = 5 icons total, 1 of which is empty (gray).
    expect(container.querySelectorAll("svg")).toHaveLength(5);
    expect(container.querySelectorAll(".text-gray-200")).toHaveLength(1);
  });
});
