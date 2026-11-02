import React, { useState } from "react";
import axios from "../axiosInstance";
import {
  CameraIcon,
  CircleCheckIcon,
  CrownIcon,
  PencilIcon,
  ShoppingBagIcon,
  XIcon,
} from "../ui/icons";

const getInitials = (name) => {
  if (!name) return "VK";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Avatar, editable display name, membership badge and order count.
export default function ProfileHeader({ user, ordersCount, onPickPhoto, patchUser, notify }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const saveName = async () => {
    if (!nameInput.trim()) return;
    try {
      const res = await axios.put("/api/profile/name", { name: nameInput.trim() });
      patchUser({ name: res.data.name });
      setEditingName(false);
      notify("success", "Name updated!");
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to update name.");
    }
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-line/90 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-accent/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative flex flex-row items-center gap-3.5 sm:gap-6 z-10">
        <div className="relative group shrink-0">
          <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full p-1 bg-white shadow-sm ring-1 ring-line overflow-hidden">
            {user?.profileImage && (
              <img
                src={user.profileImage}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
            )}
            <div
              className={`avatar-fallback h-full w-full rounded-full bg-gradient-to-tr from-tint to-tint flex items-center justify-center ${user?.profileImage ? "hidden" : ""}`}
            >
              <span className="text-xl sm:text-3xl font-black text-accent/80 tracking-wide select-none">
                {getInitials(user?.name)}
              </span>
            </div>
          </div>

          <label
            htmlFor="file-upload"
            className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 p-1.5 sm:p-2 bg-ink text-white rounded-full cursor-pointer shadow-sm hover:bg-accent transition-all border-2 border-white z-10"
            title="Change Photo"
          >
            <CameraIcon className="text-[9px] sm:text-xs" />
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
          </label>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="text-base sm:text-2xl font-bold text-ink tracking-tight bg-transparent border-b-2 border-accent focus:outline-none px-1"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="p-1 rounded-md bg-ink text-white text-xs font-bold hover:bg-black"
                >
                  <CircleCheckIcon size={12} />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="p-1 rounded-md text-muted-light hover:text-muted"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ) : (
              <h1
                className="profile-display-name text-base sm:text-2xl font-bold text-ink tracking-tight group/name cursor-pointer inline-flex items-center gap-1.5"
                onClick={() => {
                  setNameInput(user?.name || "");
                  setEditingName(true);
                }}
              >
                <span className="truncate">{user?.name || "Guest User"}</span>
                <PencilIcon className="text-[10px] sm:text-xs text-muted-faint group-hover/name:text-accent transition-colors shrink-0" />
              </h1>
            )}
            {user?.isPrime ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/30 shadow-2xs shrink-0">
                <CrownIcon size={8} className="text-accent" />
                Prime
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-[#8f4c2b] text-[10px] font-bold uppercase tracking-wider border border-accent/30 shrink-0">
                Member
              </span>
            )}
          </div>

          <div className="text-muted font-medium flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-xs">
            <span className="truncate">{user?.email}</span>
            {user?.username && (
              <span className="text-muted-light text-[11px] hidden sm:inline">
                @{user.username}
              </span>
            )}
          </div>

          <div className="mt-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand rounded-lg border border-line text-xs">
              <ShoppingBagIcon className="text-accent text-[11px]" />
              <span className="font-bold text-ink">{ordersCount}</span>
              <span className="text-[10px] text-muted font-medium">Orders Placed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
