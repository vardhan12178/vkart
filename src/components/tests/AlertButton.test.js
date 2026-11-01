import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import AlertButton from "../shop/AlertButton";
import axios from "../axiosInstance";
import authReducer from "../../redux/authSlice";
import { showToast } from "../../utils/toast";

jest.mock("../axiosInstance");
jest.mock("../../utils/toast", () => ({ showToast: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ ...jest.requireActual("react-router-dom"), useNavigate: () => mockNavigate }));

const renderButton = ({ signedIn = true, outOfStock = false } = {}) =>
  render(
    <Provider store={configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { isAuthenticated: signedIn, isAdmin: false, user: null } } })}>
      <MemoryRouter><AlertButton productId="p1" sku="A-128" outOfStock={outOfStock} /></MemoryRouter>
    </Provider>
  );

describe("AlertButton", () => {
  beforeEach(() => { [axios.get, axios.post, axios.delete].forEach((m) => m.mockReset()); showToast.mockClear(); mockNavigate.mockClear(); });

  test("sets and removes a price alert", async () => {
    axios.get.mockResolvedValue({ data: { alerts: [] } });
    axios.post.mockResolvedValue({ data: { _id: "al1", sku: "A-128", kind: "price" } });
    axios.delete.mockResolvedValue({ data: { ok: true } });
    renderButton();

    fireEvent.click(await screen.findByRole("button", { name: "Alert me if the price drops" }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/alerts", { productId: "p1", sku: "A-128", kind: "price" }));
    const on = await screen.findByRole("button", { name: /Price alert on/ });
    expect(on).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(on);
    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith("/api/alerts/al1"));
    expect(await screen.findByRole("button", { name: "Alert me if the price drops" })).toBeInTheDocument();
  });

  test("sold-out items offer a back-in-stock alert, remembered from the server", async () => {
    axios.get.mockResolvedValue({ data: { alerts: [{ _id: "al2", sku: "A-128", kind: "stock" }] } });
    renderButton({ outOfStock: true });
    expect(await screen.findByRole("button", { name: "We'll notify you when it's back" })).toBeInTheDocument();
  });

  test("guests are sent to sign in", () => {
    renderButton({ signedIn: false });
    fireEvent.click(screen.getByRole("button", { name: "Alert me if the price drops" }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(axios.get).not.toHaveBeenCalled();
  });
});
