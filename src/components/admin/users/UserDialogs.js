import React from "react";
import { KeyIcon, TrashIcon } from "@heroicons/react/outline";
import Modal from "../ui/Modal";

export function ResetPasswordDialog({ user, busy, onCancel, onConfirm }) {
  return (
    <Modal title="Reset Password" icon={KeyIcon} onClose={() => !busy && onCancel()}>
      <p className="text-xs sm:text-sm text-slate-600">
        Send a password reset email to{" "}
        <span className="font-bold text-slate-900">{user.email}</span>?
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs"
        >
          {busy ? "Sending..." : "Send Email"}
        </button>
      </div>
    </Modal>
  );
}

export function DeleteUserDialog({ user, busy, onCancel, onConfirm }) {
  return (
    <Modal title="Delete Account" icon={TrashIcon} danger onClose={() => !busy && onCancel()}>
      <p className="text-xs sm:text-sm text-slate-600">
        Permanently remove <span className="font-bold text-slate-900">{user.email}</span>? This
        cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="rounded-xl bg-red-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-xs"
        >
          {busy ? "Deleting..." : "Delete User"}
        </button>
      </div>
    </Modal>
  );
}
