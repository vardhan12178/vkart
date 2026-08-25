import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import PostPage from "../blog/PostPage";

describe("PostPage Component", () => {
  const renderPost = (id) =>
    render(
      <MemoryRouter initialEntries={[`/blog/${id}`]}>
        <Routes>
          <Route path="/blog/:id" element={<PostPage />} />
        </Routes>
      </MemoryRouter>
    );

  test("renders the post matching the route id", () => {
    renderPost("1");
    expect(screen.getByText("Top 10 Smart Desk Upgrades for 2025")).toBeInTheDocument();
  });

  test("shows a not-found state for an unknown id", () => {
    renderPost("does-not-exist");
    expect(screen.getByText("Article Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to journal/i })).toHaveAttribute("href", "/blog");
  });
});
