import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import useAdminToast from "../ui/useAdminToast";

const ADMIN_USERS_ENDPOINT = "/api/admin/users";
export const PAGE_SIZE = 10;

const sortValue = (u, key) => {
  if (key === "name") return (u.name || "").toLowerCase();
  if (key === "email") return (u.email || "").toLowerCase();
  return new Date(u.createdAt || 0).getTime();
};

export default function useUsers() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useAdminToast();

  const [search, setSearch] = useState("");
  const [filterTwoFA, setFilterTwoFA] = useState("all"); // all | on | off
  const [filterBlocked, setFilterBlocked] = useState("all"); // all | blocked | active
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [resetUser, setResetUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const usersQuery = useQuery({
    queryKey: qk.admin.users,
    queryFn: async () => {
      const res = await axiosInstance.get(ADMIN_USERS_ENDPOINT);
      const data = res.data;
      return Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
    },
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const syncUsers = () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.users });
    queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
  };

  const toggleBlockMutation = useMutation({
    mutationFn: ({ userId, blocked }) =>
      axiosInstance.patch(`/api/admin/users/${userId}/block`, { blocked }),
    onSuccess: syncUsers,
  });
  const disable2faMutation = useMutation({
    mutationFn: (userId) => axiosInstance.patch(`/api/admin/users/${userId}/disable-2fa`),
    onSuccess: syncUsers,
  });
  const resetPasswordMutation = useMutation({
    mutationFn: (userId) => axiosInstance.post(`/api/admin/users/${userId}/reset-password`),
  });
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/api/admin/users/${userId}`),
    onSuccess: syncUsers,
  });

  const busyAction =
    toggleBlockMutation.isPending ||
    disable2faMutation.isPending ||
    resetPasswordMutation.isPending ||
    deleteUserMutation.isPending;

  const stats = useMemo(
    () => ({
      total: users.length,
      twoFAEnabled: users.filter((u) => u.twoFactorEnabled).length,
      blocked: users.filter((u) => u.blocked).length,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = [...users];

    if (q) {
      out = out.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q) ||
          String(u._id || "")
            .toLowerCase()
            .includes(q)
      );
    }

    if (filterTwoFA === "on") out = out.filter((u) => u.twoFactorEnabled);
    else if (filterTwoFA === "off") out = out.filter((u) => !u.twoFactorEnabled);

    if (filterBlocked === "blocked") out = out.filter((u) => u.blocked);
    else if (filterBlocked === "active") out = out.filter((u) => !u.blocked);

    out.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [users, search, filterTwoFA, filterBlocked, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, filterTwoFA, filterBlocked]);

  const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  };

  async function toggleBlock(user) {
    try {
      await toggleBlockMutation.mutateAsync({ userId: user._id, blocked: !user.blocked });
      showToast(!user.blocked ? "User blocked." : "User activated.");
    } catch {
      showToast("Update failed.", "error");
    }
  }

  async function disable2FA(user) {
    try {
      await disable2faMutation.mutateAsync(user._id);
      showToast("2FA Disabled.");
    } catch {
      showToast("Failed to disable 2FA.", "error");
    }
  }

  async function confirmResetPassword() {
    if (!resetUser) return;
    try {
      await resetPasswordMutation.mutateAsync(resetUser._id);
      showToast("Reset email sent.");
      setResetUser(null);
    } catch {
      showToast("Reset failed.", "error");
    }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    try {
      await deleteUserMutation.mutateAsync(deleteUser._id);
      showToast("User deleted.");
      setDeleteUser(null);
    } catch {
      showToast("Delete failed.", "error");
    }
  }

  return {
    toast,
    loading: usersQuery.isLoading,
    refreshing: usersQuery.isFetching && !usersQuery.isLoading,
    error: usersQuery.isError ? "Unable to load users. Please try again." : null,
    refresh: () => usersQuery.refetch(),
    stats,
    search,
    setSearch,
    filterTwoFA,
    setFilterTwoFA,
    filterBlocked,
    setFilterBlocked,
    resetFilters: () => {
      setSearch("");
      setFilterBlocked("all");
      setFilterTwoFA("all");
    },
    sortKey,
    sortDir,
    toggleSort,
    filtered,
    pageUsers,
    page,
    setPage,
    busyAction,
    toggleBlock,
    disable2FA,
    resetUser,
    askReset: setResetUser,
    cancelReset: () => setResetUser(null),
    confirmResetPassword,
    deleteUser,
    askDelete: setDeleteUser,
    cancelDelete: () => setDeleteUser(null),
    confirmDeleteUser,
  };
}
