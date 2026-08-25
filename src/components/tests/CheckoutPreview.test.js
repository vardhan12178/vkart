import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import CheckoutPreview from "../CheckoutPreview";

describe("CheckoutPreview Component", () => {
  test("gates checkout behind sign-in with links to login and cart", () => {
    render(
      <BrowserRouter>
        <CheckoutPreview />
      </BrowserRouter>
    );

    const signInLink = screen.getByRole("link", { name: /sign in to continue/i });
    expect(signInLink).toHaveAttribute("href", "/login?redirect=/checkout");
    expect(screen.getByRole("link", { name: /return to your bag/i })).toHaveAttribute("href", "/cart");
  });
});
