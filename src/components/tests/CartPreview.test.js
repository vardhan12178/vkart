import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import CartPreview from "../CartPreview";

describe("CartPreview Component", () => {
  test("gates the bag behind sign-in with links to login and products", () => {
    render(
      <BrowserRouter>
        <CartPreview />
      </BrowserRouter>
    );

    const signInLink = screen.getByRole("link", { name: /sign in to your bag/i });
    expect(signInLink).toHaveAttribute("href", "/login?redirect=/cart");
    expect(screen.getByRole("link", { name: /browse the collection/i })).toHaveAttribute("href", "/products");
  });
});
