import React from "react";
import { SearchIcon } from "@heroicons/react/outline";
import TabButton from "../ui/TabButton";

export default function UserToolbar({
  search,
  setSearch,
  filterBlocked,
  setFilterBlocked,
  filterTwoFA,
  setFilterTwoFA,
}) {
  return (
    <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col lg:flex-row gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or ID..."
          className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-xs sm:text-sm font-medium outline-none"
        />
      </div>

      <div className="h-px w-full bg-slate-100 lg:h-auto lg:w-px lg:bg-slate-100"></div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 px-1 pb-1 lg:pb-0 overflow-x-auto no-scrollbar">
        <div className="flex bg-slate-100/80 p-0.5 sm:p-1 rounded-xl">
          <TabButton
            label="All"
            active={filterBlocked === "all"}
            onClick={() => setFilterBlocked("all")}
          />
          <TabButton
            label="Active"
            active={filterBlocked === "active"}
            onClick={() => setFilterBlocked("active")}
          />
          <TabButton
            label="Blocked"
            active={filterBlocked === "blocked"}
            onClick={() => setFilterBlocked("blocked")}
          />
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

        <div className="flex bg-slate-100/80 p-0.5 sm:p-1 rounded-xl">
          <TabButton
            label="All Security"
            active={filterTwoFA === "all"}
            onClick={() => setFilterTwoFA("all")}
          />
          <TabButton
            label="2FA Only"
            active={filterTwoFA === "on"}
            onClick={() => setFilterTwoFA("on")}
          />
        </div>
      </div>
    </div>
  );
}
