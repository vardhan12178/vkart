import { vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../Modal";

describe("Modal Component", () => {
  test("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders children when open", () => {
    render(
      <Modal open onClose={vi.fn()}>
        <p>Modal body content</p>
      </Modal>
    );
    expect(screen.getByText("Modal body content")).toBeInTheDocument();
  });

  test("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalled();
  });
});
