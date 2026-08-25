import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import "@testing-library/jest-dom";
import ScrollToTop from "../ScrollToTop";

// Purely an effectful utility component (no visible output) that scrolls to
// the top on every route change — one behavioral test covers it fully.
describe("ScrollToTop Component", () => {
  test("scrolls to the top whenever the route changes", () => {
    const scrollToSpy = jest.fn();
    window.scrollTo = scrollToSpy;

    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/b">Go to B</Link>} />
          <Route path="/b" element={<div>Page B</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockClear();
  });
});
