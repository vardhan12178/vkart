import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Profile from "../Profile";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const USER = { name: "Jane Doe", email: "jane@example.com", username: "janedoe" };
const ADDRESS = {
  _id: "addr1",
  fullName: "Jane Doe",
  phone: "9876543210",
  address1: "123 Main St",
  city: "Pune",
  state: "MH",
  pincode: "411001",
  isDefault: true,
};

describe("Profile Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    mockNavigate.mockClear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const mockProfileEndpoints = ({ addresses = [], wallet = { balance: 0, transactions: [] }, orders = [] } = {}) => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/profile") return Promise.resolve({ data: USER });
      if (url === "/api/profile/orders") return Promise.resolve({ data: orders });
      if (url === "/api/wallet") return Promise.resolve({ data: wallet });
      if (url === "/api/profile/addresses") return Promise.resolve({ data: { addresses } });
      return Promise.resolve({ data: {} });
    });
  };

  // "Jane Doe" appears in more than one place once addresses/orders render
  // (the page header name, the Personal Details card, and any address
  // card's fullName), so wait on the unique <h1> display-name heading.
  const findDisplayName = () => screen.findByRole("heading", { name: "Jane Doe" });

  const renderProfile = () => {
    const store = configureStore({
      reducer: { auth: (state = { isAuthenticated: true, isAdmin: false, user: USER }) => state },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <Profile />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );
  };

  test("renders profile details once loaded", async () => {
    mockProfileEndpoints({ orders: [{ _id: "o1", createdAt: "2024-01-01" }] });
    renderProfile();
    expect(await findDisplayName()).toBeInTheDocument();
    expect(screen.getAllByText("jane@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText(/orders placed/i).previousElementSibling).toHaveTextContent("1");
  });

  test("edits the display name", async () => {
    mockProfileEndpoints();
    axios.put.mockResolvedValueOnce({ data: { name: "Jane Updated" } });
    renderProfile();
    await findDisplayName();

    fireEvent.click(await findDisplayName());
    const nameInput = screen.getByDisplayValue("Jane Doe");
    fireEvent.change(nameInput, { target: { value: "Jane Updated" } });
    fireEvent.keyDown(nameInput, { key: "Enter" });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/profile/name", { name: "Jane Updated" });
    });
  });

  test("shows the empty address state and adds a new address", async () => {
    mockProfileEndpoints({ addresses: [] });
    axios.post.mockResolvedValueOnce({ data: { addresses: [ADDRESS] } });
    renderProfile();
    await findDisplayName();

    expect(screen.getByText(/no saved addresses yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/\+ add address/i));

    // "Full Name"/"City" etc. also label the read-only Personal Details
    // card, so scope these lookups to <label> elements (the address form's
    // field labels), not the card's <p> summary labels.
    const addrLabel = (text) =>
      screen.getByText((content, el) => el.tagName === "LABEL" && content === text);

    fireEvent.change(addrLabel("Full Name").nextElementSibling, { target: { value: "Jane Doe" } });
    fireEvent.change(addrLabel("Phone").nextElementSibling, { target: { value: "9876543210" } });
    fireEvent.change(addrLabel("Address Line 1").nextElementSibling, { target: { value: "123 Main St" } });
    fireEvent.change(addrLabel("City").nextElementSibling, { target: { value: "Pune" } });
    fireEvent.change(addrLabel("State").nextElementSibling, { target: { value: "MH" } });
    fireEvent.change(addrLabel("Pincode").nextElementSibling, { target: { value: "411001" } });

    fireEvent.click(screen.getByRole("button", { name: /^save address$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/profile/addresses",
        expect.objectContaining({ fullName: "Jane Doe", city: "Pune" })
      );
    });
    expect(await screen.findByText(/address added/i)).toBeInTheDocument();
  });

  test("blocks saving an address with missing required fields", async () => {
    mockProfileEndpoints({ addresses: [] });
    renderProfile();
    await findDisplayName();

    fireEvent.click(screen.getByText(/\+ add address/i));
    fireEvent.click(screen.getByRole("button", { name: /^save address$/i }));

    expect(await screen.findByText(/please fill all required fields/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("edits and deletes an existing address", async () => {
    mockProfileEndpoints({ addresses: [ADDRESS] });
    axios.delete.mockResolvedValueOnce({ data: { addresses: [] } });
    renderProfile();
    await findDisplayName();

    // The saved address card shows the name/city text.
    expect(screen.getByText("123 Main St")).toBeInTheDocument();

    // Delete it.
    const deleteBtn = screen
      .getAllByRole("button")
      .find((b) => b.querySelector("svg") && b.className.includes("hover:text-red-600"));
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/profile/addresses/addr1");
    });
    expect(await screen.findByText(/address removed/i)).toBeInTheDocument();
  });

  test("changes the password with validation", async () => {
    mockProfileEndpoints();
    renderProfile();
    await findDisplayName();

    fireEvent.click(screen.getByRole("button", { name: /^change$/i }));
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "oldpass123" } });
    fireEvent.change(screen.getByPlaceholderText(/min 8 characters/i), { target: { value: "short" } });
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();

    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    fireEvent.change(screen.getByPlaceholderText(/min 8 characters/i), { target: { value: "newpassword123" } });
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: "newpassword123" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/profile/password", {
        currentPassword: "oldpass123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      });
    });
    expect(await screen.findByText(/password changed successfully/i)).toBeInTheDocument();
  });

  test("shows the wallet balance and empty activity state", async () => {
    mockProfileEndpoints({ wallet: { balance: 250, transactions: [] } });
    renderProfile();
    await findDisplayName();
    expect(screen.getByText("₹250")).toBeInTheDocument();
    expect(screen.getByText(/no wallet activity yet/i)).toBeInTheDocument();
  });

  test("logs out and navigates home", async () => {
    mockProfileEndpoints();
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderProfile();
    await findDisplayName();

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/logout", {}, { withCredentials: true });
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
