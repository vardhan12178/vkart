import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import AdminLogin from "../admin/AdminLogin";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
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

describe("AdminLogin Component", () => {
  const renderAdminLogin = (setIsAdmin = jest.fn()) =>
    render(
      <HelmetProvider>
        <BrowserRouter>
          <AdminLogin setIsAdmin={setIsAdmin} />
        </BrowserRouter>
      </HelmetProvider>
    );

  beforeEach(() => {
    mockNavigate.mockClear();
    axios.post.mockClear();
  });

  test("renders admin id and password fields", () => {
    renderAdminLogin();
    expect(screen.getByPlaceholderText("admin@vkart.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /access dashboard/i })).toBeInTheDocument();
  });

  test("shows validation errors and blocks submit when fields are empty", async () => {
    renderAdminLogin();
    fireEvent.click(screen.getByRole("button", { name: /access dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText(/admin id is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("logs in and navigates to the dashboard on a successful response with a token", async () => {
    const setIsAdmin = jest.fn();
    axios.post.mockResolvedValueOnce({ data: { token: "admin-jwt" } });

    renderAdminLogin(setIsAdmin);
    fireEvent.change(screen.getByPlaceholderText("admin@vkart.com"), {
      target: { value: "admin@vkart.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "adminpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /access dashboard/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/admin/login",
        { username: "admin@vkart.com", password: "adminpass123" },
        expect.any(Object)
      );
    });
    await waitFor(() => expect(setIsAdmin).toHaveBeenCalledWith(true));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });

  test("shows an error and does not navigate when the response has no token", async () => {
    const setIsAdmin = jest.fn();
    axios.post.mockResolvedValueOnce({ data: {} });

    renderAdminLogin(setIsAdmin);
    fireEvent.change(screen.getByPlaceholderText("admin@vkart.com"), {
      target: { value: "admin@vkart.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "adminpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /access dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid admin credentials/i)).toBeInTheDocument();
    });
    expect(setIsAdmin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows the server error message when login is rejected", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Account locked" } },
    });

    renderAdminLogin();
    fireEvent.change(screen.getByPlaceholderText("admin@vkart.com"), {
      target: { value: "admin@vkart.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /access dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText("Account locked")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("toggles password visibility", () => {
    const { container } = renderAdminLogin();
    expect(screen.getByPlaceholderText("••••••••••••")).toHaveAttribute("type", "password");

    const toggleBtn = container.querySelector('button[type="button"]');
    fireEvent.click(toggleBtn);
    // React swaps the <input> node when its `type` changes, so re-query
    // rather than reuse the earlier (now-detached) element reference.
    expect(screen.getByPlaceholderText("••••••••••••")).toHaveAttribute("type", "text");
  });
});
