import React, { useEffect, useRef } from "react";
import { MessageSquare, Package } from "lucide-react";

export default function MessageStream({ conversation, customerTyping }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation, customerTyping]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-[#fbfaf8]">
      {/* Centered Order Context Badge */}
      {conversation.contextSummary && (
        <div className="flex justify-center my-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] sm:text-[11px] font-semibold text-slate-600 shadow-2xs">
            <Package className="h-3 w-3" aria-hidden="true" />
            <span>{conversation.contextSummary}</span>
          </div>
        </div>
      )}

      {/* Empty Messages State */}
      {(!conversation.messages || conversation.messages.length === 0) && (
        <div className="flex justify-center py-10">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 max-w-xs text-center shadow-xs space-y-1">
            <div className="h-9 w-9 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold mb-2">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold text-slate-900">Conversation Connected</p>
            <p className="text-[11px] text-slate-500">
              The customer is waiting for a reply. Send a message below to assist.
            </p>
          </div>
        </div>
      )}

      {/* Messages Bubble List */}
      {(conversation.messages || []).map((m, i) => {
        const isAgent = m.sender === "AGENT";
        return (
          <div key={m._id || i} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-xs ${
                isAgent
                  ? "bg-slate-900 text-white rounded-br-xs"
                  : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs"
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`text-[9px] block mt-1 text-right ${isAgent ? "text-slate-400" : "text-slate-400"}`}
              >
                {m.createdAt
                  ? new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {customerTyping && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-400 italic shadow-xs">
            Customer is typing…
          </div>
        </div>
      )}
    </div>
  );
}
