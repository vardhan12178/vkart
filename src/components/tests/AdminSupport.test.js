import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminSupport from "../admin/AdminSupport";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

const mockSocket = { on: jest.fn(), emit: jest.fn(), disconnect: jest.fn() };
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket),
}));

function TestLayout({ adminRole, permissions }) {
  return <Outlet context={{ adminRole, permissions }} />;
}

const CONVERSATION_SUMMARY = {
  _id: "conv1",
  status: "AWAITING_AGENT",
  userId: { name: "Casey Customer", email: "casey@example.com" },
  messages: [{ sender: "USER", text: "I need help with my order" }],
};

const CONVERSATION_DETAIL = {
  ...CONVERSATION_SUMMARY,
  assignedAgentId: null,
  messages: [{ _id: "m1", sender: "USER", text: "I need help with my order" }],
};

describe("AdminSupport Component", () => {
  let queryClient;

  beforeAll(() => {
    // jsdom doesn't implement Element.scrollTo; the component calls it to
    // auto-scroll the message thread on new messages.
    Element.prototype.scrollTo = jest.fn();
  });

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.patch.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, refetchInterval: false }, mutations: { retry: false } },
    });
  });

  const renderSupport = ({ adminRole = "super_admin", permissions = {} } = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin/support"]}>
          <Routes>
            <Route element={<TestLayout adminRole={adminRole} permissions={permissions} />}>
              <Route path="/admin/support" element={<AdminSupport />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders the conversation queue", async () => {
    axios.get.mockResolvedValue({ data: { conversations: [CONVERSATION_SUMMARY] } });
    renderSupport();
    expect(await screen.findByText("Casey Customer")).toBeInTheDocument();
  });

  test("shows the empty queue message when there are no conversations", async () => {
    axios.get.mockResolvedValue({ data: { conversations: [] } });
    renderSupport();
    expect(await screen.findByText(/no conversations in this queue/i)).toBeInTheDocument();
  });

  test("opens a conversation thread and shows its messages", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/support/conversations") return Promise.resolve({ data: { conversations: [CONVERSATION_SUMMARY] } });
      return Promise.resolve({ data: { conversation: CONVERSATION_DETAIL } });
    });
    renderSupport();
    fireEvent.click(await screen.findByText("Casey Customer"));

    expect(await screen.findByText("I need help with my order")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  test("sends a reply message", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/support/conversations") return Promise.resolve({ data: { conversations: [CONVERSATION_SUMMARY] } });
      return Promise.resolve({ data: { conversation: CONVERSATION_DETAIL } });
    });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderSupport();
    fireEvent.click(await screen.findByText("Casey Customer"));
    await screen.findByText("I need help with my order");

    const input = await screen.findByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "On it, one moment!" } });
    fireEvent.click(screen.getByRole("button", { name: "" })); // send button (icon only)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/admin/support/conversations/conv1/messages",
        { text: "On it, one moment!" }
      );
    });
  });

  test("claims an unassigned conversation", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/support/conversations") return Promise.resolve({ data: { conversations: [CONVERSATION_SUMMARY] } });
      return Promise.resolve({ data: { conversation: CONVERSATION_DETAIL } });
    });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderSupport();
    fireEvent.click(await screen.findByText("Casey Customer"));

    fireEvent.click(await screen.findByRole("button", { name: /claim/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/support/conversations/conv1", { action: "claim" });
    });
  });

  test("resolves an in-progress conversation", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/support/conversations") return Promise.resolve({ data: { conversations: [CONVERSATION_SUMMARY] } });
      return Promise.resolve({ data: { conversation: { ...CONVERSATION_DETAIL, assignedAgentId: "agent1", status: "IN_PROGRESS" } } });
    });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderSupport();
    fireEvent.click(await screen.findByText("Casey Customer"));

    // Anchored: the "Resolved" filter tab's accessible name also contains
    // "Resolve" as a substring, so an unanchored /resolve/i matches both.
    fireEvent.click(await screen.findByRole("button", { name: /^resolve$/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/support/conversations/conv1", { action: "resolve" });
    });
  });

  test("hides the reply box and action buttons for a viewer without write access", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/support/conversations") return Promise.resolve({ data: { conversations: [CONVERSATION_SUMMARY] } });
      return Promise.resolve({ data: { conversation: CONVERSATION_DETAIL } });
    });
    renderSupport({ adminRole: "customer_service", permissions: { support: "read" } });
    fireEvent.click(await screen.findByText("Casey Customer"));
    await screen.findByText("I need help with my order");

    expect(screen.queryByPlaceholderText(/type a message/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim/i })).not.toBeInTheDocument();
  });
});
