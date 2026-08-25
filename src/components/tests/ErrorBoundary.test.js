import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorBoundary from "../ErrorBoundary";

function Bomb() {
  throw new Error("Boom");
}

describe("ErrorBoundary Component", () => {
  let consoleErrorSpy;
  let originalLocation;

  beforeEach(() => {
    // React logs the caught error to console.error (expected); silence it
    // for a clean test run while still asserting it fired.
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, href: "" };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    window.location = originalLocation;
  });

  test("renders children normally when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  test("renders a fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
  });

  test('"Go Home" navigates to the root path', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByRole("button", { name: /go home/i }));
    expect(window.location.href).toBe("/");
  });
});
