import React, { useState } from "react";
import {
  BanIcon,
  CheckCircleIcon,
  DotsVerticalIcon,
  KeyIcon,
  LockClosedIcon,
  MailIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import Avatar from "../ui/Avatar";
import SortableTh from "../ui/SortableTh";
import { StatusBadge, badgeStyles } from "./userBadges";
import MenuItem from "./MenuItem";

// Desktop layout (>= lg) with a per-row action menu
export default function UserTable({
  users,
  canWrite,
  sortKey,
  sortDir,
  onSort,
  onToggleBlock,
  onReset,
  onDisable2FA,
  onDelete,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  return (
    <div className="hidden lg:block overflow-x-auto min-h-[340px]">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <SortableTh onClick={() => onSort("name")} active={sortKey === "name"} dir={sortDir}>
              User
            </SortableTh>
            <SortableTh onClick={() => onSort("email")} active={sortKey === "email"} dir={sortDir}>
              Contact
            </SortableTh>
            <SortableTh>Security</SortableTh>
            <SortableTh>Status</SortableTh>
            <SortableTh
              onClick={() => onSort("createdAt")}
              active={sortKey === "createdAt"}
              dir={sortDir}
            >
              Joined
            </SortableTh>
            {canWrite && (
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((u, index) => {
            const isLastRows = index >= users.length - 2 || (users.length <= 3 && index >= 1);
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
                      <div className="text-[10px] text-slate-400 font-mono uppercase">
                        ID: {u._id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <MailIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {u.email}
                    </div>
                    {u.username && (
                      <span className="text-xs text-slate-400 pl-5">@{u.username}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.twoFactorEnabled ? badgeStyles.twoFAOn : badgeStyles.twoFAOff}`}
                  >
                    {u.twoFactorEnabled ? (
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <LockClosedIcon className="h-3.5 w-3.5" />
                    )}
                    {u.twoFactorEnabled ? "2FA On" : "Standard"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge blocked={u.blocked} />
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs tabular-nums font-medium">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                {canWrite && (
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === u._id ? null : u._id)}
                      className={`p-1.5 rounded-lg transition-colors ${menuOpenId === u._id ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"}`}
                    >
                      <DotsVerticalIcon className="h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpenId === u._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        ></div>
                        <div
                          className={`absolute right-8 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 ring-1 ring-black/10 z-50 overflow-hidden animate-in zoom-in-95 duration-100 ${isLastRows ? "bottom-8 mb-1 origin-bottom-right" : "top-8 mt-1 origin-top-right"}`}
                        >
                          <div className="p-1 space-y-0.5">
                            <MenuItem
                              onClick={() => {
                                onToggleBlock(u);
                                setMenuOpenId(null);
                              }}
                              icon={u.blocked ? CheckCircleIcon : BanIcon}
                              label={u.blocked ? "Unblock User" : "Block Access"}
                            />
                            <MenuItem
                              onClick={() => {
                                onReset(u);
                                setMenuOpenId(null);
                              }}
                              icon={KeyIcon}
                              label="Reset Password"
                            />
                            {u.twoFactorEnabled && (
                              <MenuItem
                                onClick={() => {
                                  onDisable2FA(u);
                                  setMenuOpenId(null);
                                }}
                                icon={LockClosedIcon}
                                label="Disable 2FA"
                              />
                            )}
                            <div className="h-px bg-slate-100 my-1"></div>
                            <MenuItem
                              onClick={() => {
                                onDelete(u);
                                setMenuOpenId(null);
                              }}
                              icon={TrashIcon}
                              label="Delete Account"
                              danger
                            />
                          </div>
                        </div>
                      </>
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
