import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Terms from "../Terms";

// Static legal content page — a single smoke-render test is enough.
describe("Terms Component", () => {
  test("renders without crashing", () => {
    render(
      <BrowserRouter>
        <Terms />
      </BrowserRouter>
    );
    expect(screen.getByRole("heading", { name: /terms of service/i })).toBeInTheDocument();
  });
});
