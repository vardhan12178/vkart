import React from "react";
import { BanIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/outline";
import StatTile from "../ui/StatTile";

export default function UserStats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <StatTile
        label="Total"
        fullLabel="Total Accounts"
        value={stats.total}
        icon={UserGroupIcon}
        tone="text-[#5f5a52] bg-[#ece8df]"
      />
      <StatTile
        label="2FA"
        fullLabel="Secured with 2FA"
        value={stats.twoFAEnabled}
        icon={ShieldCheckIcon}
        tone="text-[#59634f] bg-[#e5e8df]"
      />
      <StatTile
        label="Blocked"
        fullLabel="Blocked / Suspended"
        value={stats.blocked}
        icon={BanIcon}
        tone="text-[#75483b] bg-[#eee2dc]"
      />
    </div>
  );
}
