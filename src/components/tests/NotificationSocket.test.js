import { vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import NotificationSocket from "../NotificationSocket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { showToast } from "../../utils/toast";

vi.mock("../../utils/toast", () => ({ showToast: vi.fn() }));

const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};
const mockIo = vi.fn(() => mockSocket);
vi.mock("socket.io-client", () => ({ io: (...args) => mockIo(...args) }));

describe("NotificationSocket Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSocket = ({ isAuthenticated = false, user = null } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user }) => state,
      },
    });
    const queryClient = new QueryClient();
    return {
      queryClient,
      ...render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <NotificationSocket />
          </Provider>
        </QueryClientProvider>
      ),
    };
  };

  test("does not open a socket connection when the user is not authenticated", () => {
    renderSocket({ isAuthenticated: false, user: null });
    expect(mockIo).not.toHaveBeenCalled();
  });

  test("opens a socket connection and joins the user's room when authenticated", () => {
    renderSocket({ isAuthenticated: true, user: { _id: "user1" } });
    expect(mockIo).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ path: "/socket.io", withCredentials: true })
    );

    const connectHandler = mockSocket.on.mock.calls.find(([event]) => event === "connect")[1];
    connectHandler();
    expect(mockSocket.emit).toHaveBeenCalledWith("join_user", "user1");
  });

  test("adds the notification to the cached list and shows a toast on user_notification events", () => {
    const { queryClient } = renderSocket({ isAuthenticated: true, user: { _id: "user1" } });

    const notifHandler = mockSocket.on.mock.calls.find(([event]) => event === "user_notification")[1];
    notifHandler({ status: "SHIPPED", message: "Your order has shipped", title: "Order Shipped!" });

    expect(queryClient.getQueryData(["profile", "notifications"]).notifications).toHaveLength(1);
    expect(queryClient.getQueryData(["profile", "notifications"]).unreadCount).toBe(1);
    expect(showToast).toHaveBeenCalledWith("[Shipped] Your order has shipped", "success");
  });

  test("falls back to a generic alert label for an unrecognized status", () => {
    renderSocket({ isAuthenticated: true, user: { _id: "user1" } });
    const notifHandler = mockSocket.on.mock.calls.find(([event]) => event === "user_notification")[1];
    notifHandler({ status: "SOME_UNKNOWN_STATUS", message: "Something happened" });

    expect(showToast).toHaveBeenCalledWith("[Alert] Something happened", "success");
  });

  test("disconnects the socket and clears notifications when the user logs out", () => {
    const queryClient = new QueryClient();
    const storeFor = (isAuthenticated) =>
      configureStore({
        reducer: {
          auth: (state = { isAuthenticated, isAdmin: false, user: isAuthenticated ? { _id: "user1" } : null }) => state,
        },
      });
    const tree = (store) => (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <NotificationSocket />
        </Provider>
      </QueryClientProvider>
    );
    const { rerender } = render(tree(storeFor(true)));
    expect(mockIo).toHaveBeenCalledTimes(1);
    queryClient.setQueryData(["profile", "notifications"], { notifications: [{ _id: "n1", title: "x", isRead: false }], unreadCount: 1 });

    // Simulate logout by swapping in a store where auth is no longer authenticated.
    rerender(tree(storeFor(false)));

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(queryClient.getQueryData(["profile", "notifications"])).toBeUndefined();
  });

  test("disconnects the socket on unmount", () => {
    const { unmount } = renderSocket({ isAuthenticated: true, user: { _id: "user1" } });
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
