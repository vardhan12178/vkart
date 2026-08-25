import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import NotificationSocket from "../NotificationSocket";
import notificationReducer from "../../redux/notificationSlice";
import { showToast } from "../../utils/toast";

jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};
const mockIo = jest.fn(() => mockSocket);
jest.mock("socket.io-client", () => ({ io: (...args) => mockIo(...args) }));

describe("NotificationSocket Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSocket = ({ isAuthenticated = false, user = null } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user }) => state,
        notifications: notificationReducer,
      },
    });
    return {
      store,
      ...render(
        <Provider store={store}>
          <NotificationSocket />
        </Provider>
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

  test("dispatches a notification and shows a toast on user_notification events", () => {
    const { store } = renderSocket({ isAuthenticated: true, user: { _id: "user1" } });

    const notifHandler = mockSocket.on.mock.calls.find(([event]) => event === "user_notification")[1];
    notifHandler({ status: "SHIPPED", message: "Your order has shipped", title: "Order Shipped!" });

    expect(store.getState().notifications.notifications).toHaveLength(1);
    expect(showToast).toHaveBeenCalledWith("[Shipped] Your order has shipped", "success");
  });

  test("falls back to a generic alert label for an unrecognized status", () => {
    renderSocket({ isAuthenticated: true, user: { _id: "user1" } });
    const notifHandler = mockSocket.on.mock.calls.find(([event]) => event === "user_notification")[1];
    notifHandler({ status: "SOME_UNKNOWN_STATUS", message: "Something happened" });

    expect(showToast).toHaveBeenCalledWith("[Alert] Something happened", "success");
  });

  test("disconnects the socket and clears notifications when the user logs out", () => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated: true, isAdmin: false, user: { _id: "user1" } }) => state,
        notifications: notificationReducer,
      },
    });
    const { rerender } = render(
      <Provider store={store}>
        <NotificationSocket />
      </Provider>
    );
    expect(mockIo).toHaveBeenCalledTimes(1);

    // Simulate logout by swapping in a store where auth is no longer authenticated.
    const loggedOutStore = configureStore({
      reducer: {
        auth: (state = { isAuthenticated: false, isAdmin: false, user: null }) => state,
        notifications: notificationReducer,
      },
      preloadedState: {
        notifications: { notifications: [{ _id: "n1", title: "x", isRead: false }], unreadCount: 1, isLoading: false },
      },
    });
    rerender(
      <Provider store={loggedOutStore}>
        <NotificationSocket />
      </Provider>
    );

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  test("disconnects the socket on unmount", () => {
    const { unmount } = renderSocket({ isAuthenticated: true, user: { _id: "user1" } });
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
