import React from "react";
import { FaCheck, FaChevronLeft, FaTimes, FaUndo } from "react-icons/fa";
import { STATUS_CONFIG } from "./supportConfig";

export default function ThreadHeader({ conversation, canWrite, onBack, onAction }) {
  return (
    <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-white">
      {/* Left: Back button + Avatar + Customer Name & Meta */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          onClick={() => onBack()}
          className="lg:hidden h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition"
          title="Back to conversations"
        >
          <FaChevronLeft size={11} className="-ml-0.5" />
        </button>

        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
          {(conversation.userId?.name || "C").slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
              {conversation.userId?.name || "Customer"}
            </p>
            <span
              className={`hidden sm:inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${STATUS_CONFIG[conversation.status]?.text || ""}`}
            >
              {conversation.status?.replace("_", " ")}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate font-medium">
            {conversation.userId?.email || "customer"}
          </p>
        </div>
      </div>

      {/* Right: Primary Action Button & Status Pill */}
      {canWrite && (
        <div className="flex items-center gap-1.5 shrink-0">
          {!conversation.assignedAgentId && (
            <button
              onClick={() => onAction("claim")}
              className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold hover:bg-black transition shadow-xs"
            >
              Claim
            </button>
          )}
          {conversation.status !== "RESOLVED" && conversation.status !== "CLOSED" && (
            <button
              onClick={() => onAction("resolve")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition shadow-xs"
            >
              <FaCheck size={9} />
              <span>Resolve</span>
            </button>
          )}
          {conversation.status === "RESOLVED" && (
            <button
              onClick={() => onAction("reopen")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 transition shadow-xs"
            >
              <FaUndo size={9} />
              <span>Reopen</span>
            </button>
          )}
          {conversation.status !== "CLOSED" && (
            <button
              onClick={() => onAction("close")}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close conversation"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
