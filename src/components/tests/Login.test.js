import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Login";
import { BrowserRouter } from "react-router-dom";

// --- Mock the actual axiosInstance (NOT axios) ---
jest.mock("../axiosInstance", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import axiosInstance from "../axiosInstance";

// --- Mocks for other libs ---
jest.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
  HelmetProvider: ({ children }) => <>{children}</>,
}));

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div data-testid="google-login">Google Login</div>,
  GoogleOAuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../redux/authSlice";
import uiReducer from "../../redux/uiSlice";
import cartReducer from "../../redux/cartSlice";

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    cart: cartReducer,
  },
});

// --- Tests ---
describe("Login Component", () => {
  it("renders fields and button", () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    // Use container query or placeholder for password
    // Password placeholder is 8 bullets: ••••••••
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("calls axiosInstance.post on form submit", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { token: "abc123" } });

    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
      target: { value: "vardhan975" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), {
      target: { value: "vardhan2181" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() =>
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/login",
        expect.objectContaining({
          username: "vardhan975",
          password: "vardhan2181",
          remember: true,
        }),
        expect.any(Object)
      )
    );
  });
});
