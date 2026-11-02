import React, { useState } from "react";
import { UserGroupIcon } from "@heroicons/react/outline";
import { MODULES, ROLE_LABELS, ROLE_PRESETS } from "../../../constants/adminRoles";
import Modal from "../ui/Modal";

export default function EmployeeModal({ mode, employee, myRole, busy, onClose, onSubmit }) {
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
    <Modal
      title={mode === "add" ? "Add Employee" : "Manage Access"}
      icon={UserGroupIcon}
      onClose={() => !busy && onClose()}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "add" ? (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Role
          </label>
          <select
            required
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="" disabled>
              Select a role...
            </option>
            {Object.entries(ROLE_LABELS).map(
              ([value, label]) =>
                (value !== "super_admin" || canAssignSuperAdmin) && (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Module Access
          </label>
          <div
            className={`grid grid-cols-2 gap-2 transition-opacity ${isSuperAdmin ? "opacity-40 pointer-events-none" : ""}`}
          >
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
            <p className="text-xs text-slate-400 mt-2">
              Super admin has full access — module selection is irrelevant.
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              Tap a module to cycle: none → read → write.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !role}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-black rounded-lg shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {busy ? "Saving..." : mode === "add" ? "Add Employee" : "Save Access"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
