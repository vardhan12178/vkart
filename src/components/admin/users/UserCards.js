import React from "react";
import Avatar from "../ui/Avatar";
import { StatusBadge } from "./userBadges";

// Phone / tablet layout (< lg)
export default function UserCards({ users, canWrite, onToggleBlock, onReset, onDelete }) {
  return (
    <div className="lg:hidden divide-y divide-slate-100">
      {users.map((u) => {
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
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {u.name || "User"}
                    </p>
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
              <span>
                Joined:{" "}
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>

              {canWrite && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBlock(u)}
                    className={`font-bold transition ${u.blocked ? "text-emerald-600 hover:text-emerald-700" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    {u.blocked ? "Unblock" : "Block"}
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => onReset(u)}
                    className="font-bold text-slate-600 hover:text-slate-900"
                  >
                    Reset
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => onDelete(u)}
                    className="font-bold text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
