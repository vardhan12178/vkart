import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Privacy from "../Privacy";

// Static legal content page — a single smoke-render test is enough.
describe("Privacy Component", () => {
  test("renders without crashing", () => {
    render(
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
    );
    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
  });
});
