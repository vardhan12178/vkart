import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Login";
import { BrowserRouter } from "react-router-dom";

// --- Mock the actual axiosInstance (NOT axios) ---
jest.mock("../axiosInstance", () => ({
  post: jest.fn(),
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
    div: (props) => <div {...props} />,
    span: (props) => <span {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// --- Tests ---
describe("Login Component", () => {
  it("renders fields and button", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText(/Enter your VKart ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
  });

  it("calls axiosInstance.post on form submit", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { token: "abc123" } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your VKart ID/i), {
      target: { value: "vardhan975" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your password/i), {
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
