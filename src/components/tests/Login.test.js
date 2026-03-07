import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import Login from "../Login";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: (props) => (
    <button type="button" onClick={() => props?.onSuccess?.({ credential: "mock-token" })}>
      Continue with Google
    </button>
  ),
}));

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const stripMotionProps = (props) => {
    const {
      initial,
      animate,
      exit,
      variants,
      transition,
      whileHover,
      whileTap,
      custom,
      ...validProps
    } = props;
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

describe("Login Component", () => {
  let store;
  let queryClient;

  beforeAll(() => {
    Object.defineProperty(window, "scrollTo", {
      writable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: (
          state = { isAuthenticated: false, loading: false, error: null }
        ) => state,
      },
    });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    axios.post.mockClear();
  });

  test("submits login credentials to /api/login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: { id: "123", name: "Test User", role: "customer" },
        token: "fake-jwt-token",
      },
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <HelmetProvider>
            <BrowserRouter>
              <Login />
            </BrowserRouter>
          </HelmetProvider>
        </Provider>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/login",
        expect.objectContaining({
          username: "user@test.com",
          password: "password123",
          remember: true,
        }),
        expect.any(Object)
      );
    });
  });
});
