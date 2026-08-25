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
import authReducer from "../../redux/authSlice";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
let mockSearch = "";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: mockSearch, pathname: "/login" }),
}));

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

  const renderLogin = () =>
    render(
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

  beforeEach(() => {
    mockSearch = "";
    mockNavigate.mockClear();
    store = configureStore({ reducer: { auth: authReducer } });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    axios.post.mockClear();
  });

  test("renders email and password fields with sign-in button", () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("shows client-side validation errors and blocks submit when fields are empty", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("submits login credentials to /api/login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: { id: "123", name: "Test User", role: "customer" },
        token: "fake-jwt-token",
      },
    });

    const { container } = renderLogin();

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

  test("dispatches loginSuccess and navigates home on successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: { user: { id: "123", name: "Test User" } },
    });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
    expect(store.getState().auth.user).toEqual({ id: "123", name: "Test User" });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to redirect query param target after login", async () => {
    mockSearch = "?redirect=%2Fcheckout";
    axios.post.mockResolvedValueOnce({
      data: { user: { id: "123", name: "Test User" } },
    });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/checkout");
    });
  });

  test("shows server error message on failed login and does not authenticate", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid username or password" } },
    });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
    });
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  test("shows fallback error message when response has no user session", async () => {
    // Backend responds 200 but without a usable user session -> client must not silently log in
    axios.post.mockResolvedValueOnce({ data: {} });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  test("opens 2FA modal when server requests it, then verifies code and logs in", async () => {
    axios.post.mockResolvedValueOnce({ data: { require2FA: true } });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/two-step verification/i)).toBeInTheDocument();

    axios.post.mockResolvedValueOnce({
      data: { user: { id: "123", name: "Test User" } },
    });
    fireEvent.change(screen.getByPlaceholderText("000 000"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenLastCalledWith(
        "/api/login",
        expect.objectContaining({ token2fa: "123456" }),
        expect.any(Object)
      );
    });
    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("shows error and keeps modal open when 2FA code is rejected", async () => {
    axios.post.mockResolvedValueOnce({ data: { require2FA: true } });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/two-step verification/i)).toBeInTheDocument();

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid or expired code" } },
    });
    fireEvent.change(screen.getByPlaceholderText("000 000"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid or expired code")).toBeInTheDocument();
    });
    expect(screen.getByText(/two-step verification/i)).toBeInTheDocument();
  });

  test("rejects 2FA submission when code is fewer than 6 digits without calling the API", async () => {
    axios.post.mockResolvedValueOnce({ data: { require2FA: true } });

    const { container } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/two-step verification/i)).toBeInTheDocument();

    axios.post.mockClear();
    fireEvent.change(screen.getByPlaceholderText("000 000"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByText(/enter the 6-digit code/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("logs in via Google and navigates", async () => {
    axios.post.mockResolvedValueOnce({
      data: { user: { id: "g1", name: "Google User" } },
    });

    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/auth/google",
        expect.objectContaining({ idToken: "mock-token" }),
        expect.any(Object)
      );
    });
    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("shows error message when Google login fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Google account not linked" } },
    });

    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(screen.getByText("Google account not linked")).toBeInTheDocument();
    });
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
