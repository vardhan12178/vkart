import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import About from "../About";

// Static/presentational page (an FAQ accordion is its only interactive bit,
// implemented as a CSS-only collapse rather than conditional rendering) —
// a single smoke-render test is enough per the audit scope for this tier.
describe("About Component", () => {
  test("renders without crashing", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );
    expect(screen.getByText(/is vkart a real store\?/i)).toBeInTheDocument();
  });

  test("links to the one-click demo logins", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /shop as the demo shopper/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: /tour the admin panel/i })).toHaveAttribute(
      "href",
      "/admin/login"
    );
  });
});
