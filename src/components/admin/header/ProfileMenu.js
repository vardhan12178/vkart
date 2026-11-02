import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, CogIcon, LogoutIcon, UserIcon } from "@heroicons/react/outline";
import Avatar from "../ui/Avatar";
import useClickOutside from "./useClickOutside";

export default function ProfileMenu({
  adminName,
  adminEmail,
  adminAvatar,
  roleLabel,
  canReachSettings,
  onLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setProfileOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className={`
                  flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-full border transition-all duration-200
                  ${
                    profileOpen
                      ? "bg-[#fffdf8] border-[#a85d37]/25 ring-2 ring-[#a85d37]/8"
                      : "bg-[#fffdf8] border-black/10 hover:border-black/20"
                  }
                `}
        aria-label="Profile menu"
      >
        <Avatar
          src={adminAvatar}
          name={adminName}
          email={adminEmail}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white"
          bgClassName="bg-[#a85d37] text-white"
        />

        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-bold text-slate-800 leading-none max-w-[100px] truncate">
            {adminName}
          </span>
          <span className="text-[10px] font-medium text-slate-500 mt-0.5">{roleLabel}</span>
        </div>

        <ChevronDownIcon
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block ${profileOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {profileOpen && (
        <div className="absolute right-0 z-50 mt-3 w-56 origin-top-right overflow-hidden rounded-[1.15rem] border border-black/[0.08] bg-[#fffdf8] py-2 shadow-[0_24px_70px_rgba(29,28,25,.16)] animate-in fade-in zoom-in-95 duration-150 sm:w-64">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl sm:rounded-t-2xl">
            <p className="text-sm font-bold text-slate-900">{adminName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{adminEmail}</p>
          </div>

          <div className="py-2 px-2">
            <Link
              to="/admin/profile"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <UserIcon className="w-5 h-5 text-slate-400" />
              My Profile
            </Link>
            {canReachSettings && (
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <CogIcon className="w-5 h-5 text-slate-400" />
                Settings
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 my-1 px-2 pb-1 pt-1">
            <button
              onClick={() => onLogout?.()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#75483b] transition-colors hover:bg-[#eee2dc]"
              aria-label="Sign out of admin"
            >
              <LogoutIcon className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
