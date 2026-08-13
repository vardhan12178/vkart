import React from "react";

// Shared confirm/detail modal shell used across admin pages. Previously
// duplicated (identically) in AdminUsers.js and AdminEmployees.js.
export default function Modal({ title, icon: Icon, children, onClose, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${danger ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
