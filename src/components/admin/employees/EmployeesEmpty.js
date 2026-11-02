import React from "react";
import { UserGroupIcon } from "@heroicons/react/outline";

export default function EmployeesEmpty({ canWrite, onAdd }) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center">
      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
        <UserGroupIcon className="h-6 w-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900">No employees yet</h3>
      <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
        Add someone to give them scoped admin access.
      </p>
      {canWrite && (
        <button onClick={onAdd} className="mt-3 text-orange-600 font-bold text-xs hover:underline">
          + Add First Employee
        </button>
      )}
    </div>
  );
}
