import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminSettings from "../admin/AdminSettings";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const STORE_SETTINGS = {
  store: {
    storeName: "VKart",
    tagline: "Premium Lifestyle Store",
    supportEmail: "support@vkart.com",
    supportPhone: "+91 99999 12345",
  },
};

describe("AdminSettings Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.put.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderSettings = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/settings"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("loads and displays the saved store settings", async () => {
    axios.get.mockResolvedValueOnce({ data: STORE_SETTINGS });
    renderSettings();
    expect(await screen.findByDisplayValue("VKart")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Premium Lifestyle Store")).toBeInTheDocument();
    expect(screen.getByDisplayValue("support@vkart.com")).toBeInTheDocument();
  });

  test("saves updated settings", async () => {
    // mockResolvedValue (not Once): a successful save invalidates the
    // settings query, which triggers a refetch beyond the initial load.
    axios.get.mockResolvedValue({ data: STORE_SETTINGS });
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    renderSettings();
    await screen.findByDisplayValue("VKart");

    fireEvent.change(screen.getByPlaceholderText("e.g. VKart"), { target: { value: "VKart Prime" } });
    fireEvent.click(screen.getAllByRole("button", { name: /save changes/i })[0]);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/admin/settings/store", {
        storeName: "VKart Prime",
        tagline: "Premium Lifestyle Store",
        supportEmail: "support@vkart.com",
        supportPhone: "+91 99999 12345",
      });
    });
    expect(await screen.findByText(/store settings saved successfully/i)).toBeInTheDocument();
  });

  test("shows an error toast when settings fail to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderSettings();
    expect(await screen.findByText(/failed to load settings/i)).toBeInTheDocument();
  });

  test("shows the server error message when saving fails", async () => {
    axios.get.mockResolvedValueOnce({ data: STORE_SETTINGS });
    axios.put.mockRejectedValueOnce({ response: { data: { message: "Store name is required" } } });
    renderSettings();
    await screen.findByDisplayValue("VKart");

    fireEvent.click(screen.getAllByRole("button", { name: /save changes/i })[0]);

    expect(await screen.findByText("Store name is required")).toBeInTheDocument();
  });

  test("disables inputs and hides save controls for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: STORE_SETTINGS });
    renderSettings({ adminRole: "customer_service", permissions: { settings: "read" } });
    const storeNameInput = await screen.findByDisplayValue("VKart");

    expect(storeNameInput).toBeDisabled();
    expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
  });

  test("updates the live invoice preview as fields change", async () => {
    axios.get.mockResolvedValueOnce({ data: STORE_SETTINGS });
    renderSettings();
    await screen.findByDisplayValue("VKart");

    fireEvent.change(screen.getByPlaceholderText("e.g. VKart"), { target: { value: "Acme Store" } });
    expect(screen.getByText("Acme Store")).toBeInTheDocument();
  });
});
