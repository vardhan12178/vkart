import React, { useEffect, useMemo, useState } from "react";
import {
  SearchIcon,
  RefreshIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  TrashIcon,
  DotsVerticalIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  MailIcon,
  DownloadIcon
} from "@heroicons/react/outline";
import axiosInstance from "../axiosInstance";

const ADMIN_USERS_ENDPOINT = "/api/admin/users";

// Semantic styles for badges
const badgeStyles = {
  twoFAOn: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/30",
  twoFAOff: "bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/30",
  blocked: "bg-red-50 text-red-700 border-red-100 ring-red-500/30",
  active: "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/30",
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
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);



  async function loadUsers() {
    try {
      setError(null);
      setLoading(true);
      const res = await axiosInstance.get(ADMIN_USERS_ENDPOINT);
      const data = res.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
      setUsers(list);
    } catch (err) {
      console.error("Admin users fetch error:", err);
      setError("Unable to load users. Please try again.");
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

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const total = users.length;
    const twoFAEnabled = users.filter((u) => u.twoFactorEnabled).length;
    const blocked = users.filter((u) => u.blocked).length;
    return { total, twoFAEnabled, blocked };
  }, [users]);

  // --- Filtering & Sorting ---
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = [...users];

    if (q) {
      out = out.filter((u) => {
        return (
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q) ||
          String(u._id || "").toLowerCase().includes(q)
        );
      });
    }

    if (filterTwoFA === "on") out = out.filter((u) => u.twoFactorEnabled);
    else if (filterTwoFA === "off") out = out.filter((u) => !u.twoFactorEnabled);

    if (filterBlocked === "blocked") out = out.filter((u) => u.blocked);
    else if (filterBlocked === "active") out = out.filter((u) => !u.blocked);

    out.sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case "name":
          va = (a.name || "").toLowerCase(); vb = (b.name || "").toLowerCase(); break;
        case "email":
          va = (a.email || "").toLowerCase(); vb = (b.email || "").toLowerCase(); break;
        default: // createdAt
          va = new Date(a.createdAt || 0).getTime(); vb = new Date(b.createdAt || 0).getTime(); break;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [users, search, filterTwoFA, filterBlocked, sortKey, sortDir]);

  useEffect(() => { setCurrentPage(1); }, [search, filterTwoFA, filterBlocked]);

  // --- Pagination Calculation (FIXED) ---
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage; // This was missing!
  const currentUsers = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "createdAt" ? "desc" : "asc"); }
  };

  // --- Actions ---
  async function handleToggleBlock(user) {
    try {
      setBusyAction(true);
      await axiosInstance.patch(`/api/admin/users/${user._id}/block`, { blocked: !user.blocked });
      showToast(!user.blocked ? "User blocked." : "User activated.");
      await loadUsers();
    } catch (err) { showToast("Update failed.", "error"); } finally { setBusyAction(false); }
  }

  async function handleDisable2FA(user) {
    try {
      setBusyAction(true);
      await axiosInstance.patch(`/api/admin/users/${user._id}/2fa/disable`);
      showToast("2FA Disabled.");
      await loadUsers();
    } catch (err) { showToast("Failed to disable 2FA.", "error"); } finally { setBusyAction(false); }
  }

  async function handleToggleAdmin(user) {
    try {
      setBusyAction(true);
      await axiosInstance.patch(`/api/admin/users/${user._id}/role`);
      showToast(user.roles?.includes("admin") ? "Admin removed." : "Admin granted.");
      await loadUsers();
    } catch (err) { showToast("Role update failed.", "error"); } finally { setBusyAction(false); }
  }

  async function confirmResetPassword() {
    if (!resetUser) return;
    try {
      setBusyAction(true);
      await axiosInstance.post(`/api/admin/users/${resetUser._id}/reset-password`);
      showToast("Reset email sent.");
      setResetUser(null);
    } catch (err) { showToast("Reset failed.", "error"); } finally { setBusyAction(false); }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    try {
      setBusyAction(true);
      await axiosInstance.delete(`/api/admin/users/${deleteUser._id}`);
      showToast("User deleted.");
      setDeleteUser(null);
      await loadUsers();
    } catch (err) { showToast("Delete failed.", "error"); } finally { setBusyAction(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed z-50 top-5 right-5 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "bg-white border-red-100 text-red-800" : "bg-white border-emerald-100 text-emerald-800"
            }`}>
            {toast.type === "error" ? <ExclamationCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage access and security for all accounts.</p>
          </div>
          <div className="flex gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50 transition-all">
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium shadow-md hover:bg-slate-800 transition-all disabled:opacity-70 active:scale-95"
            >
              <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Syncing..." : "Sync Users"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Accounts" value={stats.total} icon={UserGroupIcon} color="blue" />
          <StatCard label="Secured with 2FA" value={stats.twoFAEnabled} icon={ShieldCheckIcon} color="emerald" />
          <StatCard label="Blocked / Suspended" value={stats.blocked} icon={BanIcon} color="red" />
        </div>

        {/* Controls Toolbar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-sm"
            />
          </div>

          <div className="h-px w-full bg-slate-100 lg:h-auto lg:w-px lg:bg-slate-100"></div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-2 pb-2 lg:pb-0 overflow-x-auto no-scrollbar">
            <div className="flex bg-slate-100/80 p-1 rounded-lg">
              <TabButton label="All" active={filterBlocked === 'all'} onClick={() => setFilterBlocked('all')} />
              <TabButton label="Active" active={filterBlocked === 'active'} onClick={() => setFilterBlocked('active')} />
              <TabButton label="Blocked" active={filterBlocked === 'blocked'} onClick={() => setFilterBlocked('blocked')} />
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex bg-slate-100/80 p-1 rounded-lg">
              <TabButton label="All Security" active={filterTwoFA === 'all'} onClick={() => setFilterTwoFA('all')} />
              <TabButton label="2FA Only" active={filterTwoFA === 'on'} onClick={() => setFilterTwoFA('on')} />
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 space-y-4 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl w-full"></div>)}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              <ExclamationCircleIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FilterIcon className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No users found</h3>
              <p className="text-slate-500 text-sm mt-1">Try clearing your filters or search.</p>
              <button onClick={() => { setSearch(''); setFilterBlocked('all'); setFilterTwoFA('all') }} className="mt-4 text-orange-600 font-medium text-sm hover:underline">Reset Filters</button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-50">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <Th onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir}>User</Th>
                      <Th onClick={() => toggleSort("email")} active={sortKey === "email"} dir={sortDir}>Contact</Th>
                      <Th>Security</Th>
                      <Th>Status</Th>
                      <Th onClick={() => toggleSort("createdAt")} active={sortKey === "createdAt"} dir={sortDir}>Joined</Th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {currentUsers.map((u, index) => {
                      const isLastRows = index >= currentUsers.length - 3 && currentUsers.length > 4;
                      const isAdminRole = Array.isArray(u.roles) && u.roles.includes("admin");
                      return (
                        <tr key={u._id} className="group hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 font-bold flex items-center justify-center text-sm ring-2 ring-white shadow-sm overflow-hidden">
                                {u.profileImage ? <img src={u.profileImage} alt="" className="h-full w-full object-cover" /> : avatarInitial(u.name, u.email)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                  {u.name || "Unnamed User"}
                                  {isAdminRole && (
                                    <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono uppercase">ID: {u._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <MailIcon className="h-3.5 w-3.5 text-slate-400" />
                                {u.email}
                              </div>
                              {u.username && <span className="text-xs text-slate-400 pl-5">@{u.username}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.twoFactorEnabled ? badgeStyles.twoFAOn : badgeStyles.twoFAOff}`}>
                              {u.twoFactorEnabled ? <ShieldCheckIcon className="h-3.5 w-3.5" /> : <LockClosedIcon className="h-3.5 w-3.5" />}
                              {u.twoFactorEnabled ? "2FA On" : "Standard"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge blocked={u.blocked} />
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === u._id ? null : u._id)}
                              className={`p-2 rounded-lg transition-colors ${menuOpenId === u._id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                              <DotsVerticalIcon className="h-5 w-5" />
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpenId === u._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)}></div>
                                <div className={`absolute right-8 w-56 bg-white rounded-xl shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 overflow-hidden animate-in zoom-in-95 duration-100 ${isLastRows ? 'bottom-0 mb-2 origin-bottom-right' : 'top-8 mt-1 origin-top-right'}`}>
                                  <div className="p-1 space-y-0.5">
                                    <MenuItem onClick={() => { handleToggleBlock(u); setMenuOpenId(null); }} icon={u.blocked ? CheckCircleIcon : BanIcon} label={u.blocked ? "Unblock User" : "Block Access"} />
                                    <MenuItem onClick={() => { setResetUser(u); setMenuOpenId(null); }} icon={KeyIcon} label="Reset Password" />
                                    {u.twoFactorEnabled && (
                                      <MenuItem onClick={() => { handleDisable2FA(u); setMenuOpenId(null); }} icon={LockClosedIcon} label="Disable 2FA" />
                                    )}
                                    <MenuItem onClick={() => { handleToggleAdmin(u); setMenuOpenId(null); }} icon={ShieldCheckIcon} label={isAdminRole ? "Remove Admin" : "Make Admin"} />
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <MenuItem onClick={() => { setDeleteUser(u); setMenuOpenId(null); }} icon={TrashIcon} label="Delete Account" danger />
                                  </div>
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {currentUsers.map((u) => (
                  <div key={u._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                          {avatarInitial(u.name, u.email)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name || "User"}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <StatusBadge blocked={u.blocked} />
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <div className="flex gap-2">
                        {u.twoFactorEnabled && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">2FA</span>}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleToggleBlock(u)} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                          {u.blocked ? "Unblock" : "Block"}
                        </button>
                        <button onClick={() => setResetUser(u)} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                          Reset
                        </button>
                        <button onClick={() => setDeleteUser(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-900">{startIndex + 1}-{Math.min(endIndex, filtered.length)}</span> of <span className="font-medium text-slate-900">{filtered.length}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"><ChevronLeftIcon className="h-5 w-5 text-slate-600" /></button>
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"><ChevronRightIcon className="h-5 w-5 text-slate-600" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {resetUser && (
        <Modal title="Reset Password" icon={KeyIcon} onClose={() => !busyAction && setResetUser(null)}>
          <p className="text-sm text-slate-600">Send a password reset email to <span className="font-bold text-slate-900">{resetUser.email}</span>?</p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setResetUser(null)} disabled={busyAction} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={confirmResetPassword} disabled={busyAction} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-black rounded-lg shadow-lg shadow-slate-200">{busyAction ? "Sending..." : "Send Email"}</button>
          </div>
        </Modal>
      )}

      {deleteUser && (
        <Modal title="Delete Account" icon={TrashIcon} danger onClose={() => !busyAction && setDeleteUser(null)}>
          <p className="text-sm text-slate-600">Permanently remove <span className="font-bold text-slate-900">{deleteUser.email}</span>? This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setDeleteUser(null)} disabled={busyAction} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={confirmDeleteUser} disabled={busyAction} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-100">{busyAction ? "Deleting..." : "Delete User"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* --- Sub Components for Cleaner Code --- */

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    red: "text-red-600 bg-red-50"
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ blocked }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${blocked ? badgeStyles.blocked : badgeStyles.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${blocked ? "bg-red-500" : "bg-blue-500"}`}></span>
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

function Th({ children, onClick, active, dir }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={onClick}>
      <div className="flex items-center gap-1 group-hover:text-slate-800 transition-colors">
        {children}
        {active && <span className="text-orange-500">{dir === "asc" ? "▲" : "▼"}</span>}
      </div>
    </th>
  );
}

function MenuItem({ onClick, icon: Icon, label, danger }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Modal({ title, icon: Icon, children, onClose, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
