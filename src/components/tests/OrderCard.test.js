import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrderCard from "../OrderCard";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const baseOrder = {
  _id: "abcdef1234567890",
  createdAt: "2024-01-15T10:30:00.000Z",
  totalPrice: 1500,
  stage: "SHIPPED",
  shippingAddress: "42 Test Lane, Pune",
  products: [
    { name: "Widget", quantity: 2, price: 500, lineTotal: 1000, image: "" },
    { name: "Gadget", quantity: 1, price: 500, lineTotal: 500, image: "" },
  ],
};

describe("OrderCard Component", () => {
  let alertSpy;
  let openSpy;
  let reloadSpy;

  beforeEach(() => {
    axios.post.mockReset();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    openSpy = jest.spyOn(window, "open").mockImplementation(() => {});
    reloadSpy = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
    openSpy.mockRestore();
  });

  test("renders collapsed by default with summary info", () => {
    render(<OrderCard order={baseOrder} />);
    expect(screen.getByText(/widget, gadget/i)).toBeInTheDocument();
    expect(screen.getAllByText("₹1,500").length).toBeGreaterThan(0);
    expect(screen.queryByText(/delivery address/i)).not.toBeInTheDocument();
  });

  test("expands to show details when the header is clicked", () => {
    render(<OrderCard order={baseOrder} />);
    fireEvent.click(screen.getByText(/widget, gadget/i));
    expect(screen.getByText(/delivery address/i)).toBeInTheDocument();
    expect(screen.getByText("42 Test Lane, Pune")).toBeInTheDocument();
  });

  test("renders expanded immediately when defaultOpen is true", () => {
    render(<OrderCard order={baseOrder} defaultOpen />);
    expect(screen.getByText(/delivery address/i)).toBeInTheDocument();
  });

  test("shows the cancel button only for cancellable stages", () => {
    const { rerender } = render(<OrderCard order={{ ...baseOrder, stage: "PLACED" }} defaultOpen />);
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument();

    rerender(<OrderCard order={{ ...baseOrder, stage: "DELIVERED" }} defaultOpen />);
    expect(screen.queryByRole("button", { name: /cancel order/i })).not.toBeInTheDocument();
  });

  test("shows the request return button only when delivered and no return in progress", () => {
    render(<OrderCard order={{ ...baseOrder, stage: "DELIVERED" }} defaultOpen />);
    expect(screen.getByRole("button", { name: /request return/i })).toBeInTheDocument();
  });

  test("shows the existing return status instead of the request button when a return is already active", () => {
    render(
      <OrderCard
        order={{ ...baseOrder, stage: "DELIVERED", returnStatus: "PENDING" }}
        defaultOpen
      />
    );
    expect(screen.queryByRole("button", { name: /request return/i })).not.toBeInTheDocument();
    expect(screen.getByText(/return: pending/i)).toBeInTheDocument();
  });

  test("opens invoice download in a new tab with the order id", () => {
    render(<OrderCard order={baseOrder} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: /download invoice/i }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining(`/api/orders/${baseOrder._id}/invoice`),
      "_blank"
    );
  });

  test("disables the return submit button until a reason of at least 3 characters is entered", () => {
    render(<OrderCard order={{ ...baseOrder, stage: "DELIVERED" }} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: /request return/i }));

    const submitBtn = screen.getByRole("button", { name: /submit return/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/explain the issue/i), { target: { value: "Broken item" } });
    expect(submitBtn).not.toBeDisabled();
  });

  test("submits a return request and reloads the page on success", async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    render(<OrderCard order={{ ...baseOrder, stage: "DELIVERED" }} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: /request return/i }));

    fireEvent.change(screen.getByPlaceholderText(/explain the issue/i), { target: { value: "Item arrived damaged" } });
    fireEvent.click(screen.getByLabelText(/replacement/i));
    fireEvent.click(screen.getByRole("button", { name: /submit return/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`/api/orders/${baseOrder._id}/return`, {
        reason: "Item arrived damaged",
        returnType: "REPLACEMENT",
        refundMethod: "ORIGINAL",
      });
    });
    await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
  });

  test("shows an alert when the return request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("network error"));
    render(<OrderCard order={{ ...baseOrder, stage: "DELIVERED" }} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: /request return/i }));
    fireEvent.change(screen.getByPlaceholderText(/explain the issue/i), { target: { value: "Item is faulty" } });
    fireEvent.click(screen.getByRole("button", { name: /submit return/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Return request failed.");
    });
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  test("submits a cancel request with the selected refund method", async () => {
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    render(<OrderCard order={{ ...baseOrder, stage: "PLACED" }} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: /cancel order/i }));

    fireEvent.change(screen.getByPlaceholderText(/why do you wish to cancel/i), {
      target: { value: "Changed my mind" },
    });
    fireEvent.click(screen.getByLabelText(/vkart wallet/i));
    fireEvent.click(screen.getByRole("button", { name: /confirm cancel/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`/api/orders/${baseOrder._id}/cancel`, {
        reason: "Changed my mind",
        refundMethod: "WALLET",
      });
    });
    await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
  });

  test("shows an alert when the cancel request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("network error"));
    render(<OrderCard order={{ ...baseOrder, stage: "PLACED" }} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: /cancel order/i }));
    fireEvent.change(screen.getByPlaceholderText(/why do you wish to cancel/i), {
      target: { value: "No longer needed" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm cancel/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Cancellation failed.");
    });
  });
});
