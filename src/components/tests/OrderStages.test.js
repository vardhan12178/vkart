import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrderStages from "../OrderStages";

describe("OrderStages Component", () => {
  test("renders all seven stage labels in order", () => {
    render(<OrderStages currentStage="PLACED" />);
    const labels = [
      "Order Placed",
      "Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
    labels.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  test("shows the cancelled banner instead of the timeline when the order is cancelled", () => {
    render(<OrderStages currentStage="CANCELLED" />);
    expect(screen.getByText(/order cancelled/i)).toBeInTheDocument();
    expect(screen.queryByText("Order Placed")).not.toBeInTheDocument();
  });

  test("shows a date for completed and current stages but not for pending ones", () => {
    render(
      <OrderStages
        currentStage="PROCESSING"
        createdAt="2024-01-01T00:00:00.000Z"
        statusHistory={[
          { stage: "PLACED", date: "2024-01-01T00:00:00.000Z" },
          { stage: "CONFIRMED", date: "2024-01-02T00:00:00.000Z" },
          { stage: "PROCESSING", date: "2024-01-03T00:00:00.000Z" },
        ]}
      />
    );

    // Completed/current stages have a formatted date rendered.
    expect(screen.getByText(/Jan 1/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 2/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 3/)).toBeInTheDocument();
    // Pending stage (Shipped) has no date entry associated with it.
    expect(screen.queryByText(/Jan 4/)).not.toBeInTheDocument();
  });

  test("falls back to createdAt for the PLACED stage when statusHistory omits it", () => {
    render(<OrderStages currentStage="PLACED" createdAt="2024-05-10T00:00:00.000Z" statusHistory={[]} />);
    expect(screen.getByText(/May 10/)).toBeInTheDocument();
  });

  test("defaults to the PLACED stage when currentStage is not provided", () => {
    render(<OrderStages />);
    expect(screen.getByText("Order Placed")).toBeInTheDocument();
  });
});
