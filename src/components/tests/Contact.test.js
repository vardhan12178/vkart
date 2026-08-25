import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Contact from "../Contact";

describe("Contact Component", () => {
  test("renders the contact form", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/how can we help you/i)).toBeInTheDocument();
  });

  test("shows validation errors for an empty submission", async () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter your name/i)).toBeInTheDocument();
      expect(screen.getByText(/please provide a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/please write a message/i)).toBeInTheDocument();
    });
  });

  test("rejects an invalid email address", async () => {
    render(<Contact />);
    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByPlaceholderText(/how can we help you/i), { target: { value: "Hello there" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/please provide a valid email/i)).toBeInTheDocument();
  });

  test("selects a topic tag", () => {
    render(<Contact />);
    const tagBtn = screen.getByRole("button", { name: "Order Issue" });
    fireEvent.click(tagBtn);
    expect(tagBtn.className).toEqual(expect.stringContaining("bg-gray-900"));
  });

  test("shows the remaining character count for the message field", () => {
    render(<Contact />);
    const textarea = screen.getByPlaceholderText(/how can we help you/i);
    fireEvent.change(textarea, { target: { value: "Hello" } });
    expect(screen.getByText("795 / 800")).toBeInTheDocument();
  });

  test("submits a valid form, shows a success toast, and resets the fields", async () => {
    render(<Contact />);
    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/how can we help you/i), { target: { value: "Need help with an order" } });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(await screen.findByText(/message sent successfully/i, {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toHaveValue("");
  });
});
