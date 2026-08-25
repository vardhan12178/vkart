import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminUsers from "../admin/AdminUsers";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const USERS = [
  {
    _id: "u1000001",
    name: "John Doe",
    email: "john@example.com",
    username: "johnd",
    twoFactorEnabled: true,
    blocked: false,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "u2000002",
    name: "Amy Blocked",
    email: "amy@example.com",
    username: "amyb",
    twoFactorEnabled: false,
    blocked: true,
    createdAt: "2024-02-01T00:00:00.000Z",
  },
];

describe("AdminUsers Component", () => {
  let queryClient;

  beforeEach(() => {
    axios.get.mockReset();
    axios.patch.mockReset();
    axios.post.mockReset();
    axios.delete.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderUsers = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/users"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the user table with stats", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers();

    const table = await screen.findByRole("table");
    expect(within(table).getByText("John Doe")).toBeInTheDocument();
    expect(within(table).getByText("Amy Blocked")).toBeInTheDocument();

    const totalStat = screen.getByText("Total Accounts").closest("p").parentElement;
    expect(totalStat).toHaveTextContent("2");
    const blockedStat = screen.getByText("Blocked / Suspended").closest("p").parentElement;
    expect(blockedStat).toHaveTextContent("1");
  });

  test("shows an error state when the fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderUsers();
    expect(await screen.findByText(/unable to load users/i)).toBeInTheDocument();
  });

  test("filters the list by search term", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("John Doe")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: "amy" } });

    expect(within(table).queryByText("John Doe")).not.toBeInTheDocument();
    expect(within(table).getByText("Amy Blocked")).toBeInTheDocument();
  });

  test("filters the list to only blocked users via the tab", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers();
    const table = await screen.findByRole("table");

    fireEvent.click(screen.getByRole("button", { name: "Blocked" }));

    expect(within(table).queryByText("John Doe")).not.toBeInTheDocument();
    expect(within(table).getByText("Amy Blocked")).toBeInTheDocument();
  });

  test("shows the empty state with a reset-filters action when a search matches nothing", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers();
    await screen.findByRole("table");

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: "nobody-matches" } });

    expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  test("sorts by name when the User column header is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers();
    const table = await screen.findByRole("table");

    // Default sort is createdAt desc: Amy Blocked (Feb) before John Doe (Jan).
    let rows = within(table).getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Amy Blocked")).toBeInTheDocument();

    fireEvent.click(screen.getByText("User"));

    rows = within(table).getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Amy Blocked")).toBeInTheDocument(); // "Amy" < "John" ascending
  });

  test("hides the actions column and dropdown for a viewer without write access", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers({ adminRole: "customer_service", permissions: { users: "read" } });
    const table = await screen.findByRole("table");

    expect(within(table).queryByText("Actions")).not.toBeInTheDocument();
  });

  test("blocks a user from the row action menu", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderUsers();
    const table = await screen.findByRole("table");

    const johnRow = within(table).getByText("John Doe").closest("tr");
    fireEvent.click(within(johnRow).getByRole("button"));
    fireEvent.click(screen.getByText(/block access/i));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/users/u1000001/block", { blocked: true });
    });
    expect(await screen.findByText("User blocked.")).toBeInTheDocument();
  });

  test("shows an error toast when the block action fails", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    axios.patch.mockRejectedValueOnce(new Error("failed"));
    renderUsers();
    const table = await screen.findByRole("table");

    const johnRow = within(table).getByText("John Doe").closest("tr");
    fireEvent.click(within(johnRow).getByRole("button"));
    fireEvent.click(screen.getByText(/block access/i));

    expect(await screen.findByText("Update failed.")).toBeInTheDocument();
  });

  test("disables 2FA for a user that has it enabled", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderUsers();
    const table = await screen.findByRole("table");

    const johnRow = within(table).getByText("John Doe").closest("tr"); // has twoFactorEnabled: true
    fireEvent.click(within(johnRow).getByRole("button"));
    fireEvent.click(screen.getByText(/disable 2fa/i));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/users/u1000001/disable-2fa");
    });
    expect(await screen.findByText("2FA Disabled.")).toBeInTheDocument();
  });

  test("does not show the disable-2FA option for a user without 2FA enabled", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    renderUsers();
    const table = await screen.findByRole("table");

    const amyRow = within(table).getByText("Amy Blocked").closest("tr"); // twoFactorEnabled: false
    fireEvent.click(within(amyRow).getByRole("button"));

    expect(screen.queryByText(/disable 2fa/i)).not.toBeInTheDocument();
  });

  test("sends a password reset email after confirming in the modal", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderUsers();
    const table = await screen.findByRole("table");

    const johnRow = within(table).getByText("John Doe").closest("tr");
    fireEvent.click(within(johnRow).getByRole("button"));
    fireEvent.click(screen.getByText(/reset password/i));

    expect(screen.getByText(/send a password reset email/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/admin/users/u1000001/reset-password");
    });
    expect(await screen.findByText("Reset email sent.")).toBeInTheDocument();
  });

  test("deletes a user after confirming in the modal", async () => {
    axios.get.mockResolvedValueOnce({ data: USERS });
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderUsers();
    const table = await screen.findByRole("table");

    const johnRow = within(table).getByText("John Doe").closest("tr");
    fireEvent.click(within(johnRow).getByRole("button"));
    fireEvent.click(screen.getByText(/delete account/i));

    expect(screen.getByText(/permanently remove/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /delete user/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/admin/users/u1000001");
    });
    expect(await screen.findByText("User deleted.")).toBeInTheDocument();
  });

  test("paginates when there are more than 10 users", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, i) => ({
      _id: `id${String(i).padStart(6, "0")}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      twoFactorEnabled: false,
      blocked: false,
      createdAt: new Date(2024, 0, i + 1).toISOString(),
    }));
    axios.get.mockResolvedValueOnce({ data: manyUsers });
    renderUsers();
    const table = await screen.findByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(11); // 1 header + 10 body rows
    // "1-10 of 12" is split across sibling <span> elements, so match on the
    // exact concatenated textContent of their containing <div>.
    const rangeText = (expected) =>
      screen.getByText((_, el) => el?.tagName === "DIV" && el.textContent === expected);
    expect(rangeText("1-10 of 12")).toBeInTheDocument();

    // The prev/next pagination buttons are the only ones with this exact
    // class combination; [0] is prev (disabled on page 1), [1] is next.
    const paginationButtons = document.querySelectorAll(".border-slate-200.bg-white.hover\\:bg-slate-50.disabled\\:opacity-30");
    expect(paginationButtons).toHaveLength(2);
    fireEvent.click(paginationButtons[1]); // next

    await waitFor(() => {
      expect(rangeText("11-12 of 12")).toBeInTheDocument();
    });
  });
});
