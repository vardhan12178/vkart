import React from "react";
import { PencilIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/outline";
import { MODULES, ROLE_LABELS } from "../../../constants/adminRoles";
import Avatar from "../ui/Avatar";

// Phone layout
export default function EmployeeCards({ employees, canWrite, myRole, onEdit, onRevoke }) {
  return (
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
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {emp.name || "Unnamed"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{emp.email}</p>
                </div>
              </div>

              <span
                className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isSuperAdmin ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}
              >
                {isSuperAdmin && <ShieldCheckIcon className="h-3 w-3 text-orange-600" />}
                <span>
                  {emp.adminRole ? ROLE_LABELS[emp.adminRole] || emp.adminRole : "Unassigned"}
                </span>
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
                    <span
                      key={mod}
                      className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60"
                    >
                      {MODULES.find((m) => m.key === mod)?.label || mod} ·{" "}
                      <span
                        className={
                          level === "write" ? "text-orange-700 font-extrabold" : "text-slate-500"
                        }
                      >
                        {level}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Row: Actions */}
            {canWrite && (!isSuperAdmin || myRole === "super_admin") && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => onEdit(emp)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs"
                >
                  <PencilIcon className="h-3 w-3" />
                  <span>Edit Access</span>
                </button>
                <button
                  onClick={() => onRevoke(emp)}
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
  );
}
