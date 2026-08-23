import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import { getSocketBaseUrl } from "../../utils/notificationHelpers";
import { FaPaperPlane, FaCheck, FaUndo, FaTimes, FaChevronLeft } from "react-icons/fa";

const TABS = [
  { id: "unassigned", label: "Unassigned", mobileLabel: "New", filter: { status: "AWAITING_AGENT" } },
  { id: "mine", label: "My Conversations", mobileLabel: "Mine", filter: { mine: "true" } },
  { id: "resolved", label: "Resolved", mobileLabel: "Resolved", filter: { status: "RESOLVED" } },
  { id: "all", label: "All", mobileLabel: "All", filter: {} },
];

const STATUS_CONFIG = {
  AWAITING_AGENT: { label: "Awaiting Agent", color: "bg-amber-500", text: "text-amber-700 bg-amber-50 border-amber-200/60" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-500", text: "text-blue-700 bg-blue-50 border-blue-200/60" },
  RESOLVED: { label: "Resolved", color: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50 border-emerald-200/60" },
  CLOSED: { label: "Closed", color: "bg-slate-400", text: "text-slate-600 bg-slate-100 border-slate-200/60" },
};

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("support");
  const [activeTab, setActiveTab] = useState("unassigned");
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [customerTyping, setCustomerTyping] = useState(false);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const customerTypingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);

  const filter = TABS.find((t) => t.id === activeTab)?.filter || {};

  const listQuery = useQuery({
    queryKey: qk.admin.supportConversations(filter),
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/support/conversations", { params: filter });
      return res.data?.conversations || [];
    },
    refetchInterval: 30000,
  });

  const detailQuery = useQuery({
    queryKey: qk.admin.supportConversation(selectedId),
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/admin/support/conversations/${selectedId}`);
      return res.data?.conversation;
    },
    enabled: !!selectedId,
  });

  const replyMutation = useMutation({
    mutationFn: async (text) => {
      const res = await axiosInstance.post(`/api/admin/support/conversations/${selectedId}/messages`, { text });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.supportConversation(selectedId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "conversations"] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action) => {
      const res = await axiosInstance.patch(`/api/admin/support/conversations/${selectedId}`, { action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.supportConversation(selectedId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "conversations"] });
    },
  });

  const selectedIdRef = useRef(null);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const socket = io(getSocketBaseUrl(), {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("support:new_conversation", () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "conversations"] });
    });

    socket.on("support:new_message", ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "conversations"] });
      if (selectedIdRef.current && String(conversationId) === String(selectedIdRef.current)) {
        queryClient.invalidateQueries({ queryKey: qk.admin.supportConversation(selectedIdRef.current) });
      }
    });

    socket.on("support:typing", ({ conversationId, isTyping, from }) => {
      if (from !== "USER" || !selectedIdRef.current || String(conversationId) !== String(selectedIdRef.current)) return;
      setCustomerTyping(!!isTyping);
      clearTimeout(customerTypingTimeoutRef.current);
      if (isTyping) {
        customerTypingTimeoutRef.current = setTimeout(() => setCustomerTyping(false), 4000);
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [detailQuery.data, customerTyping]);

  const conversations = listQuery.data || [];
  const conversation = detailQuery.data;

  const emitTyping = (isTyping) => {
    if (!selectedId || !socketRef.current || !conversation?.userId?._id) return;
    socketRef.current.emit("support:typing", {
      conversationId: selectedId,
      isTyping,
      customerId: conversation.userId._id,
    });
  };

  const handleChangeReply = (value) => {
    setReplyText(value);
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const send = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || !canWrite) return;
    setReplyText("");
    clearTimeout(typingTimeoutRef.current);
    emitTyping(false);
    try {
      await replyMutation.mutateAsync(trimmed);
    } catch {
      // handled via mutation error state
    }
  };

  const lastMessagePreview = (c) => {
    const last = c.messages?.[c.messages.length - 1];
    if (!last) return "No messages yet";
    return `${last.sender === "AGENT" ? "You: " : ""}${last.text}`.slice(0, 75);
  };

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-2.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">

        {/* Page Masthead (Visible when browsing list on desktop or mobile) */}
        <div className={`flex items-center justify-between gap-3 ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Customer Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">Respond to real-time customer conversations.</p>
          </div>
        </div>

        {/* Support Chat Master-Detail Container */}
        <div className={`grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6 ${selectedId ? 'h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-11rem)]' : 'h-[calc(100vh-10rem)]'} min-h-[520px]`}>

          {/* Conversation List Pane (Hidden on mobile if conversation is selected) */}
          <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-xs flex flex-col overflow-hidden ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
            {/* Tabs Header */}
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
              {listQuery.isLoading && (
                <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading conversations...</div>
              )}
              {!listQuery.isLoading && conversations.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">No conversations in this queue.</div>
              )}
              {conversations.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.CLOSED;
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedId(c._id)}
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
                        <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${cfg.text}`}>
                          {c.status?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lastMessagePreview(c)}</p>
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
          </div>

          {/* Chat Thread Pane (Hidden on mobile if no conversation is selected) */}
          <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-xs flex flex-col overflow-hidden ${!selectedId ? 'hidden lg:flex' : 'flex'}`}>
            {!selectedId && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-2 text-slate-300">
                  <FaPaperPlane size={18} />
                </div>
                <p className="text-sm font-bold text-slate-700">No conversation selected</p>
                <p className="text-xs text-slate-400 mt-0.5">Select a customer thread from the queue to start responding.</p>
              </div>
            )}

            {selectedId && conversation && (
              <>
                {/* Single-Row Modern Chat Header */}
                <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-white">
                  {/* Left: Back button + Avatar + Customer Name & Meta */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => setSelectedId(null)}
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
                        <span className={`hidden sm:inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${STATUS_CONFIG[conversation.status]?.text || ""}`}>
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
                          onClick={() => actionMutation.mutate("claim")}
                          className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold hover:bg-black transition shadow-xs"
                        >
                          Claim
                        </button>
                      )}
                      {conversation.status !== "RESOLVED" && conversation.status !== "CLOSED" && (
                        <button
                          onClick={() => actionMutation.mutate("resolve")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition shadow-xs"
                        >
                          <FaCheck size={9} />
                          <span>Resolve</span>
                        </button>
                      )}
                      {conversation.status === "RESOLVED" && (
                        <button
                          onClick={() => actionMutation.mutate("reopen")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 transition shadow-xs"
                        >
                          <FaUndo size={9} />
                          <span>Reopen</span>
                        </button>
                      )}
                      {conversation.status !== "CLOSED" && (
                        <button
                          onClick={() => actionMutation.mutate("close")}
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Close conversation"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Messages Stream */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-[#fbfaf8]">
                  {/* Centered Order Context Badge */}
                  {conversation.contextSummary && (
                    <div className="flex justify-center my-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] sm:text-[11px] font-semibold text-slate-600 shadow-2xs">
                        <span>📦</span>
                        <span>{conversation.contextSummary}</span>
                      </div>
                    </div>
                  )}

                  {/* Empty Messages State */}
                  {(!conversation.messages || conversation.messages.length === 0) && (
                    <div className="flex justify-center py-10">
                      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 max-w-xs text-center shadow-xs space-y-1">
                        <div className="h-9 w-9 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold mb-2">
                          💬
                        </div>
                        <p className="text-xs font-bold text-slate-900">Conversation Connected</p>
                        <p className="text-[11px] text-slate-500">The customer is waiting for a reply. Send a message below to assist.</p>
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
                          <span className={`text-[9px] block mt-1 text-right ${isAgent ? "text-slate-400" : "text-slate-400"}`}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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

                {/* Modern Pill Reply Input Bar */}
                {canWrite && conversation.status !== "CLOSED" && (
                  <div className="p-2.5 sm:p-3 bg-white border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 bg-slate-100/90 rounded-full pl-4 pr-1.5 py-1.5 border border-slate-200/60 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-400/20 transition-all">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => handleChangeReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none"
                      />
                      <button
                        onClick={send}
                        disabled={!replyText.trim()}
                        className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black transition-all shrink-0 shadow-xs"
                      >
                        <FaPaperPlane size={11} className="-ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
