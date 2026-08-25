import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import VerifyEmail from "../VerifyEmail";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

let mockSearch = "?token=abc123";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({ search: mockSearch, pathname: "/verify-email" }),
}));

describe("VerifyEmail Component", () => {
  const renderVerify = () =>
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

  beforeEach(() => {
    mockSearch = "?token=abc123";
    axios.get.mockReset();
  });

  test("shows verifying state while the request is pending", () => {
    axios.get.mockReturnValue(new Promise(() => {})); // never resolves
    renderVerify();
    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
  });

  test("calls the verify-email endpoint with the token and shows success", async () => {
    axios.get.mockResolvedValueOnce({ data: { message: "Email verified successfully." } });

    renderVerify();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/verify-email?token=abc123");
    });
    expect(await screen.findByText("Email verified successfully.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute("href", "/login");
  });

  test("shows an error message without calling the API when the token is missing", async () => {
    mockSearch = "";
    renderVerify();

    expect(await screen.findByText(/missing verification token/i)).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /go to login/i })).toBeInTheDocument();
  });

  test("shows server error message when verification fails", async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { message: "Verification link expired" } },
    });

    renderVerify();

    expect(await screen.findByText("Verification link expired")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to login/i })).toBeInTheDocument();
  });

  test("shows generic failure message when server sends no message", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));

    renderVerify();

    expect(await screen.findByText("Verification failed.")).toBeInTheDocument();
  });
});
