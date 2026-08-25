import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Footer from "../Footer";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

describe("Footer Component", () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  const renderFooter = () =>
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

  test("renders footer navigation links", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /all products/i })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: /^privacy$/i })).toHaveAttribute("href", "/privacy");
  });

  test("subscribes to the newsletter and shows a confirmation", async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderFooter();

    fireEvent.change(screen.getByPlaceholderText(/your email address/i), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join the list/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/newsletter/subscribe", { email: "reader@example.com" });
    });
    expect(await screen.findByText(/you.re on the list/i)).toBeInTheDocument();
  });

  test("shows an error message when the subscription request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("network down"));
    renderFooter();

    fireEvent.change(screen.getByPlaceholderText(/your email address/i), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join the list/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
