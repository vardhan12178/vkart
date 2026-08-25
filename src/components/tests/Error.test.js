import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Error404 from "../Error";

describe("Error (404) Component", () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, href: "" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  const renderError = () =>
    render(
      <BrowserRouter>
        <Error404 />
      </BrowserRouter>
    );

  test("renders the 404 message with a home link", () => {
    renderError();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  test("searching redirects to the products search page", () => {
    renderError();
    const input = screen.getByPlaceholderText(/search for products/i);
    fireEvent.change(input, { target: { value: "shoes" } });
    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));

    expect(window.location.href).toBe("/products?search=shoes");
  });

  test("does not navigate when the search box is empty", () => {
    renderError();
    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
    expect(window.location.href).toBe("");
  });
});
