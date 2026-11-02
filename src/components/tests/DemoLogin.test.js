import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "../axiosInstance";
import DemoLogin from "../DemoLogin";

jest.mock("../axiosInstance", () => ({ __esModule: true, default: { post: jest.fn() } }));

describe("DemoLogin", () => {
  beforeEach(() => axios.post.mockReset());

  test("calls the shopper demo endpoint and hands the session back", async () => {
    axios.post.mockResolvedValue({ data: { authenticated: true, user: { name: "Demo Shopper" } } });
    const onSignedIn = jest.fn();
    render(<DemoLogin kind="shopper" onSignedIn={onSignedIn} />);
    fireEvent.click(screen.getByRole("button", { name: /try the demo shopper/i }));
    await waitFor(() =>
      expect(onSignedIn).toHaveBeenCalledWith({
        authenticated: true,
        user: { name: "Demo Shopper" },
      })
    );
    expect(axios.post).toHaveBeenCalledWith(
      "/api/auth/demo/shopper",
      {},
      { withCredentials: true }
    );
  });

  test("admin variant uses the admin endpoint and says it is read-only", async () => {
    axios.post.mockResolvedValue({ data: { token: "t" } });
    render(<DemoLogin kind="admin" onSignedIn={() => {}} />);
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /explore the admin demo/i }));
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith("/api/auth/demo/admin", {}, { withCredentials: true })
    );
  });

  test("shows an error and lets the visitor retry", async () => {
    axios.post.mockRejectedValue({ response: { data: { message: "Demo logins are turned off" } } });
    render(<DemoLogin kind="shopper" onSignedIn={() => {}} />);
    fireEvent.click(screen.getByTestId("demo-shopper"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/turned off/i);
    expect(screen.getByTestId("demo-shopper")).not.toBeDisabled();
  });
});
