import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import NotificationBell from "../NotificationBell";
import axios from "../axiosInstance";
import notificationReducer from "../../redux/notificationSlice";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const strip = (props) => {
    const { initial, animate, exit, variants, transition, whileHover, whileTap, custom, ...rest } = props;
    return rest;
  };
  return {
    motion: new Proxy(
      {},
      { get: (_t, tag) => ({ children, ...props }) => mockReact.createElement(tag, strip(props), children) }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const NOTIF_UNREAD = { _id: "n1", title: "Order Shipped!", message: "Your order is on the way", type: "order", orderId: "o1", isRead: false, createdAt: new Date().toISOString() };
const NOTIF_READ = { _id: "n2", title: "Welcome", message: "Thanks for joining", type: "info", isRead: true, createdAt: new Date().toISOString() };

describe("NotificationBell Component", () => {
  const renderBell = ({ isAuthenticated = true } = {}) => {
    const store = configureStore({
      reducer: {
        auth: (state = { isAuthenticated, isAdmin: false, user: null }) => state,
        notifications: notificationReducer,
      },
    });
    return {
      store,
      ...render(
        <Provider store={store}>
          <BrowserRouter>
            <NotificationBell />
          </BrowserRouter>
        </Provider>
      ),
    };
  };

  beforeEach(() => {
    axios.get.mockReset();
    axios.put.mockReset();
    mockNavigate.mockClear();
  });

  test("renders nothing when the user is not authenticated", () => {
    axios.get.mockResolvedValue({ data: { success: true, notifications: [], unreadCount: 0 } });
    const { container } = renderBell({ isAuthenticated: false });
    expect(container).toBeEmptyDOMElement();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("fetches notifications on mount and shows the unread badge", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, notifications: [NOTIF_UNREAD, NOTIF_READ], unreadCount: 1 },
    });
    const { container } = renderBell();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/user/notifications",
        expect.objectContaining({ __skipAuthRedirect: true })
      );
    });
    await waitFor(() => {
      expect(container.querySelector(".bg-\\[\\#a85d37\\]")).toBeInTheDocument();
    });
  });

  test("opens the dropdown and lists notifications", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, notifications: [NOTIF_UNREAD, NOTIF_READ], unreadCount: 1 },
    });
    renderBell();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText("Notifications"));

    expect(screen.getByText("Order Shipped")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText(/you have 1 new updates/i)).toBeInTheDocument();
  });

  test("shows the empty state when there are no notifications", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, notifications: [], unreadCount: 0 } });
    renderBell();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();
  });

  test("marks a notification as read and navigates to its order on click", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, notifications: [NOTIF_UNREAD], unreadCount: 1 },
    });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    const { store } = renderBell();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(screen.getByText("Order Shipped"));

    expect(store.getState().notifications.notifications[0].isRead).toBe(true);
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/user/notifications/read",
        { ids: ["n1"] },
        expect.objectContaining({ __skipAuthRedirect: true })
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/orders?order=o1");
  });

  test("marks all notifications as read", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, notifications: [NOTIF_UNREAD], unreadCount: 1 },
    });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    const { store } = renderBell();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(screen.getByRole("button", { name: /mark all read/i }));

    expect(store.getState().notifications.unreadCount).toBe(0);
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/user/notifications/read",
        { all: true },
        expect.objectContaining({ __skipAuthRedirect: true })
      );
    });
  });

  test('navigates to "View All Orders" and closes the dropdown', async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, notifications: [NOTIF_READ], unreadCount: 0 },
    });
    renderBell();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(screen.getByRole("button", { name: /view all orders/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/orders");
    expect(screen.queryByText(/recent updates/i)).not.toBeInTheDocument();
  });

  test("closes the dropdown when clicking outside", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, notifications: [], unreadCount: 0 } });
    renderBell();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/no notifications yet/i)).not.toBeInTheDocument();
  });
});
