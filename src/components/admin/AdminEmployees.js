import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  MailIcon,
  RefreshIcon
} from "@heroicons/react/outline";
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import { ROLE_LABELS, ROLE_PRESETS, MODULES } from "../../constants/adminRoles";
import Avatar from "./ui/Avatar";
import Modal from "./ui/Modal";

const EMPLOYEES_ENDPOINT = "/api/admin/employees";

export default function AdminEmployees() {
  const queryClient = useQueryClient();
  const { adminRole: myRole, canWrite } = usePermission("employees");

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const employeesQuery = useQuery({
    queryKey: qk.admin.employees,
    queryFn: async () => {
      const res = await axiosInstance.get(EMPLOYEES_ENDPOINT);
      return res.data?.employees || [];
    },
  });

  const employees = employeesQuery.data ?? [];

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.admin.employees });

  const addMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post(EMPLOYEES_ENDPOINT, payload),
    onSuccess: () => {
      invalidate();
      showToast("Employee added.");
      closeModal();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to add employee.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => axiosInstance.patch(`${EMPLOYEES_ENDPOINT}/${id}`, payload),
    onSuccess: () => {
      invalidate();
      showToast("Access updated.");
      closeModal();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to update access.", "error"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`${EMPLOYEES_ENDPOINT}/${id}`),
    onSuccess: () => {
      invalidate();
      showToast("Access revoked.");
      setRevokeTarget(null);
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to revoke access.", "error"),
  });

  function closeModal() {
    setModalMode(null);
    setEditingEmployee(null);
  }

  function openAdd() {
    setEditingEmployee(null);
    setModalMode("add");
  }

  function openEdit(employee) {
    setEditingEmployee(employee);
    setModalMode("edit");
  }

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {toast && (
          <div className={`fixed z-50 top-5 right-5 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type === "error" ? "bg-white border-red-100 text-red-800" : "bg-white border-emerald-100 text-emerald-800"}`}>
            {toast.type === "error" ? <ExclamationCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              Employees
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium truncate">
              Manage admin panel access and permissions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => employeesQuery.refetch()}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs text-slate-600"
              title="Refresh"
            >
              <RefreshIcon className={`h-4 w-4 ${employeesQuery.isFetching ? "animate-spin" : ""}`} />
            </button>
            {canWrite && (
              <button
                onClick={openAdd}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shadow-xs shrink-0 whitespace-nowrap active:scale-95"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Employee</span>
                <span className="sm:hidden">Employee</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Employees Content */}
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
          {employeesQuery.isLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-50 rounded-xl w-full" />)}
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">No employees yet</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Add someone to give them scoped admin access.</p>
              {canWrite && (
                <button onClick={openAdd} className="mt-3 text-orange-600 font-bold text-xs hover:underline">
                  + Add First Employee
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Access</th>
                      {canWrite && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {employees.map((emp) => {
                      const isSuperAdmin = emp.adminRole === "super_admin";
                      const grantedModules = Object.entries(emp.permissions || {});
                      return (
                        <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={emp.profileImage}
                                name={emp.name}
                                email={emp.email}
                                className="h-10 w-10 rounded-xl shadow-xs"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{emp.name || "Unnamed"}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                                  <MailIcon className="h-3 w-3" />
                                  <span>{emp.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${isSuperAdmin ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {isSuperAdmin && <ShieldCheckIcon className="h-3.5 w-3.5 text-orange-600" />}
                              <span>{emp.adminRole ? ROLE_LABELS[emp.adminRole] || emp.adminRole : "Unassigned"}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isSuperAdmin ? (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Full Access</span>
                            ) : grantedModules.length === 0 ? (
                              <span className="text-xs text-slate-400">No modules granted</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {grantedModules.map(([mod, level]) => (
                                  <span key={mod} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                                    {MODULES.find((m) => m.key === mod)?.label || mod} · <span className={level === "write" ? "text-orange-700 font-extrabold" : "text-slate-500"}>{level}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          {canWrite && (
                            <td className="px-6 py-4 text-right">
                              {(!isSuperAdmin || myRole === "super_admin") && (
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition" title="Manage access">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => setRevokeTarget(emp)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Revoke access">
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< md) */}
              <div className="md:hidden divide-y divide-slate-100">
                {employees.map((emp) => {
                  const isSuperAdmin = emp.adminRole === "super_admin";
                  const grantedModules = Object.entries(emp.permissions || {});
                  return (
                    <div key={emp._id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50 transition">
                      {/* Top Row: Avatar, Name, Email, and Role Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={emp.profileImage}
                            name={emp.name}
                            email={emp.email}
                            className="h-10 w-10 rounded-xl shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{emp.name || "Unnamed"}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{emp.email}</p>
                          </div>
                        </div>

                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isSuperAdmin ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {isSuperAdmin && <ShieldCheckIcon className="h-3 w-3 text-orange-600" />}
                          <span>{emp.adminRole ? ROLE_LABELS[emp.adminRole] || emp.adminRole : "Unassigned"}</span>
                        </span>
                      </div>

                      {/* Permissions Row */}
                      <div className="pt-1 text-xs">
                        {isSuperAdmin ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Full Admin Access
                          </span>
                        ) : grantedModules.length === 0 ? (
                          <span className="text-[11px] text-slate-400">No modules granted</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {grantedModules.map(([mod, level]) => (
                              <span key={mod} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60">
                                {MODULES.find((m) => m.key === mod)?.label || mod} · <span className={level === "write" ? "text-orange-700 font-extrabold" : "text-slate-500"}>{level}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Actions */}
                      {canWrite && (!isSuperAdmin || myRole === "super_admin") && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                          <button
                            onClick={() => openEdit(emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs"
                          >
                            <PencilIcon className="h-3 w-3" />
                            <span>Edit Access</span>
                          </button>
                          <button
                            onClick={() => setRevokeTarget(emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-100 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition shadow-xs"
                          >
                            <TrashIcon className="h-3 w-3" />
                            <span>Revoke</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {modalMode && (
        <EmployeeModal
          mode={modalMode}
          employee={editingEmployee}
          myRole={myRole}
          busy={addMutation.isPending || updateMutation.isPending}
          onClose={closeModal}
          onSubmit={(payload) => {
            if (modalMode === "add") addMutation.mutate(payload);
            else updateMutation.mutate({ id: editingEmployee._id, payload });
          }}
        />
      )}

      {revokeTarget && (
        <Modal title="Revoke Access" icon={TrashIcon} danger onClose={() => !revokeMutation.isPending && setRevokeTarget(null)}>
          <p className="text-sm text-slate-600">
            Remove admin panel access for <span className="font-bold text-slate-900">{revokeTarget.email}</span>? They'll lose their role and every module permission — their regular storefront account is unaffected.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setRevokeTarget(null)} disabled={revokeMutation.isPending} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={() => revokeMutation.mutate(revokeTarget._id)} disabled={revokeMutation.isPending} className="rounded-full bg-[#75483b] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#60372e]">
              {revokeMutation.isPending ? "Revoking..." : "Revoke Access"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EmployeeModal({ mode, employee, myRole, busy, onClose, onSubmit }) {
  const [email, setEmail] = useState(employee?.email || "");
  const [role, setRole] = useState(employee?.adminRole || "");
  const [perms, setPerms] = useState(employee?.permissions || {});

  const isSuperAdmin = role === "super_admin";
  const canAssignSuperAdmin = myRole === "super_admin";

  function handleRoleChange(newRole) {
    setRole(newRole);
    // Pre-fill the matrix from the preset; still editable afterward.
    setPerms(newRole === "super_admin" ? {} : { ...(ROLE_PRESETS[newRole] || {}) });
  }

  function cycleModule(moduleKey) {
    setPerms((prev) => {
      const current = prev[moduleKey];
      const next = { ...prev };
      if (!current) next[moduleKey] = "read";
      else if (current === "read") next[moduleKey] = "write";
      else delete next[moduleKey];
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!role) return;
    const payload = { adminRole: role, permissions: isSuperAdmin ? {} : perms };
    if (mode === "add") payload.email = email.trim().toLowerCase();
    onSubmit(payload);
  }

  return (
    <Modal title={mode === "add" ? "Add Employee" : "Manage Access"} icon={UserGroupIcon} onClose={() => !busy && onClose()}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "add" ? (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@example.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="text-xs text-slate-400 mt-1">Must already have a VKart account.</p>
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{employee.email}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
          <select
            required
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="" disabled>Select a role...</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              (value !== "super_admin" || canAssignSuperAdmin) && (
                <option key={value} value={value}>{label}</option>
              )
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Module Access</label>
          <div className={`grid grid-cols-2 gap-2 transition-opacity ${isSuperAdmin ? "opacity-40 pointer-events-none" : ""}`}>
            {MODULES.map((mod) => {
              const level = perms[mod.key];
              return (
                <button
                  type="button"
                  key={mod.key}
                  onClick={() => cycleModule(mod.key)}
                  disabled={isSuperAdmin}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${
                    level === "write"
                      ? "bg-slate-900 text-white border-slate-900"
                      : level === "read"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-white text-slate-400 border-slate-100"
                  }`}
                >
                  <span>{mod.label}</span>
                  <span className="uppercase tracking-wide">{level || "none"}</span>
                </button>
              );
            })}
          </div>
          {isSuperAdmin ? (
            <p className="text-xs text-slate-400 mt-2">Super admin has full access — module selection is irrelevant.</p>
          ) : (
            <p className="text-xs text-slate-400 mt-2">Tap a module to cycle: none → read → write.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
          <button type="submit" disabled={busy || !role} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-black rounded-lg shadow-lg shadow-slate-200 disabled:opacity-50">
            {busy ? "Saving..." : mode === "add" ? "Add Employee" : "Save Access"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
