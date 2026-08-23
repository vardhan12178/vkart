import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FaTimes,
  FaHeadset,
  FaBoxOpen,
  FaUndo,
  FaCreditCard,
  FaQuestionCircle,
  FaChevronRight,
  FaChevronLeft,
  FaPaperPlane,
} from "react-icons/fa";
import axios from "../axiosInstance";
import { getSocketBaseUrl } from "../../utils/notificationHelpers";

const INTENT_TO_CATEGORY = {
  track: "ORDER_STATUS",
  return: "RETURN_REFUND",
  payment: "PAYMENT",
  other: "OTHER",
};

/* Live agent chat — mounted only once the customer opts in. Creates/resumes
   a conversation, then keeps a dedicated socket connection for the lifetime
   of this panel (rather than reusing the app-wide notification socket,
   which doesn't expose its connection to other components). */
function LiveChatPanel({ category, orderId, contextSummary }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [agentTyping, setAgentTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const agentTypingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.post("/api/support/conversations", { category, orderId, contextSummary });
        if (cancelled) return;
        setConversation(res.data.conversation);
        setMessages(res.data.conversation.messages || []);
      } catch {
        // leave loading state to show a retry-friendly empty view
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const socket = io(getSocketBaseUrl(), {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("support:new_message", ({ conversationId, message }) => {
      // Only agent replies arrive here — the customer's own messages are
      // already shown optimistically at send time. Without this check, an
      // account that's both the customer and a support agent (e.g. the
      // store owner testing their own account) would see their own message
      // twice: once optimistically, once as an echo via the support_agents
      // room they're also a member of.
      if (message.sender !== "AGENT") return;
      setConversation((prev) => {
        if (!prev || String(conversationId) !== String(prev._id)) return prev;
        setMessages((prevMsgs) => [...prevMsgs, message]);
        return prev;
      });
    });

    socket.on("support:typing", ({ conversationId, isTyping, from }) => {
      if (from !== "AGENT") return;
      setConversation((prev) => {
        if (prev && String(conversationId) === String(prev._id)) {
          setAgentTyping(!!isTyping);
          clearTimeout(agentTypingTimeoutRef.current);
          if (isTyping) {
            agentTypingTimeoutRef.current = setTimeout(() => setAgentTyping(false), 4000);
          }
        }
        return prev;
      });
    });

    return () => {
      cancelled = true;
      socket.disconnect();
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(agentTypingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, agentTyping]);

  const emitTyping = (isTyping) => {
    if (!conversation || !socketRef.current) return;
    socketRef.current.emit("support:typing", { conversationId: conversation._id, isTyping });
  };

  const handleChangeText = (value) => {
    setText(value);
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !conversation) return;
    setText("");
    clearTimeout(typingTimeoutRef.current);
    emitTyping(false);

    // Optimistic append — the socket event for our own message won't fire
    // back to us, so this is the only place it gets added for the sender.
    const optimisticMessage = { sender: "USER", text: trimmed, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await axios.post(`/api/support/conversations/${conversation._id}/messages`, { text: trimmed });
    } catch {
      // Message is still shown optimistically; a real failure is rare and
      // not worth a disruptive error state for a support chat.
    }
  };

  if (loading) {
    return <p className="text-xs text-gray-400">Connecting you to support...</p>;
  }

  if (!conversation) {
    return <p className="text-xs text-red-500">Couldn't start a conversation. Please try again in a moment.</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-6 px-4">
            <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <FaHeadset size={16} />
            </div>
            <p className="text-xs font-bold text-slate-800">You're connected to support</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Send a message and our team will assist you shortly.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.sender === "USER";
          return (
            <div key={m._id || i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-slate-900 text-white rounded-br-xs"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                }`}
              >
                <p>{m.text}</p>
                <span className={`text-[9px] block mt-0.5 text-right ${isUser ? "text-slate-400" : "text-slate-400"}`}>
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </div>
          );
        })}
        {agentTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-400 italic shadow-xs">
              Agent is typing…
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => handleChangeText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white disabled:opacity-40 hover:bg-black transition-colors shadow-xs"
        >
          <FaPaperPlane size={12} />
        </button>
      </div>
    </div>
  );
}

const STAGE_MESSAGES = {
  PLACED: "Your order has been placed and is being confirmed.",
  CONFIRMED: "Your order is confirmed and is being prepared for packing.",
  PROCESSING: "Your order is being processed and packed.",
  PACKED: "Your order is packed and ready to ship.",
  SHIPPED: "Your order is on its way — expect delivery in 3-5 days.",
  OUT_FOR_DELIVERY: "Your order is out for delivery — expect it today by 9 PM.",
  DELIVERED: "Your order was delivered.",
  CANCELLED: "This order was cancelled.",
};

const MENU_OPTIONS = [
  { id: "track", label: "Track my order", icon: FaBoxOpen },
  { id: "return", label: "Return or refund", icon: FaUndo },
  { id: "payment", label: "Payment or billing", icon: FaCreditCard },
  { id: "other", label: "Something else", icon: FaQuestionCircle },
];

function BackButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1.5">
      <FaChevronLeft size={9} /> Back
    </button>
  );
}

export default function SupportChatWidget({ open, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("MENU");
  const [intent, setIntent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (open) {
      setStep("MENU");
      setIntent(null);
      setSelectedOrder(null);
    }
  }, [open]);

  const chooseIntent = async (id) => {
    setIntent(id);
    if (id === "track" || id === "return") {
      setStep("ORDER_LIST");
      setOrdersLoading(true);
      try {
        const res = await axios.get("/api/profile/orders/paged", { params: { limit: 8 } });
        setOrders(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    } else if (id === "payment") {
      setStep("PAYMENT_INFO");
    } else {
      setStep("OTHER_INFO");
    }
  };

  const pickOrder = (order) => {
    setSelectedOrder(order);
    setStep("ORDER_DETAIL");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-xs p-0 sm:p-6"
      onClick={onClose}
    >
      <style>{`
        @keyframes supportChatFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: supportChatFadeUp 0.22s ease-out forwards; }
      `}</style>
      <div
        className="relative w-full sm:w-[420px] h-[90vh] sm:h-[620px] bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-up border border-slate-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Bar Indicator */}
        <div className="sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-slate-900">
          <div className="w-10 h-1 bg-white/20 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white">
              <FaHeadset size={14} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-xs sm:text-sm leading-none">VKart Customer Support</p>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-white/60 mt-0.5 font-medium">Live assistance & instant answers</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <FaTimes size={15} />
          </button>
        </div>

        {/* Body */}
        <div className={step === "AGENT_CHAT" ? "flex-1 overflow-hidden p-4 sm:p-5 bg-slate-50/60 flex flex-col" : "flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 bg-slate-50/60"}>
          {step === "MENU" && (
            <>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mb-1">How can we help you today?</p>
              <div className="space-y-2">
                {MENU_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => chooseIntent(id)}
                    className="w-full flex items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:border-slate-900 hover:bg-slate-50 transition-all shadow-xs group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Icon size={12} />
                      </span>
                      <span>{label}</span>
                    </span>
                    <FaChevronRight size={10} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "ORDER_LIST" && (
            <>
              <BackButton onClick={() => setStep("MENU")} />
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1">Select an order:</p>
              {ordersLoading && <p className="text-xs text-slate-400 py-4 text-center">Loading your recent orders...</p>}
              {!ordersLoading && orders.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No orders found on your account.</p>
              )}
              <div className="space-y-2">
                {orders.map((o) => (
                  <button
                    key={o._id}
                    type="button"
                    onClick={() => pickOrder(o)}
                    className="w-full flex items-center gap-3 text-left bg-white border border-slate-200/80 rounded-xl p-3 hover:border-slate-900 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    {o.products?.[0]?.image && (
                      <img
                        src={o.products[0].image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white border border-slate-100 p-0.5"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900 truncate">{o.orderId}</span>
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">{o.stage}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {o.products?.[0]?.name}
                        {o.products?.length > 1 ? ` +${o.products.length - 1} more` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "ORDER_DETAIL" && selectedOrder && (
            <>
              <BackButton onClick={() => setStep("ORDER_LIST")} />
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-bold text-slate-900">{selectedOrder.orderId}</p>
                  <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{selectedOrder.stage}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  {STAGE_MESSAGES[selectedOrder.stage] || "We're tracking your order's progress."}
                </p>
              </div>

              {selectedOrder.stage === "DELIVERED" && intent === "return" && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/orders");
                  }}
                  className="w-full bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl px-4 py-2.5 hover:bg-black transition-colors shadow-xs"
                >
                  Go to Orders to request return
                </button>
              )}

              {selectedOrder.stage === "CANCELLED" && selectedOrder.refundStatus && selectedOrder.refundStatus !== "NONE" && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
                  Refund status: <span className="font-bold">{selectedOrder.refundStatus}</span>
                </div>
              )}

              <button type="button" onClick={() => setStep("FOLLOWUP")} className="w-full mt-2 text-xs sm:text-sm font-bold text-orange-600 hover:underline">
                Continue →
              </button>
            </>
          )}

          {step === "PAYMENT_INFO" && (
            <>
              <BackButton onClick={() => setStep("MENU")} />
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs sm:text-sm text-slate-600 space-y-2 shadow-xs">
                <p>• Payments are processed securely via Razorpay (UPI, Cards, Netbanking, Pay Later).</p>
                <p>• Refunds to your original payment method typically take 5-7 business days once initiated.</p>
                <p>• Refunds to your VKart Wallet are instant.</p>
              </div>
              <button type="button" onClick={() => setStep("FOLLOWUP")} className="w-full mt-2 text-xs sm:text-sm font-bold text-orange-600 hover:underline">
                Continue →
              </button>
            </>
          )}

          {step === "OTHER_INFO" && (
            <>
              <BackButton onClick={() => setStep("MENU")} />
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs sm:text-sm text-slate-600 shadow-xs">
                No problem — let's connect you with our live support team.
              </div>
              <button type="button" onClick={() => setStep("FOLLOWUP")} className="w-full mt-2 text-xs sm:text-sm font-bold text-orange-600 hover:underline">
                Continue →
              </button>
            </>
          )}

          {step === "FOLLOWUP" && (
            <>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2">Did that answer your question?</p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
                  Yes, thanks!
                </button>
                <button type="button" onClick={() => setStep("WANT_AGENT")} className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-xs sm:text-sm font-bold hover:bg-black transition-colors shadow-xs">
                  Not really
                </button>
              </div>
            </>
          )}

          {step === "WANT_AGENT" && (
            <>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2">Want to chat with our support team?</p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
                  No thanks
                </button>
                <button type="button" onClick={() => setStep("AGENT_CHAT")} className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-xs sm:text-sm font-bold hover:bg-black transition-colors shadow-xs">
                  Yes, connect me
                </button>
              </div>
            </>
          )}

          {step === "AGENT_CHAT" && (
            <LiveChatPanel
              category={INTENT_TO_CATEGORY[intent] || "OTHER"}
              orderId={selectedOrder?._id}
              contextSummary={selectedOrder ? `Order ${selectedOrder.orderId} (${selectedOrder.stage})` : ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}
