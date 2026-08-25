import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import OrderSuccess from "../OrderSuccess";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

jest.mock("react-confetti", () => (props) => (
  <div data-testid="confetti" data-pieces={props.numberOfPieces} />
));

jest.mock("react-use", () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

jest.mock("../support/SupportChatWidget", () => (props) =>
  props.open ? (
    <div data-testid="support-widget">
      Support open
      <button onClick={props.onClose}>Close support</button>
    </div>
  ) : null
);

const ORDER = {
  _id: "order-abc123456",
  orderId: "VK-1001",
  createdAt: "2024-03-01T10:00:00.000Z",
  totalPrice: 1200,
  stage: "PLACED",
  shippingAddress: "10 Main St, City",
  products: [{ name: "Widget", quantity: 2, price: 500, lineTotal: 1000 }],
};

describe("OrderSuccess Component", () => {
  const renderWithOrderId = (orderId = "order-abc123456") =>
    render(
      <MemoryRouter initialEntries={[`/order-success/${orderId}`]}>
        <Routes>
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    axios.get.mockReset();
  });

  test("shows a loading spinner while the order is being fetched", () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithOrderId();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("shows an error state when the order id is not found in the account's orders", async () => {
    axios.get.mockResolvedValueOnce({ data: [{ _id: "other-order" }] });
    renderWithOrderId();
    expect(await screen.findByText(/order details unavailable/i)).toBeInTheDocument();
  });

  test("shows an error state when the fetch itself fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderWithOrderId();
    expect(await screen.findByText(/order details unavailable/i)).toBeInTheDocument();
  });

  test("renders the confirmed order with items, address, and total", async () => {
    axios.get.mockResolvedValueOnce({ data: [ORDER] });
    renderWithOrderId();

    expect(await screen.findByText("VK-1001")).toBeInTheDocument();
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("10 Main St, City")).toBeInTheDocument();
    expect(screen.getByText("₹1,200")).toBeInTheDocument();
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  test("matches the order by razorpayOrderId when _id and orderId don't match the route param", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ ...ORDER, _id: "different-id", orderId: undefined, razorpayOrderId: "order-abc123456" }],
    });
    renderWithOrderId();
    expect(await screen.findByText("Widget")).toBeInTheDocument();
  });

  test("opens and closes the support chat widget", async () => {
    axios.get.mockResolvedValueOnce({ data: [ORDER] });
    renderWithOrderId();

    await screen.findByText("Widget");
    expect(screen.queryByTestId("support-widget")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/chat with support/i));
    expect(screen.getByTestId("support-widget")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close support"));
    expect(screen.queryByTestId("support-widget")).not.toBeInTheDocument();
  });
});
