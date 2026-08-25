import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import About from "../About";

// Static/presentational page (an FAQ accordion is its only interactive bit,
// implemented as a CSS-only collapse rather than conditional rendering) —
// a single smoke-render test is enough per the audit scope for this tier.
describe("About Component", () => {
  test("renders without crashing", () => {
    render(<About />);
    expect(screen.getByText(/is vkart a real store\?/i)).toBeInTheDocument();
  });
});
