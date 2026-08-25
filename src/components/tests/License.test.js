import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import License from "../License";

// Static legal content page — a single smoke-render test is enough.
describe("License Component", () => {
  test("renders without crashing", () => {
    render(
      <BrowserRouter>
        <License />
      </BrowserRouter>
    );
    expect(screen.getByRole("heading", { name: /license & attribution/i })).toBeInTheDocument();
  });
});
