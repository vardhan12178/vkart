import React from "react";
import { UserIcon } from "../ui/icons";

const Detail = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-bold text-muted-light uppercase tracking-wider">{label}</p>
    <p className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">{children}</p>
  </div>
);

export default function PersonalDetailsCard({ user }) {
  return (
    <div className="bg-white rounded-2xl border border-line shadow-xs p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <UserIcon className="text-muted-light text-xs" />
        <h3 className="text-xs sm:text-sm font-bold text-ink">Personal Details</h3>
      </div>
      <div className="space-y-2.5">
        <Detail label="Full Name">{user?.name || "—"}</Detail>
        <Detail label="Email">{user?.email || "—"}</Detail>
        <Detail label="Username">{user?.username ? `@${user.username}` : "Not set"}</Detail>
      </div>
    </div>
  );
}
