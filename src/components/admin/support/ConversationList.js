import React from "react";
import { Bone, SkeletonRegion } from "../../ui/Skeleton";
import { STATUS_CONFIG, TABS } from "./supportConfig";

const lastMessagePreview = (c) => {
  const last = c.messages?.[c.messages.length - 1];
  if (!last) return "No messages yet";
  return `${last.sender === "AGENT" ? "You: " : ""}${last.text}`.slice(0, 75);
};

export default function ConversationList({
  activeTab,
  setActiveTab,
  loading,
  conversations,
  selectedId,
  onSelect,
}) {
  return (
    <>
      <div className="flex items-center gap-1 border-b border-slate-100 shrink-0 overflow-x-auto no-scrollbar bg-slate-50/50 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl whitespace-nowrap transition-all text-center ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-xs ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
            }`}
          >
            <span className="sm:hidden">{tab.mobileLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading && (
          <SkeletonRegion label="Loading conversations" className="space-y-1 p-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Bone className="h-9 w-9 shrink-0" rounded="rounded-full" />
                <div className="flex-1">
                  <Bone className="h-3 w-2/3" />
                  <Bone className="mt-2 h-3 w-1/2" />
                </div>
              </div>
            ))}
          </SkeletonRegion>
        )}
        {!loading && conversations.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No conversations in this queue.
          </div>
        )}
        {conversations.map((c) => {
          const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.CLOSED;
          return (
            <button
              key={c._id}
              onClick={() => onSelect(c._id)}
              className={`w-full text-left p-3 sm:p-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 ${
                selectedId === c._id ? "bg-slate-50/90 border-l-4 border-l-slate-900" : ""
              }`}
            >
              <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {(c.userId?.name || "C").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {c.userId?.name || "Customer"}
                  </span>
                  <span
                    className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${cfg.text}`}
                  >
                    {c.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {lastMessagePreview(c)}
                </p>
                {c.contextSummary && (
                  <span className="inline-block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {c.contextSummary}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
