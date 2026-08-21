import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import { getSocketBaseUrl } from "../../utils/notificationHelpers";
import { FaPaperPlane, FaCheck, FaUndo, FaTimes } from "react-icons/fa";

const TABS = [
  { id: "unassigned", label: "Unassigned", filter: { status: "AWAITING_AGENT" } },
  { id: "mine", label: "My Conversations", filter: { mine: "true" } },
  { id: "resolved", label: "Resolved", filter: { status: "RESOLVED" } },
  { id: "all", label: "All", filter: {} },
];

const STATUS_STYLES = {
  AWAITING_AGENT: "bg-amber-50 text-amber-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
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

  // Live updates: new conversations/messages refresh the relevant queries;
  // typing events are ephemeral UI state only. Connects once — reads
  // selectedId via a ref rather than depending on it directly, so clicking
  // between conversations doesn't tear down and reconnect the socket each
  // time (it previously did, which is wasteful and briefly drops the
  // connection right as an agent starts reading a new thread).
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
      // handled via mutation error state if needed later
    }
  };

  const lastMessagePreview = (c) => {
    const last = c.messages?.[c.messages.length - 1];
    if (!last) return "No messages yet";
    return `${last.sender === "AGENT" ? "You: " : ""}${last.text}`.slice(0, 80);
  };

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-4 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Support</h1>
          <p className="text-sm text-slate-500 mt-1">Respond to customer conversations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 h-[calc(100vh-13rem)] min-h-[500px]">
          {/* Conversation list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {listQuery.isLoading && <p className="text-xs text-gray-400 p-4">Loading...</p>}
              {!listQuery.isLoading && conversations.length === 0 && (
                <p className="text-xs text-gray-400 p-4">No conversations here.</p>
              )}
              {conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedId(c._id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedId === c._id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900 truncate">{c.userId?.name || "Customer"}</span>
                    <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] || ""}`}>
                      {c.status?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lastMessagePreview(c)}</p>
                  {c.contextSummary && <p className="text-[10px] text-gray-400 mt-1 truncate">{c.contextSummary}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Thread view */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {!selectedId && (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                Select a conversation to view the thread.
              </div>
            )}

            {selectedId && conversation && (
              <>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{conversation.userId?.name || "Customer"}</p>
                    <p className="text-xs text-gray-400">{conversation.userId?.email}</p>
                    {conversation.contextSummary && (
                      <p className="text-xs text-gray-500 mt-1">{conversation.contextSummary}</p>
                    )}
                  </div>
                  {canWrite && (
                    <div className="flex gap-2">
                      {!conversation.assignedAgentId && (
                        <button
                          onClick={() => actionMutation.mutate("claim")}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
                        >
                          Claim
                        </button>
                      )}
                      {conversation.status !== "RESOLVED" && conversation.status !== "CLOSED" && (
                        <button
                          onClick={() => actionMutation.mutate("resolve")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors"
                        >
                          <FaCheck size={9} /> Resolve
                        </button>
                      )}
                      {conversation.status === "RESOLVED" && (
                        <button
                          onClick={() => actionMutation.mutate("reopen")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                        >
                          <FaUndo size={9} /> Reopen
                        </button>
                      )}
                      {conversation.status !== "CLOSED" && (
                        <button
                          onClick={() => actionMutation.mutate("close")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors"
                        >
                          <FaTimes size={9} /> Close
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-2 bg-gray-50">
                  {(conversation.messages || []).map((m, i) => (
                    <div key={m._id || i} className={`flex ${m.sender === "AGENT" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                          m.sender === "AGENT" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-800"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {customerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-400 italic">
                        Customer is typing…
                      </div>
                    </div>
                  )}
                </div>

                {canWrite && conversation.status !== "CLOSED" && (
                  <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => handleChangeReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                      placeholder="Type your reply..."
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <button
                      onClick={send}
                      disabled={!replyText.trim()}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-900 text-white disabled:opacity-40 hover:bg-black transition-colors"
                    >
                      <FaPaperPlane size={13} />
                    </button>
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
