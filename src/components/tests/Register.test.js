import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";
import Register from "../Register";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: (props) => (
    <button type="button" onClick={() => props?.onSuccess?.({ credential: "mock-token" })}>
      Sign up with Google
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

describe("Register Component", () => {
  const renderRegister = () =>
    render(
      <HelmetProvider>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </HelmetProvider>
    );

  const fillValidForm = () => {
    fireEvent.change(screen.getByPlaceholderText("Enter your name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("your.username"), {
      target: { value: "test.user" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create password"), {
      target: { value: "GoodPass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
      target: { value: "GoodPass123!" },
    });
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    axios.post.mockClear();
  });

  test("renders all registration fields", () => {
    renderRegister();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your.username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repeat password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  test("shows validation errors for all required fields on empty submit", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeInTheDocument();
      expect(screen.getByText("Username is required.")).toBeInTheDocument();
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
      expect(screen.getByText(/confirm your password/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("rejects an invalid username format", async () => {
    renderRegister();
    fillValidForm();
    fireEvent.change(screen.getByPlaceholderText("your.username"), {
      target: { value: "a" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/3-64 chars, alphanumeric/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("rejects an invalid email format", async () => {
    renderRegister();
    fillValidForm();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("rejects a password shorter than 8 characters", async () => {
    renderRegister();
    fillValidForm();
    fireEvent.change(screen.getByPlaceholderText("Create password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/min 8 characters required/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("rejects mismatched confirm password", async () => {
    renderRegister();
    fillValidForm();
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
      target: { value: "Different123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("submits a valid form as multipart FormData and navigates to login", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

    renderRegister();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/register",
        expect.any(FormData),
        expect.objectContaining({
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    });

    const sentForm = axios.post.mock.calls[0][1];
    expect(sentForm.get("name")).toBe("Test User");
    expect(sentForm.get("username")).toBe("test.user");
    expect(sentForm.get("email")).toBe("test@example.com");
    expect(sentForm.get("password")).toBe("GoodPass123!");

    expect(await screen.findByText(/account created/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      },
      { timeout: 3000 }
    );
  });

  test("shows server error message when registration fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Username already taken" } },
    });

    renderRegister();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Username already taken")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("registers via Google and navigates home", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /sign up with google/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/auth/google",
        expect.objectContaining({ idToken: "mock-token" }),
        expect.any(Object)
      );
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("shows error when Google sign-up fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Google sign-up failed." } },
    });

    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /sign up with google/i }));

    await waitFor(() => {
      expect(screen.getByText("Google sign-up failed.")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
