import React, { useState } from "react";
import axios from "../axiosInstance";
import { LockIcon, PencilIcon } from "../ui/icons";

const EMPTY = { current: "", next: "", confirm: "", loading: false };
const INPUT =
  "w-full px-3 py-2 rounded-xl border border-line-strong focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none text-xs transition-all";

const Field = ({ label, ...props }) => (
  <div>
    <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1 block">
      {label}
    </label>
    <input type="password" className={INPUT} {...props} />
  </div>
);

export default function PasswordCard({ notify }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState(EMPTY);
  const set = (key) => (e) => setPw((s) => ({ ...s, [key]: e.target.value }));

  const submit = async () => {
    const { current, next, confirm } = pw;
    if (!current || !next || !confirm) return notify("error", "All fields are required.");
    if (next.length < 8) return notify("error", "New password must be at least 8 characters.");
    if (next !== confirm) return notify("error", "New passwords do not match.");
    try {
      setPw((s) => ({ ...s, loading: true }));
      await axios.put("/api/profile/password", {
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      notify("success", "Password changed successfully!");
      setPw(EMPTY);
      setOpen(false);
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to change password.");
      setPw((s) => ({ ...s, loading: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-line shadow-xs relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${open ? "bg-accent" : "bg-line"}`} />
      <div className="flex flex-row justify-between items-center gap-3">
        <div className="flex gap-2.5 sm:gap-4 items-center">
          <div
            className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-xs sm:text-lg shrink-0 ${open ? "bg-accent/10 text-accent" : "bg-tint text-muted-light"}`}
          >
            <LockIcon />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-bold text-ink">Password</h3>
            <p className="text-muted text-[11px] sm:text-xs">Update your security password</p>
          </div>
        </div>
        <button
          onClick={() => {
            setOpen((o) => !o);
            setPw(EMPTY);
          }}
          className="px-3 py-1.5 rounded-xl border border-line-strong text-ink-soft font-bold hover:bg-sand transition text-xs flex items-center gap-1 shrink-0"
        >
          <PencilIcon size={10} /> {open ? "Cancel" : "Change"}
        </button>
      </div>

      {open && (
        <div className="mt-3.5 sm:mt-5 space-y-2.5 max-w-sm">
          <Field
            label="Current Password"
            autoComplete="current-password"
            value={pw.current}
            onChange={set("current")}
            placeholder="••••••••"
          />
          <Field
            label="New Password"
            autoComplete="new-password"
            value={pw.next}
            onChange={set("next")}
            placeholder="Min 8 characters"
          />
          <Field
            label="Confirm Password"
            autoComplete="new-password"
            value={pw.confirm}
            onChange={set("confirm")}
            placeholder="Re-enter new password"
          />
          <button
            onClick={submit}
            disabled={pw.loading}
            className="w-full py-2 rounded-xl bg-ink text-white font-bold shadow-xs hover:bg-black transition-all disabled:opacity-50 text-xs"
          >
            {pw.loading ? "Saving..." : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
}
