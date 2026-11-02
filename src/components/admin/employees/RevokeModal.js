import React from "react";
import { TrashIcon } from "@heroicons/react/outline";
import Modal from "../ui/Modal";

export default function RevokeModal({ employee, pending, onCancel, onConfirm }) {
  return (
    <Modal title="Revoke Access" icon={TrashIcon} danger onClose={() => !pending && onCancel()}>
      <p className="text-sm text-slate-600">
        Remove admin panel access for{" "}
        <span className="font-bold text-slate-900">{employee.email}</span>? They'll lose their role
        and every module permission — their regular storefront account is unaffected.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={pending}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={pending}
          className="rounded-full bg-[#75483b] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#60372e]"
        >
          {pending ? "Revoking..." : "Revoke Access"}
        </button>
      </div>
    </Modal>
  );
}
