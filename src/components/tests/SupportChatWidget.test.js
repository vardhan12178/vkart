import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import SupportChatWidget from "../support/SupportChatWidget";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockSocket = { on: jest.fn(), emit: jest.fn(), disconnect: jest.fn() };
jest.mock("socket.io-client", () => ({ io: jest.fn(() => mockSocket) }));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const ORDER = {
  _id: "o1",
  orderId: "VK-1001",
  stage: "DELIVERED",
  products: [{ name: "Widget", image: "" }],
};

describe("SupportChatWidget Component", () => {
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  const renderWidget = (props = {}) =>
    render(
      <MemoryRouter>
        <SupportChatWidget open onClose={jest.fn()} {...props} />
      </MemoryRouter>
    );

  test("renders nothing when closed", () => {
    const { container } = render(
      <MemoryRouter>
        <SupportChatWidget open={false} onClose={jest.fn()} />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the main menu when open", () => {
    renderWidget();
    expect(screen.getByText(/how can we help you today/i)).toBeInTheDocument();
    expect(screen.getByText("Track my order")).toBeInTheDocument();
    expect(screen.getByText("Return or refund")).toBeInTheDocument();
  });

  test("closes when the backdrop or close button is clicked", () => {
    const onClose = jest.fn();
    const { container } = renderWidget({ onClose });
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole("button").find((b) => !b.textContent));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test("fetches and lists orders, then shows stage detail on selection", async () => {
    axios.get.mockResolvedValueOnce({ data: { items: [ORDER] } });
    renderWidget();

    fireEvent.click(screen.getByText("Track my order"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/profile/orders/paged", { params: { limit: 8 } });
    });
    expect(await screen.findByText("VK-1001")).toBeInTheDocument();

    fireEvent.click(screen.getByText("VK-1001"));
    expect(screen.getByText(/your order was delivered/i)).toBeInTheDocument();
  });

  test("shows an empty state when there are no orders", async () => {
    axios.get.mockResolvedValueOnce({ data: { items: [] } });
    renderWidget();
    fireEvent.click(screen.getByText("Track my order"));

    expect(await screen.findByText(/no orders found on your account/i)).toBeInTheDocument();
  });

  test("shows a return CTA for a delivered order under the return intent, and navigates on click", async () => {
    axios.get.mockResolvedValueOnce({ data: { items: [ORDER] } });
    const onClose = jest.fn();
    renderWidget({ onClose });

    fireEvent.click(screen.getByText("Return or refund"));
    await screen.findByText("VK-1001");
    fireEvent.click(screen.getByText("VK-1001"));

    fireEvent.click(screen.getByRole("button", { name: /go to orders to request return/i }));
    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/orders");
  });

  test("shows payment info without an API call", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Payment or billing"));
    expect(screen.getByText(/processed securely via razorpay/i)).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("shows a generic message for other inquiries", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Something else"));
    expect(screen.getByText(/let's connect you with our live support team/i)).toBeInTheDocument();
  });

  test("closes without escalating when the follow-up is answered positively", () => {
    const onClose = jest.fn();
    renderWidget({ onClose });
    fireEvent.click(screen.getByText("Something else"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, thanks/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test("escalates to a live agent chat and sends a message", async () => {
    axios.post.mockImplementation((url) => {
      if (url === "/api/support/conversations") {
        return Promise.resolve({
          data: { conversation: { _id: "conv1", messages: [] } },
        });
      }
      return Promise.resolve({ data: {} });
    });
    renderWidget();

    fireEvent.click(screen.getByText("Something else"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /not really/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, connect me/i }));

    expect(await screen.findByText(/you're connected to support/i)).toBeInTheDocument();

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(messageInput, {
      target: { value: "I need help with a defective item" },
    });
    // The send button sits right after the input and, like the header's
    // close button, has no accessible name — scope to its sibling instead.
    fireEvent.click(messageInput.nextElementSibling);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/support/conversations/conv1/messages", {
        text: "I need help with a defective item",
      });
    });
    expect(screen.getByText("I need help with a defective item")).toBeInTheDocument();
  });

  test("shows a retry-friendly message when the conversation fails to start", async () => {
    axios.post.mockRejectedValueOnce(new Error("network down"));
    renderWidget();

    fireEvent.click(screen.getByText("Something else"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /not really/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, connect me/i }));

    expect(await screen.findByText(/couldn't start a conversation/i)).toBeInTheDocument();
  });
});
