// src/components/AdminUsers.jsx (or ./AdminUsers.js)
import React, { useEffect, useMemo, useState } from "react";
import axios from "./axiosInstance";
import {
  SearchIcon,
  RefreshIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  KeyIcon,
  TrashIcon,
  DotsVerticalIcon,
  XIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

const ADMIN_USERS_ENDPOINT = "/api/admin/users";

const badgeColors = {
  twoFAOn: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  twoFAOff: "bg-gray-50 text-gray-700 ring-gray-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  active: "bg-blue-50 text-blue-700 ring-blue-200",
};

function avatarInitial(name, email) {
  const src = (name || email || "").trim();
  if (!src) return "?";
  return src.charAt(0).toUpperCase();
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterTwoFA, setFilterTwoFA] = useState("all"); // all | on | off
  const [filterBlocked, setFilterBlocked] = useState("all"); // all | blocked | active
  const [sortKey, setSortKey] = useState("createdAt"); // createdAt | name | email
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  const [menuOpenId, setMenuOpenId] = useState(null);

  const [resetUser, setResetUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminToken = localStorage.getItem("admin_token") || "";

 async function loadUsers() {
  try {
    setError(null);
    setLoading(true);
    const res = await axios.get(ADMIN_USERS_ENDPOINT, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = res.data;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.users)
      ? data.users
      : [];

    setUsers(list);
  } catch (err) {
    console.error("Admin users fetch error:", err);
    setError(
      err?.response?.data?.message ||
        "Unable to load users. Please try again."
    );
  } finally {
    setLoading(false);
  }
}


  async function refresh() {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const stats = useMemo(() => {
    const total = users.length;
    const twoFAEnabled = users.filter((u) => u.twoFactorEnabled).length;
    const blocked = users.filter((u) => u.blocked).length;
    return { total, twoFAEnabled, blocked };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let out = [...users];

    if (q) {
      out = out.filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        const id = String(u._id || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          username.includes(q) ||
          id.includes(q)
        );
      });
    }

    if (filterTwoFA === "on") {
      out = out.filter((u) => u.twoFactorEnabled);
    } else if (filterTwoFA === "off") {
      out = out.filter((u) => !u.twoFactorEnabled);
    }

    if (filterBlocked === "blocked") {
      out = out.filter((u) => u.blocked);
    } else if (filterBlocked === "active") {
      out = out.filter((u) => !u.blocked);
    }

    out.sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case "name":
          va = (a.name || "").toLowerCase();
          vb = (b.name || "").toLowerCase();
          break;
        case "email":
          va = (a.email || "").toLowerCase();
          vb = (b.email || "").toLowerCase();
          break;
        case "createdAt":
        default:
          va = new Date(a.createdAt || 0).getTime();
          vb = new Date(b.createdAt || 0).getTime();
          break;
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [users, search, filterTwoFA, filterBlocked, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  }

  async function handleToggleBlock(user) {
    try {
      setBusyAction(true);
      await axios.patch(
        `/api/admin/users/${user._id}/block`,
        { blocked: !user.blocked },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      showToast(
        !user.blocked ? "User blocked successfully." : "User unblocked."
      );
      await loadUsers();
    } catch (err) {
      console.error("Toggle block error:", err);
      showToast(
        err?.response?.data?.message || "Unable to update user status.",
        "error"
      );
    } finally {
      setBusyAction(false);
    }
  }

  async function handleDisable2FA(user) {
    try {
      setBusyAction(true);
      await axios.patch(
        `/api/admin/users/${user._id}/2fa/disable`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      showToast("Two-factor authentication disabled for this user.");
      await loadUsers();
    } catch (err) {
      console.error("Disable 2FA error:", err);
      showToast(
        err?.response?.data?.message || "Unable to disable 2FA.",
        "error"
      );
    } finally {
      setBusyAction(false);
    }
  }

  async function confirmResetPassword() {
    if (!resetUser) return;
    try {
      setBusyAction(true);
      await axios.post(
        `/api/admin/users/${resetUser._id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      showToast("Password reset link / temp password sent.");
      setResetUser(null);
    } catch (err) {
      console.error("Reset password error:", err);
      showToast(
        err?.response?.data?.message || "Unable to reset password.",
        "error"
      );
    } finally {
      setBusyAction(false);
    }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    try {
      setBusyAction(true);
      await axios.delete(`/api/admin/users/${deleteUser._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      showToast("User deleted.");
      setDeleteUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      showToast(
        err?.response?.data?.message || "Unable to delete user.",
        "error"
      );
    } finally {
      setBusyAction(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed z-30 top-4 right-4 px-4 py-2 rounded-xl shadow-lg text-sm flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {toast.type === "error" ? (
            <ShieldExclamationIcon className="h-4 w-4" />
          ) : (
            <CheckCircleIcon className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View all registered users, security status, and manage access.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshIcon className="h-5 w-5" />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={stats.total}
          hint="Across all auth methods"
        />
        <StatCard
          label="2FA Enabled"
          value={stats.twoFAEnabled}
          hint="Higher is better for security"
          icon={<ShieldCheckIcon className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          hint="Users currently locked out"
          danger={true}
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 gap-2">
          <SearchIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, username, or User ID"
            className="flex-1 text-sm outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All 2FA"
            active={filterTwoFA === "all"}
            onClick={() => setFilterTwoFA("all")}
          />
          <FilterChip
            label="2FA On"
            active={filterTwoFA === "on"}
            onClick={() => setFilterTwoFA("on")}
          />
          <FilterChip
            label="2FA Off"
            active={filterTwoFA === "off"}
            onClick={() => setFilterTwoFA("off")}
          />

          <span className="hidden sm:inline-block w-px bg-gray-200 mx-1" />

          <FilterChip
            label="All status"
            active={filterBlocked === "all"}
            onClick={() => setFilterBlocked("all")}
          />
          <FilterChip
            label="Active only"
            active={filterBlocked === "active"}
            onClick={() => setFilterBlocked("active")}
          />
          <FilterChip
            label="Blocked only"
            active={filterBlocked === "blocked"}
            onClick={() => setFilterBlocked("blocked")}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Loading users…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No users match the current filters.
          </div>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Th
                      onClick={() => toggleSort("name")}
                      active={sortKey === "name"}
                      dir={sortDir}
                    >
                      User
                    </Th>
                    <Th
                      onClick={() => toggleSort("email")}
                      active={sortKey === "email"}
                      dir={sortDir}
                    >
                      Email
                    </Th>
                    <Th>Username</Th>
                    <Th>2FA</Th>
                    <Th>Status</Th>
                    <Th
                      onClick={() => toggleSort("createdAt")}
                      active={sortKey === "createdAt"}
                      dir={sortDir}
                    >
                      Joined
                    </Th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-orange-50/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-semibold flex items-center justify-center text-sm shadow">
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name || u.email}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              avatarInitial(u.name, u.email)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {u.name || "Unnamed User"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              ID: {u._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.email || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.username || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            u.twoFactorEnabled
                              ? badgeColors.twoFAOn
                              : badgeColors.twoFAOff
                          }`}
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                          {u.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            u.blocked
                              ? badgeColors.blocked
                              : badgeColors.active
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {u.blocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleToggleBlock(u)}
                            disabled={busyAction}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border ${
                              u.blocked
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                : "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                            } disabled:opacity-60`}
                          >
                            {u.blocked ? "Unblock" : "Block"}
                          </button>
                          {u.twoFactorEnabled && (
                            <button
                              onClick={() => handleDisable2FA(u)}
                              disabled={busyAction}
                              className="hidden xl:inline-flex items-center text-xs font-semibold rounded-full px-3 py-1 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                              <LockClosedIcon className="h-4 w-4 mr-1" />
                              Disable 2FA
                            </button>
                          )}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuOpenId((id) =>
                                  id === u._id ? null : u._id
                                )
                              }
                              className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1.5 hover:bg-gray-50"
                            >
                              <DotsVerticalIcon className="h-4 w-4 text-gray-500" />
                            </button>
                            {menuOpenId === u._id && (
                              <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-10">
                                <div className="py-1 text-xs text-gray-700">
                                  <button
                                    onClick={() => {
                                      setResetUser(u);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                                  >
                                    <KeyIcon className="h-4 w-4" />
                                    Reset password
                                  </button>
                                  {u.twoFactorEnabled && (
                                    <button
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        handleDisable2FA(u);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                                    >
                                      <LockClosedIcon className="h-4 w-4" />
                                      Disable 2FA
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setDeleteUser(u);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete user
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet: cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filtered.map((u) => (
                <div key={u._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-semibold flex items-center justify-center text-sm shadow">
                      {u.profileImage ? (
                        <img
                          src={u.profileImage}
                          alt={u.name || u.email}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        avatarInitial(u.name, u.email)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900 truncate">
                            {u.name || "Unnamed User"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {u.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            @{u.username || "—"}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                              u.twoFactorEnabled
                                ? badgeColors.twoFAOn
                                : badgeColors.twoFAOff
                            }`}
                          >
                            <ShieldCheckIcon className="h-3 w-3" />
                            {u.twoFactorEnabled ? "2FA On" : "2FA Off"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                              u.blocked
                                ? badgeColors.blocked
                                : badgeColors.active
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {u.blocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={busyAction}
                          className={`rounded-full px-3 py-1 border ${
                            u.blocked
                              ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                              : "border-red-200 text-red-700 bg-red-50"
                          } disabled:opacity-60`}
                        >
                          {u.blocked ? "Unblock" : "Block"}
                        </button>
                        {u.twoFactorEnabled && (
                          <button
                            onClick={() => handleDisable2FA(u)}
                            disabled={busyAction}
                            className="rounded-full px-3 py-1 border border-gray-200 text-gray-700 bg-white disabled:opacity-60"
                          >
                            Disable 2FA
                          </button>
                        )}
                        <button
                          onClick={() => setResetUser(u)}
                          disabled={busyAction}
                          className="rounded-full px-3 py-1 border border-gray-200 text-gray-700 bg-white disabled:opacity-60"
                        >
                          Reset password
                        </button>
                        <button
                          onClick={() => setDeleteUser(u)}
                          disabled={busyAction}
                          className="rounded-full px-3 py-1 border border-red-200 text-red-600 bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="mt-2 text-[11px] text-gray-400">
                        Joined:{" "}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetUser && (
        <Modal
          title="Reset password?"
          onClose={() => !busyAction && setResetUser(null)}
        >
          <p className="text-sm text-gray-600">
            This will trigger a password reset for{" "}
            <span className="font-semibold">{resetUser.email}</span>. Depending
            on your backend implementation, they may receive a reset link or a
            temporary password.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            This action is safe — it does not sign the user out immediately
            unless your backend enforces it.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setResetUser(null)}
              disabled={busyAction}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={confirmResetPassword}
              disabled={busyAction}
              className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {busyAction ? "Processing…" : "Confirm reset"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <Modal
          title="Delete user?"
          danger
          onClose={() => !busyAction && setDeleteUser(null)}
        >
          <p className="text-sm text-gray-700">
            You are about to permanently delete{" "}
            <span className="font-semibold">{deleteUser.email}</span>.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            This should only be used for test/demo accounts or to comply with
            data deletion requests. Orders and related data may become
            orphaned unless your backend handles cascading.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setDeleteUser(null)}
              disabled={busyAction}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteUser}
              disabled={busyAction}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busyAction ? "Deleting…" : "Delete user"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────── helpers ───────────────────────────────────────────── */

function StatCard({ label, value, hint, icon, danger }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 shadow-sm bg-gradient-to-br ${
        danger
          ? "from-red-50 to-white border-red-100"
          : "from-orange-50/60 to-white border-orange-100"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
          {hint && (
            <div className="mt-1 text-xs text-gray-500 truncate">{hint}</div>
          )}
        </div>
        {icon && (
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition ${
        active
          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function Th({ children, onClick, active, dir }) {
  return (
    <th
      className="px-4 py-3 cursor-pointer select-none"
      onClick={onClick}
    >
      <div className="inline-flex items-center gap-1">
        <span>{children}</span>
        {active && (
          <span className="text-[10px] text-gray-500">
            {dir === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );
}

function Modal({ title, children, onClose, danger }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 px-5 py-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {danger && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
                <ExclamationCircleIcon className="h-4 w-4" />
              </span>
            )}
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <XIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ExclamationCircleIcon(props) {
  // simple inline icon to avoid extra imports
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 18.333A8.333 8.333 0 1 0 10 1.667a8.333 8.333 0 0 0 0 16.666Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6.25v5M10 13.75h.008"
      />
    </svg>
  );
}
