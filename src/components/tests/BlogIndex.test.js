import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import BlogIndex from "../blog/BlogIndex";

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const strip = (props) => {
    const { initial, animate, exit, variants, transition, whileHover, whileTap, custom, ...rest } = props;
    return rest;
  };
  return {
    motion: new Proxy(
      {},
      { get: (_t, tag) => ({ children, ...props }) => mockReact.createElement(tag, strip(props), children) }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe("BlogIndex Component", () => {
  const renderIndex = () =>
    render(
      <BrowserRouter>
        <BlogIndex />
      </BrowserRouter>
    );

  test("renders the seeded blog posts", () => {
    renderIndex();
    expect(screen.getByText("Top 10 Smart Desk Upgrades for 2025")).toBeInTheDocument();
  });

  test("filters posts by search query", () => {
    renderIndex();
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "minimal workspace" } });

    expect(screen.getByText("Minimal Workspace Guide: Build a Clean, Calm Desk Setup")).toBeInTheDocument();
    expect(screen.queryByText("Top 10 Smart Desk Upgrades for 2025")).not.toBeInTheDocument();
  });

  test("shows an empty state when no posts match", () => {
    renderIndex();
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: "nonexistent-topic-xyz" } });
    expect(screen.getByText(/no (articles|posts) (found|match)/i)).toBeInTheDocument();
  });
});
