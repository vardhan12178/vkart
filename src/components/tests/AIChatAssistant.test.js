import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import AIChatAssistant from "../AIChatAssistant";
import axios from "../axiosInstance";
import uiReducer, { openChat } from "../../redux/uiSlice";
import cartReducer from "../../redux/cartSlice";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const stripMotionProps = (props) => {
    const { initial, animate, exit, variants, transition, whileHover, whileTap, whileInView, viewport, custom, ...validProps } = props;
    return validProps;
  };
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tagName) => ({ children, ...props }) =>
          mockReact.createElement(tagName, stripMotionProps(props), children),
      }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe("AIChatAssistant Component", () => {
  let store;

  beforeAll(() => {
    // jsdom doesn't implement scrollIntoView; the component auto-scrolls
    // the message list on open and after each new message.
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    axios.post.mockReset();
    showToast.mockClear();
    sessionStorage.clear();
    store = configureStore({
      reducer: { ui: uiReducer, cart: cartReducer },
    });
  });

  const renderAssistant = (openOnMount = true, initialPath = "/") => {
    if (openOnMount) store.dispatch(openChat());
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialPath]}>
          <AIChatAssistant />
        </MemoryRouter>
      </Provider>
    );
  };

  test("shows the floating launcher when closed, and opens the panel on click", () => {
    renderAssistant(false);
    const launcher = screen.getByRole("button", { name: /ask vkart assistant/i });
    expect(launcher).toBeInTheDocument();

    fireEvent.click(launcher);
    expect(store.getState().ui.isChatOpen).toBe(true);
  });

  test("renders the chat panel with an initial greeting when open", () => {
    renderAssistant();
    expect(screen.getByRole("dialog", { name: /ask vkart product concierge/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask anything about products/i)).toBeInTheDocument();
  });

  test("closes the panel via the header close button", () => {
    renderAssistant();
    fireEvent.click(screen.getByRole("button", { name: /close product concierge/i }));
    expect(store.getState().ui.isChatOpen).toBe(false);
  });

  test("disables sending while the input is empty", () => {
    renderAssistant();
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  test("sends a message and renders the mocked API response", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        structured: {
          response: { summary: "TEST_FIXTURE_RESPONSE_TEXT", points: [] },
        },
        products: [],
      },
    });
    renderAssistant();

    const input = screen.getByPlaceholderText(/ask anything about products/i);
    fireEvent.change(input, { target: { value: "Best gaming phone" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/ai/chat",
        expect.objectContaining({ message: "Best gaming phone" })
      );
    });
    expect(await screen.findByText("TEST_FIXTURE_RESPONSE_TEXT")).toBeInTheDocument();
    // Input is cleared after sending; re-query since the placeholder swap
    // (cooldown text) replaces the DOM node rather than mutating it in place.
    expect(screen.getByPlaceholderText(/ask anything about products|wait \d/i)).toHaveValue("");
  });

  test("clears the input immediately and shows a loading indicator while waiting", async () => {
    let resolveRequest;
    axios.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), {
      target: { value: "Best laptop" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/thinking/i)).toBeInTheDocument();

    resolveRequest({ data: { structured: { response: { summary: "done", points: [] } }, products: [] } });
    await waitFor(() => {
      expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
    });
  });

  test("shows a fallback message when the API request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("network down"));
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), {
      target: { value: "Best headphones" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/having a little trouble connecting/i)).toBeInTheDocument();
  });

  test("clicking a recommended product navigates to its page and closes the chat", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        structured: { response: { summary: "Here you go", points: [] } },
        products: [{ _id: "prod1", title: "Gaming Phone X", price: 25000, thumbnail: "x.png", stock: 3 }],
      },
    });
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), {
      target: { value: "gaming phone" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Gaming Phone X")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Gaming Phone X"));

    expect(store.getState().ui.isChatOpen).toBe(false);
  });

  test("adds a recommended product to the cart without navigating", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        structured: { response: { summary: "Here you go", points: [] } },
        products: [{ _id: "prod1", title: "Gaming Phone X", price: 25000, thumbnail: "x.png", stock: 3 }],
      },
    });
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), {
      target: { value: "gaming phone" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await screen.findByText("Gaming Phone X");

    fireEvent.click(screen.getByRole("button", { name: /add gaming phone x to bag/i }));

    expect(store.getState().cart).toHaveLength(1);
    expect(store.getState().ui.isChatOpen).toBe(true); // did not close/navigate
    expect(showToast).toHaveBeenCalledWith("Added to cart", "success");
  });

  test("hides the floating launcher on the cart and checkout pages", () => {
    renderAssistant(false, "/cart");
    expect(screen.queryByRole("button", { name: /ask vkart assistant/i })).not.toBeInTheDocument();
  });
});
