import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReviewModal from "../ReviewModal";
import axios from "../axiosInstance";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

describe("ReviewModal Component", () => {
  beforeEach(() => {
    axios.post.mockReset();
    showToast.mockClear();
  });

  test("renders nothing when closed", () => {
    const { container } = render(<ReviewModal isOpen={false} onClose={jest.fn()} productId="p1" />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the form when open", () => {
    render(<ReviewModal isOpen onClose={jest.fn()} productId="p1" />);
    expect(screen.getByText("Write a Review")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what did you like or dislike/i)).toBeInTheDocument();
  });

  test("disables the submit button until a rating and a long-enough comment are provided", () => {
    render(<ReviewModal isOpen onClose={jest.fn()} productId="p1" />);
    const submitBtn = screen.getByRole("button", { name: /submit review/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.click(screen.getByTitle("4 Stars"));
    expect(submitBtn).toBeDisabled(); // still no comment

    fireEvent.change(screen.getByPlaceholderText(/what did you like or dislike/i), {
      target: { value: "short" },
    });
    expect(submitBtn).toBeDisabled(); // comment too short

    fireEvent.change(screen.getByPlaceholderText(/what did you like or dislike/i), {
      target: { value: "This product is great quality" },
    });
    expect(submitBtn).not.toBeDisabled();
  });

  test("shows the selected rating label", () => {
    render(<ReviewModal isOpen onClose={jest.fn()} productId="p1" />);
    fireEvent.click(screen.getByTitle("5 Stars"));
    expect(screen.getByText("Excellent (5/5)")).toBeInTheDocument();
  });

  test("submits a review and notifies the parent", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "Thanks!", review: { rating: 5 } } });
    const onClose = jest.fn();
    const onReviewAdded = jest.fn();
    render(<ReviewModal isOpen onClose={onClose} productId="p1" onReviewAdded={onReviewAdded} />);

    fireEvent.click(screen.getByTitle("5 Stars"));
    fireEvent.change(screen.getByPlaceholderText(/what did you like or dislike/i), {
      target: { value: "Excellent build quality and fast shipping" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/products/p1/reviews", {
        rating: 5,
        comment: "Excellent build quality and fast shipping",
      });
    });
    expect(onReviewAdded).toHaveBeenCalledWith({ message: "Thanks!", review: { rating: 5 } });
    expect(onClose).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith("Thanks!", "success");
  });

  test("shows a toast and does not submit when no rating is selected", () => {
    render(<ReviewModal isOpen onClose={jest.fn()} productId="p1" />);
    fireEvent.change(screen.getByPlaceholderText(/what did you like or dislike/i), {
      target: { value: "This is a long enough comment" },
    });
    // Submit button stays disabled without a rating, so simulate a direct
    // form submission event to exercise the guard in handleSubmit.
    fireEvent.submit(screen.getByPlaceholderText(/what did you like or dislike/i).closest("form"));

    expect(showToast).toHaveBeenCalledWith("Please select a rating", "error");
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("shows the server error message when submission fails", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: "Duplicate review" } } });
    render(<ReviewModal isOpen onClose={jest.fn()} productId="p1" />);

    fireEvent.click(screen.getByTitle("3 Stars"));
    fireEvent.change(screen.getByPlaceholderText(/what did you like or dislike/i), {
      target: { value: "Decent product overall" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Duplicate review", "error");
    });
  });
});
