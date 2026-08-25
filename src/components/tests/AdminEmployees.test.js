import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminEmployees from "../admin/AdminEmployees";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const EMPLOYEES = [
  {
    _id: "emp1",
    name: "Alice Admin",
    email: "alice@vkart.com",
    adminRole: "product_manager",
    permissions: { products: "write" },
  },
  {
    _id: "emp2",
    name: "Sam Super",
    email: "sam@vkart.com",
    adminRole: "super_admin",
    permissions: {},
  },
];

describe("AdminEmployees Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.patch.mockReset();
    axios.delete.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderEmployees = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/employees"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/employees" element={<AdminEmployees />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the employee list with role and access badges", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: EMPLOYEES } });
    renderEmployees();

    const table = await screen.findByRole("table");
    expect(within(table).getByText("Alice Admin")).toBeInTheDocument();
    expect(within(table).getByText("Product Manager")).toBeInTheDocument();
    expect(within(table).getByText("Sam Super")).toBeInTheDocument();
    expect(within(table).getByText(/full access/i)).toBeInTheDocument();
  });

  test("shows the empty state when there are no employees", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: [] } });
    renderEmployees();
    expect(await screen.findByText(/no employees yet/i)).toBeInTheDocument();
  });

  test("hides the Add Employee button for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: EMPLOYEES } });
    renderEmployees({ adminRole: "customer_service", permissions: { employees: "read" } });

    await screen.findByRole("table");
    expect(screen.queryByRole("button", { name: /add employee/i })).not.toBeInTheDocument();
  });

  test("hides per-row edit/revoke actions for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: EMPLOYEES } });
    renderEmployees({ adminRole: "customer_service", permissions: { employees: "read" } });

    await screen.findByRole("table");
    expect(screen.queryByTitle(/manage access/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/revoke access/i)).not.toBeInTheDocument();
  });

  test("hides edit/revoke actions on a super_admin row for a non-super-admin writer", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: EMPLOYEES } });
    renderEmployees({ adminRole: "product_manager", permissions: { employees: "write" } });

    const table = await screen.findByRole("table");
    const superAdminRow = within(table).getByText("Sam Super").closest("tr");
    expect(within(superAdminRow).queryByTitle(/manage access/i)).not.toBeInTheDocument();

    const regularRow = within(table).getByText("Alice Admin").closest("tr");
    expect(within(regularRow).getByTitle(/manage access/i)).toBeInTheDocument();
  });

  test("adds a new employee with the selected role and module permissions", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: [] } });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderEmployees({ adminRole: "super_admin", permissions: {} });

    fireEvent.click(await screen.findByRole("button", { name: /add first employee/i }));

    fireEvent.change(screen.getByPlaceholderText("employee@example.com"), {
      target: { value: "New.Person@Example.com" },
    });
    // Selecting the "reviewer" role pre-fills the permission matrix from its
    // ROLE_PRESETS entry ({ reviews: "write", notifications: "read" }).
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "reviewer" } });

    fireEvent.click(screen.getByRole("button", { name: /^add employee$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/admin/employees", {
        adminRole: "reviewer",
        permissions: { reviews: "write", notifications: "read" },
        email: "new.person@example.com",
      });
    });
    expect(await screen.findByText(/employee added/i)).toBeInTheDocument();
  });

  test("shows a server error toast when adding an employee fails", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: [] } });
    axios.post.mockRejectedValueOnce({ response: { data: { message: "Email already an employee" } } });
    renderEmployees({ adminRole: "super_admin", permissions: {} });

    fireEvent.click(await screen.findByRole("button", { name: /add first employee/i }));
    fireEvent.change(screen.getByPlaceholderText("employee@example.com"), {
      target: { value: "dup@example.com" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "reviewer" } });
    fireEvent.click(screen.getByRole("button", { name: /^add employee$/i }));

    expect(await screen.findByText("Email already an employee")).toBeInTheDocument();
  });

  test("edits an existing employee's role and permissions", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: EMPLOYEES } });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderEmployees({ adminRole: "super_admin", permissions: {} });

    await screen.findByRole("table");
    fireEvent.click(screen.getAllByTitle(/manage access/i)[0]);

    expect(screen.getByRole("heading", { name: /manage access/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^save access$/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/employees/emp1", {
        adminRole: "product_manager",
        permissions: { products: "write" },
      });
    });
    expect(await screen.findByText(/access updated/i)).toBeInTheDocument();
  });

  test("revokes an employee's access after confirming", async () => {
    axios.get.mockResolvedValueOnce({ data: { employees: EMPLOYEES } });
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderEmployees({ adminRole: "super_admin", permissions: {} });

    await screen.findByRole("table");
    fireEvent.click(screen.getAllByTitle(/revoke access/i)[0]);

    expect(screen.getByText(/remove admin panel access/i)).toBeInTheDocument();
    // The desktop row icon button's title ("Revoke access") also matches
    // this name case-insensitively, so target the modal's confirm button
    // specifically (rendered last in the DOM).
    const revokeButtons = screen.getAllByRole("button", { name: /^revoke access$/i });
    fireEvent.click(revokeButtons[revokeButtons.length - 1]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/admin/employees/emp1");
    });
    expect(await screen.findByText(/access revoked/i)).toBeInTheDocument();
  });
});
