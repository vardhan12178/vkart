import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminProfile from "../admin/AdminProfile";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ context }) {
  return <Outlet context={context} />;
}

const IDENTITY = {
  name: "Jordan Admin",
  email: "jordan@vkart.com",
  createdAt: "2023-01-15T00:00:00.000Z",
};

describe("AdminProfile Component", () => {
  let queryClient;
  let refreshProfile;

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "blob:mock-preview-url");
  });

  beforeEach(() => {
    axios.put.mockReset();
    refreshProfile = jest.fn();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderProfile = ({ adminRole = "product_manager", permissions = { products: "write" } } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/profile"]}>
          <Routes>
            <Route
              element={
                <TestLayout context={{ identity: IDENTITY, adminRole, permissions, refreshProfile }} />
              }
            >
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders identity info and role label", () => {
    renderProfile();
    expect(screen.getByText("jordan@vkart.com")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText(/admin since/i)).toBeInTheDocument();
  });

  test("shows full write access for a super admin", () => {
    renderProfile({ adminRole: "super_admin", permissions: {} });
    expect(screen.getByText(/full read and write access to every module/i)).toBeInTheDocument();
    expect(screen.getByText("Products · write")).toBeInTheDocument();
  });

  test("shows the specific module permissions for a non-super-admin", () => {
    renderProfile({ adminRole: "product_manager", permissions: { products: "write", orders: "read" } });
    const productsRow = screen.getByText("Products").closest("div");
    expect(productsRow).toHaveTextContent("write");
    const ordersRow = screen.getByText("Orders").closest("div");
    expect(ordersRow).toHaveTextContent("read");
    const couponsRow = screen.getByText("Coupons").closest("div");
    expect(couponsRow).toHaveTextContent("none");
  });

  test("saves the updated name and refreshes the profile", async () => {
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    renderProfile();

    const nameInput = screen.getByDisplayValue("Jordan Admin");
    fireEvent.change(nameInput, { target: { value: "Jordan Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/admin/settings/profile",
        expect.any(FormData),
        expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } })
      );
    });
    const sentForm = axios.put.mock.calls[0][1];
    expect(sentForm.get("name")).toBe("Jordan Updated");
    expect(refreshProfile).toHaveBeenCalled();
    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument();
  });

  test("shows the server error message when saving fails", async () => {
    axios.put.mockRejectedValueOnce({ response: { data: { message: "Name is required" } } });
    renderProfile();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(refreshProfile).not.toHaveBeenCalled();
  });

  test("rejects an avatar image larger than 2MB", () => {
    renderProfile();
    const fileInput = document.querySelector('input[type="file"]');
    const bigFile = new File([new ArrayBuffer(3 * 1024 * 1024)], "big.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [bigFile] } });

    expect(screen.getByText(/image size must be less than 2mb/i)).toBeInTheDocument();
  });

  test("accepts a valid avatar image and includes it in the saved form data", async () => {
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    renderProfile();
    const fileInput = document.querySelector('input[type="file"]');
    const smallFile = new File([new ArrayBuffer(1024)], "avatar.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [smallFile] } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
    const sentForm = axios.put.mock.calls[0][1];
    expect(sentForm.get("profileImage")).toBeTruthy();
  });
});
