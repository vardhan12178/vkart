import React from "react";
import { MailIcon, PencilIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/outline";
import { MODULES, ROLE_LABELS } from "../../../constants/adminRoles";
import Avatar from "../ui/Avatar";

// Desktop layout
export default function EmployeeTable({ employees, canWrite, myRole, onEdit, onRevoke }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              Access
            </th>
            {canWrite && (
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            )}
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
                      <div className="font-bold text-slate-900 text-sm">
                        {emp.name || "Unnamed"}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                        <MailIcon className="h-3 w-3" />
                        <span>{emp.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${isSuperAdmin ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {isSuperAdmin && <ShieldCheckIcon className="h-3.5 w-3.5 text-orange-600" />}
                    <span>
                      {emp.adminRole ? ROLE_LABELS[emp.adminRole] || emp.adminRole : "Unassigned"}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isSuperAdmin ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Full Access
                    </span>
                  ) : grantedModules.length === 0 ? (
                    <span className="text-xs text-slate-400">No modules granted</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {grantedModules.map(([mod, level]) => (
                        <span
                          key={mod}
                          className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                        >
                          {MODULES.find((m) => m.key === mod)?.label || mod} ·{" "}
                          <span
                            className={
                              level === "write"
                                ? "text-orange-700 font-extrabold"
                                : "text-slate-500"
                            }
                          >
                            {level}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                {canWrite && (
                  <td className="px-6 py-4 text-right">
                    {(!isSuperAdmin || myRole === "super_admin") && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Manage access"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRevoke(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Revoke access"
                        >
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
  );
}
