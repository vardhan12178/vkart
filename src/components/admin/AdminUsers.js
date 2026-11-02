import React from "react";
import {
  DownloadIcon,
  ExclamationCircleIcon,
  FilterIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import usePermission from "./usePermission";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import AdminToast from "./ui/AdminToast";
import Pagination from "./ui/Pagination";
import { DeleteUserDialog, ResetPasswordDialog } from "./users/UserDialogs";
import UserCards from "./users/UserCards";
import UserStats from "./users/UserStats";
import UserTable from "./users/UserTable";
import UserToolbar from "./users/UserToolbar";
import useUsers, { PAGE_SIZE } from "./users/useUsers";

export default function AdminUsers() {
  const { canWrite } = usePermission("users");
  const u = useUsers();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <AdminToast toast={u.toast} />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Users
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Manage access and security for all accounts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs sm:text-sm font-semibold shadow-xs hover:bg-slate-50 transition-all">
              <DownloadIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={u.refresh}
              disabled={u.refreshing}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:bg-slate-800 transition-all disabled:opacity-70 active:scale-95 shrink-0"
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${u.refreshing ? "animate-spin" : ""}`}
              />
              <span>{u.refreshing ? "Syncing..." : "Sync Users"}</span>
            </button>
          </div>
        </div>

        <UserStats stats={u.stats} />

        <UserToolbar
          search={u.search}
          setSearch={u.setSearch}
          filterBlocked={u.filterBlocked}
          setFilterBlocked={u.setFilterBlocked}
          filterTwoFA={u.filterTwoFA}
          setFilterTwoFA={u.setFilterTwoFA}
        />

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
          {u.loading ? (
            <div className="p-4 sm:p-6">
              <SkeletonRegion label="Loading users">
                <TableSkeleton rows={4} cols={5} />
              </SkeletonRegion>
            </div>
          ) : u.error ? (
            <div className="p-8 text-center text-red-600 text-xs sm:text-sm">
              <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{u.error}</p>
            </div>
          ) : u.filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
                <FilterIcon className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">No users found</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Try adjusting your filters or search keyword.
              </p>
              <button
                onClick={u.resetFilters}
                className="mt-3 text-orange-600 font-bold text-xs hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <UserTable
                users={u.pageUsers}
                canWrite={canWrite}
                sortKey={u.sortKey}
                sortDir={u.sortDir}
                onSort={u.toggleSort}
                onToggleBlock={u.toggleBlock}
                onReset={u.askReset}
                onDisable2FA={u.disable2FA}
                onDelete={u.askDelete}
              />
              <UserCards
                users={u.pageUsers}
                canWrite={canWrite}
                onToggleBlock={u.toggleBlock}
                onReset={u.askReset}
                onDelete={u.askDelete}
              />
              <Pagination
                page={u.page}
                pageSize={PAGE_SIZE}
                total={u.filtered.length}
                onPage={u.setPage}
              />
            </>
          )}
        </div>
      </div>

      {u.resetUser && (
        <ResetPasswordDialog
          user={u.resetUser}
          busy={u.busyAction}
          onCancel={u.cancelReset}
          onConfirm={u.confirmResetPassword}
        />
      )}
      {u.deleteUser && (
        <DeleteUserDialog
          user={u.deleteUser}
          busy={u.busyAction}
          onCancel={u.cancelDelete}
          onConfirm={u.confirmDeleteUser}
        />
      )}
    </div>
  );
}
