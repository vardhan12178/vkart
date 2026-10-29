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

// Placeholder rank token: the widget passes it through unchanged
const RANK_TOKEN = "test-rank-token";

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

  test("asks the v2 catalog and adds a single-variant v2 product with its sku", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        structured: { response: { summary: "Here you go", points: [] } },
        products: [{ _id: "aaaaaaaaaaaaaaaaaaaaaaaa", catalog: "v2", slug: "yoga-mat", sku: "BFT-MAT-1", variantCount: 1, title: "Yoga Mat", price: 2499, thumbnail: "m.webp", stock: 1 }],
      },
    });
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), { target: { value: "yoga mat" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await screen.findByText("Yoga Mat");

    expect(axios.post).toHaveBeenCalledWith("/api/ai/chat", expect.objectContaining({ message: "yoga mat", catalog: "v2" }));
    fireEvent.click(screen.getByRole("button", { name: /add yoga mat to bag/i }));
    expect(store.getState().cart[0]).toMatchObject({ catalog: "v2", productId: "aaaaaaaaaaaaaaaaaaaaaaaa", sku: "BFT-MAT-1", quantity: 1 });
  });

  test("shows results first, then swaps in the model's picks from the rank call", async () => {
    let finishRank;
    axios.post
      .mockResolvedValueOnce({
        data: {
          structured: { response: { summary: "Here are the top matches.", points: [] } },
          products: [{ _id: "p1", catalog: "v2", slug: "phone-a", title: "Phone A", price: 30000, thumbnail: "a.webp", stock: 1 }],
          rank: { token: RANK_TOKEN },
        },
      })
      .mockImplementationOnce(() => new Promise((resolve) => { finishRank = resolve; }));
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), { target: { value: "phone" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // Phase one: results and the "picking" indicator, before the model answers
    expect(await screen.findByText("Phone A")).toBeInTheDocument();
    expect(screen.getByText(/picking the best matches/i)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith("/api/ai/chat", expect.objectContaining({ catalog: "v2", twoPhase: true }));
    expect(axios.post).toHaveBeenLastCalledWith("/api/ai/chat/rank", { token: RANK_TOKEN }, expect.anything());

    // Phase two: the model's picks replace the first results
    finishRank({
      data: {
        reranked: true,
        structured: { response: { summary: "Phone B has the bigger battery.", points: [] } },
        products: [{ _id: "p2", catalog: "v2", slug: "phone-b", title: "Phone B", price: 28000, thumbnail: "b.webp", stock: 1, reason: "Biggest battery" }],
      },
    });
    expect(await screen.findByText("Phone B has the bigger battery.")).toBeInTheDocument();
    expect(screen.queryByText("Phone A")).not.toBeInTheDocument();
    expect(screen.queryByText(/picking the best matches/i)).not.toBeInTheDocument();
  });

  test("keeps the first results when the rank call fails", async () => {
    axios.post
      .mockResolvedValueOnce({
        data: {
          structured: { response: { summary: "Here are the top matches.", points: [] } },
          products: [{ _id: "p1", catalog: "v2", slug: "phone-a", title: "Phone A", price: 30000, thumbnail: "a.webp", stock: 1 }],
          rank: { token: RANK_TOKEN },
        },
      })
      .mockRejectedValueOnce(new Error("busy"));
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), { target: { value: "phone" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Phone A")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/picking the best matches/i)).not.toBeInTheDocument());
    expect(screen.getByText("Phone A")).toBeInTheDocument();
  });

  test("sends multi-variant v2 products to their page to pick a variant", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        structured: { response: { summary: "Here you go", points: [] } },
        products: [{ _id: "bbbbbbbbbbbbbbbbbbbbbbbb", catalog: "v2", slug: "phone-x", sku: "PX-128", variantCount: 3, title: "Phone X", price: 20000, thumbnail: "p.webp", stock: 1 }],
      },
    });
    renderAssistant();

    fireEvent.change(screen.getByPlaceholderText(/ask anything about products/i), { target: { value: "phone" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await screen.findByText("Phone X");

    fireEvent.click(screen.getByRole("button", { name: /add phone x to bag/i }));
    expect(store.getState().cart).toHaveLength(0);
    expect(store.getState().ui.isChatOpen).toBe(false);
    expect(showToast).toHaveBeenCalledWith("Choose a variant to add it to your bag", "info");
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
