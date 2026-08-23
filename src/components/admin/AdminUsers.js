import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import { avatarInitial } from "./ui/avatarInitial";
import Avatar from "./ui/Avatar";
import Modal from "./ui/Modal";

const ADMIN_USERS_ENDPOINT = "/api/admin/users";

// Semantic styles for badges
const badgeStyles = {
  twoFAOn: "bg-[#e5e8df] text-[#59634f] border-[#59634f]/15 ring-[#59634f]/20",
  twoFAOff: "bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/30",
  blocked: "bg-[#eee2dc] text-[#75483b] border-[#75483b]/15 ring-[#75483b]/20",
  active: "bg-[#ece8df] text-[#5f5a52] border-black/10 ring-black/10",
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("users");

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
  const [toast, setToast] = useState(null);

  const usersQuery = useQuery({
    queryKey: qk.admin.users,
    queryFn: async () => {
      const res = await axiosInstance.get(ADMIN_USERS_ENDPOINT);
      const data = res.data;
      return Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
    },
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const loading = usersQuery.isLoading;
  const refreshing = usersQuery.isFetching && !usersQuery.isLoading;
  const error = usersQuery.isError ? "Unable to load users. Please try again." : null;

  async function refresh() {
    await usersQuery.refetch();
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const syncUsers = () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.users });
    queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
  };

  const toggleBlockMutation = useMutation({
    mutationFn: ({ userId, blocked }) => axiosInstance.patch(`/api/admin/users/${userId}/block`, { blocked }),
    onSuccess: () => syncUsers(),
  });

  const disable2faMutation = useMutation({
    mutationFn: (userId) => axiosInstance.patch(`/api/admin/users/${userId}/disable-2fa`),
    onSuccess: () => syncUsers(),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId) => axiosInstance.post(`/api/admin/users/${userId}/reset-password`),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/api/admin/users/${userId}`),
    onSuccess: () => syncUsers(),
  });

  const busyAction =
    toggleBlockMutation.isPending ||
    disable2faMutation.isPending ||
    resetPasswordMutation.isPending ||
    deleteUserMutation.isPending;

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
      await toggleBlockMutation.mutateAsync({ userId: user._id, blocked: !user.blocked });
      showToast(!user.blocked ? "User blocked." : "User activated.");
    } catch (err) { showToast("Update failed.", "error"); }
  }

  async function handleDisable2FA(user) {
    try {
      await disable2faMutation.mutateAsync(user._id);
      showToast("2FA Disabled.");
    } catch (err) { showToast("Failed to disable 2FA.", "error"); }
  }

  async function confirmResetPassword() {
    if (!resetUser) return;
    try {
      await resetPasswordMutation.mutateAsync(resetUser._id);
      showToast("Reset email sent.");
      setResetUser(null);
    } catch (err) { showToast("Reset failed.", "error"); }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    try {
      await deleteUserMutation.mutateAsync(deleteUser._id);
      showToast("User deleted.");
      setDeleteUser(null);
    } catch (err) { showToast("Delete failed.", "error"); }
  }

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed z-50 top-5 right-5 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "bg-white border-red-100 text-red-800" : "bg-white border-emerald-100 text-emerald-800"
            }`}>
            {toast.type === "error" ? <ExclamationCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Users
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">Manage access and security for all accounts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs sm:text-sm font-semibold shadow-xs hover:bg-slate-50 transition-all">
              <DownloadIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:bg-slate-800 transition-all disabled:opacity-70 active:scale-95 shrink-0"
            >
              <RefreshIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Users"}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Compact Metric Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatCard label="Total" fullLabel="Total Accounts" value={stats.total} icon={UserGroupIcon} color="blue" />
          <StatCard label="2FA" fullLabel="Secured with 2FA" value={stats.twoFAEnabled} icon={ShieldCheckIcon} color="emerald" />
          <StatCard label="Blocked" fullLabel="Blocked / Suspended" value={stats.blocked} icon={BanIcon} color="red" />
        </div>

        {/* Controls Toolbar */}
        <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-xs sm:text-sm font-medium outline-none"
            />
          </div>

          <div className="h-px w-full bg-slate-100 lg:h-auto lg:w-px lg:bg-slate-100"></div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 px-1 pb-1 lg:pb-0 overflow-x-auto no-scrollbar">
            <div className="flex bg-slate-100/80 p-0.5 sm:p-1 rounded-xl">
              <TabButton label="All" active={filterBlocked === 'all'} onClick={() => setFilterBlocked('all')} />
              <TabButton label="Active" active={filterBlocked === 'active'} onClick={() => setFilterBlocked('active')} />
              <TabButton label="Blocked" active={filterBlocked === 'blocked'} onClick={() => setFilterBlocked('blocked')} />
            </div>

            <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

            <div className="flex bg-slate-100/80 p-0.5 sm:p-1 rounded-xl">
              <TabButton label="All Security" active={filterTwoFA === 'all'} onClick={() => setFilterTwoFA('all')} />
              <TabButton label="2FA Only" active={filterTwoFA === 'on'} onClick={() => setFilterTwoFA('on')} />
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl w-full"></div>)}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-xs sm:text-sm">
              <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
                <FilterIcon className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">No users found</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Try adjusting your filters or search keyword.</p>
              <button onClick={() => { setSearch(''); setFilterBlocked('all'); setFilterTwoFA('all') }} className="mt-3 text-orange-600 font-bold text-xs hover:underline">Reset Filters</button>
            </div>
          ) : (
            <>
              {/* Desktop Table (>= lg) */}
              <div className="hidden lg:block overflow-x-auto min-h-[340px]">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <Th onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir}>User</Th>
                      <Th onClick={() => toggleSort("email")} active={sortKey === "email"} dir={sortDir}>Contact</Th>
                      <Th>Security</Th>
                      <Th>Status</Th>
                      <Th onClick={() => toggleSort("createdAt")} active={sortKey === "createdAt"} dir={sortDir}>Joined</Th>
                      {canWrite && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {currentUsers.map((u, index) => {
                      const isLastRows = index >= currentUsers.length - 2 || (currentUsers.length <= 3 && index >= 1);
                      const isAdminRole = Array.isArray(u.roles) && u.roles.includes("admin");
                      return (
                        <tr key={u._id} className="group hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={u.profileImage}
                                name={u.name}
                                email={u.email}
                                className="h-9 w-9 rounded-xl shadow-xs"
                              />
                              <div>
                                <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                                  {u.name || "Unnamed User"}
                                  {isAdminRole && (
                                    <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded-full border border-orange-100">
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
                              <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                <MailIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {u.email}
                              </div>
                              {u.username && <span className="text-xs text-slate-400 pl-5">@{u.username}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.twoFactorEnabled ? badgeStyles.twoFAOn : badgeStyles.twoFAOff}`}>
                              {u.twoFactorEnabled ? <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600" /> : <LockClosedIcon className="h-3.5 w-3.5" />}
                              {u.twoFactorEnabled ? "2FA On" : "Standard"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge blocked={u.blocked} />
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs tabular-nums font-medium">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </td>
                          {canWrite && (
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === u._id ? null : u._id)}
                              className={`p-1.5 rounded-lg transition-colors ${menuOpenId === u._id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                              <DotsVerticalIcon className="h-4 w-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpenId === u._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)}></div>
                                <div className={`absolute right-8 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 ring-1 ring-black/10 z-50 overflow-hidden animate-in zoom-in-95 duration-100 ${isLastRows ? 'bottom-8 mb-1 origin-bottom-right' : 'top-8 mt-1 origin-top-right'}`}>
                                  <div className="p-1 space-y-0.5">
                                    <MenuItem onClick={() => { handleToggleBlock(u); setMenuOpenId(null); }} icon={u.blocked ? CheckCircleIcon : BanIcon} label={u.blocked ? "Unblock User" : "Block Access"} />
                                    <MenuItem onClick={() => { setResetUser(u); setMenuOpenId(null); }} icon={KeyIcon} label="Reset Password" />
                                    {u.twoFactorEnabled && (
                                      <MenuItem onClick={() => { handleDisable2FA(u); setMenuOpenId(null); }} icon={LockClosedIcon} label="Disable 2FA" />
                                    )}
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <MenuItem onClick={() => { setDeleteUser(u); setMenuOpenId(null); }} icon={TrashIcon} label="Delete Account" danger />
                                  </div>
                                </div>
                              </>
                            )}
                          </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View (< lg) */}
              <div className="lg:hidden divide-y divide-slate-100">
                {currentUsers.map((u) => {
                  const isAdminRole = Array.isArray(u.roles) && u.roles.includes("admin");
                  return (
                    <div key={u._id} className="p-3.5 space-y-2 hover:bg-slate-50/50 transition">
                      {/* Top Row: User Avatar, Name, and Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={u.profileImage}
                            name={u.name}
                            email={u.email}
                            className="h-9 w-9 rounded-xl shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{u.name || "User"}</p>
                              {isAdminRole && (
                                <span className="text-[9px] font-bold bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded-full border border-orange-100">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <StatusBadge blocked={u.blocked} />
                          {u.twoFactorEnabled && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-100">
                              2FA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Metadata & Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400">
                        <span>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>

                        {canWrite && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleBlock(u)}
                              className={`font-bold transition ${u.blocked ? "text-emerald-600 hover:text-emerald-700" : "text-slate-600 hover:text-slate-900"}`}
                            >
                              {u.blocked ? "Unblock" : "Block"}
                            </button>
                            <span>·</span>
                            <button onClick={() => setResetUser(u)} className="font-bold text-slate-600 hover:text-slate-900">
                              Reset
                            </button>
                            <span>·</span>
                            <button onClick={() => setDeleteUser(u)} className="font-bold text-red-600 hover:text-red-700">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="px-4 sm:px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40 text-xs sm:text-sm text-slate-500">
                <div>
                  <span className="font-bold text-slate-900">{startIndex + 1}-{Math.min(endIndex, filtered.length)}</span> of <span className="font-bold text-slate-900">{filtered.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1.5">
                    {currentPage}/{totalPages || 1}
                  </span>
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-xs"><ChevronLeftIcon className="h-4 w-4 text-slate-600" /></button>
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-xs"><ChevronRightIcon className="h-4 w-4 text-slate-600" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {resetUser && (
        <Modal title="Reset Password" icon={KeyIcon} onClose={() => !busyAction && setResetUser(null)}>
          <p className="text-xs sm:text-sm text-slate-600">Send a password reset email to <span className="font-bold text-slate-900">{resetUser.email}</span>?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setResetUser(null)} disabled={busyAction} className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
            <button onClick={confirmResetPassword} disabled={busyAction} className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs">{busyAction ? "Sending..." : "Send Email"}</button>
          </div>
        </Modal>
      )}

      {deleteUser && (
        <Modal title="Delete Account" icon={TrashIcon} danger onClose={() => !busyAction && setDeleteUser(null)}>
          <p className="text-xs sm:text-sm text-slate-600">Permanently remove <span className="font-bold text-slate-900">{deleteUser.email}</span>? This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDeleteUser(null)} disabled={busyAction} className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
            <button onClick={confirmDeleteUser} disabled={busyAction} className="rounded-xl bg-red-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-xs">{busyAction ? "Deleting..." : "Delete User"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* --- Sub Components for Cleaner Code --- */

function StatCard({ label, fullLabel, value, icon: Icon, color }) {
  const colors = {
    blue: "text-[#5f5a52] bg-[#ece8df]",
    emerald: "text-[#59634f] bg-[#e5e8df]",
    red: "text-[#75483b] bg-[#eee2dc]"
  };
  return (
    <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="sm:hidden">{label}</span>
          <span className="hidden sm:inline">{fullLabel || label}</span>
        </p>
        <p className="text-base sm:text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
      <div className={`p-1.5 sm:p-3 rounded-xl ${colors[color]}`}>
        <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${active ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
        }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ blocked }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${blocked ? badgeStyles.blocked : badgeStyles.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${blocked ? "bg-red-500" : "bg-blue-500"}`}></span>
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

function Th({ children, onClick, active, dir }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={onClick}>
      <div className="flex items-center gap-1 group-hover:text-slate-800 transition-colors">
        {children}
        {active && <span className="text-orange-500">{dir === "asc" ? "▲" : "▼"}</span>}
      </div>
    </th>
  );
}

function MenuItem({ onClick, icon: Icon, label, danger }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
