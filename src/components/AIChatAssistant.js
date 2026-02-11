import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "./axiosInstance";
import { addToCart } from "../redux/cartSlice";
import { showToast } from "../utils/toast";
import {
  MessageSquare, X, Send, Loader2, Sparkles,
  ChevronRight, Lightbulb, ArrowRight, ShoppingCart
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { closeChat, openChat } from "../redux/uiSlice";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n ?? 0));

const CHAT_STORAGE_KEY = "vkart_chat_history";
const DEFAULT_PROMPTS = [
  "Best gaming phone under 30k",
  "Recommend a lightweight laptop for coding",
  "Top wireless earbuds under 5k",
  "Best running shoes for daily use"
];

const createMessageId = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const withMessageId = (msg) => (msg?.id ? msg : { ...msg, id: createMessageId() });

const AIChatAssistant = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isChatOpen);
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // 🧠 STATE MANAGEMENT
  // ---------------------------------------------------------
  const initGreeting = {
    id: createMessageId(),
    type: "bot",
    structured: {
      greeting: "Hi there! I'm VKart Copilot.",
      response: {
        summary: "I can help you find the best products, check prices, or compare specs.",
        points: ["Try 'Best gaming phone under 30k'", "Or 'Running shoes for men'"]
      },
      followUp: null
    }
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed.map(withMessageId);
      }
    } catch {}
    return [withMessageId(initGreeting)];
  });

  // Persist chat to sessionStorage
  useEffect(() => {
    try { sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🛡️ Rate Limit State
  const [cooldown, setCooldown] = useState(0);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const botMessageRefs = useRef(new Map());
  const nextScrollRef = useRef({ type: "none", id: null });
  const wasOpenRef = useRef(false);

  // ---------------------------------------------------------
  // ⚡ EFFECTS
  // ---------------------------------------------------------

  // On open: show latest message first.
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll behavior per action:
  // - after user message: stay at bottom
  // - after bot response: bring new response card into view (top-aligned)
  useEffect(() => {
    if (!isOpen) return;
    const intent = nextScrollRef.current;
    if (!intent || intent.type === "none") return;

    const timer = setTimeout(() => {
      if (intent.type === "bot" && intent.id) {
        const node = botMessageRefs.current.get(intent.id);
        if (node) {
          node.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 70);

    nextScrollRef.current = { type: "none", id: null };
    return () => clearTimeout(timer);
  }, [messages, isLoading, isOpen]);

  // Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // ---------------------------------------------------------
  // 🛠️ HANDLERS
  // ---------------------------------------------------------

  const buildHistory = () => {
    // Only send last 6 exchanges to save tokens/bandwidth
    return messages.slice(-6).map(msg => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.type === "user"
        ? msg.text
        : msg.structured?.response?.summary || ""
    }));
  };

  const setBotMessageRef = (id, node) => {
    if (!id) return;
    if (node) botMessageRefs.current.set(id, node);
    else botMessageRefs.current.delete(id);
  };

  const appendBotMessage = (payload) => {
    const botMessage = withMessageId({ type: "bot", ...payload });
    nextScrollRef.current = { type: "bot", id: botMessage.id };
    setMessages((prev) => [...prev, botMessage]);
  };

  const sendMessage = async (rawMessage) => {
    const userMessage = String(rawMessage || "").trim();
    if (!userMessage || cooldown > 0 || isLoading) return;

    const history = buildHistory();
    const userEntry = withMessageId({ type: "user", text: userMessage });

    setInput("");
    nextScrollRef.current = { type: "bottom", id: null };
    setMessages((prev) => [...prev, userEntry]);
    setIsLoading(true);
    setCooldown(3); // Prevent spamming

    try {
      const res = await axios.post("/api/ai/chat", {
        message: userMessage,
        history
      });

      const { structured, products } = res.data;
      appendBotMessage({ structured, products });
    } catch (error) {
      console.error("AI Chat Error:", error);
      appendBotMessage({
        structured: {
          response: {
            summary: "I'm having a little trouble connecting right now. Please try again in a moment.",
            points: []
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => sendMessage(input);

  const handlePromptClick = async (prompt) => {
    await sendMessage(prompt);
  };

  const handleProductClick = (productId) => {
    dispatch(closeChat());
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, prod) => {
    e.stopPropagation();
    dispatch(addToCart({ ...prod, quantity: 1 }));
    showToast("Added to cart", "success");
  };

  // ---------------------------------------------------------
  // 🎨 RENDER HELPERS
  // ---------------------------------------------------------

  const renderBotMessage = (msg) => {
    const { structured, products } = msg;
    if (!structured) return null;

    const { greeting, response, recommendation, alternatives, followUp } = structured;

    // Animation variants for staggered entrance
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 }
    };

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 max-w-[95%] w-full"
      >
        {/* 1. Greeting Banner (Only for first message usually) */}
        {greeting && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-900 rounded-full text-xs font-bold border border-amber-100 self-start w-fit shadow-sm"
          >
            <Sparkles size={12} className="text-amber-500 fill-amber-500" />
            {greeting}
          </motion.div>
        )}

        {/* 2. Main Text Bubble */}
        {response && (
          <motion.div variants={itemVariants} className="relative group">
            <div className="px-5 py-4 bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <p className="text-[15px] leading-relaxed font-medium text-gray-700">
                {response.summary}
              </p>

              {/* Bullet Points */}
              {response.points && response.points.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {response.points.map((point, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex items-start gap-2.5 text-[13px] text-gray-600 bg-gray-50/50 p-2 rounded-lg"
                    >
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="leading-normal">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. "Why this?" Recommendation Reason */}
        {recommendation && recommendation.reason && (
          <motion.div
            variants={itemVariants}
            className="flex gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100/50 rounded-xl"
          >
            <Lightbulb size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-indigo-900 leading-relaxed">
              <span className="font-bold block mb-0.5 text-indigo-700">Why this pick?</span>
              {recommendation.reason}
            </p>
          </motion.div>
        )}

        {/* 4. Product Cards (Horizontal Stack) */}
        {products && products.length > 0 && (
          <motion.div variants={itemVariants} className="pt-2 grid gap-3">
            {products.map((prod, i) => {
              // Check if this is the "Best Match" (Backend puts it at index 0, logic is usually index 1)
              const isBestMatch = recommendation?.productIndex === i + 1;

              return (
                <motion.div
                  key={prod._id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProductClick(prod._id)}
                  className={`relative flex gap-4 p-3 rounded-xl border cursor-pointer transition-all bg-white
                    ${isBestMatch
                      ? "border-amber-400/50 shadow-lg shadow-amber-100/50 ring-1 ring-amber-100"
                      : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                    }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-gray-50 p-1.5 shrink-0 flex items-center justify-center border border-gray-100">
                    <img
                      src={prod.thumbnail}
                      alt={prod.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{prod.title}</h4>
                      {isBestMatch && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-black text-white uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1">
                          <Sparkles size={8} /> Top Pick
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">
                      {prod.category || 'Electronic'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-gray-900">{INR(prod.price)}</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">In Stock</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="self-center flex flex-col items-center gap-1.5 pr-1">
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="p-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingCart size={14} />
                    </button>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* 5. Alternatives / Suggestions */}
        {alternatives && alternatives.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-full mb-1">Also consider:</span>
            {alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(alt)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors border border-gray-200"
              >
                {alt}
              </button>
            ))}
          </motion.div>
        )}

        {/* 6. Smart Follow-up Chip */}
        {followUp && (
          <motion.button
            variants={itemVariants}
            onClick={() => handlePromptClick(followUp)}
            className="mt-2 flex items-center justify-between w-full px-4 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-medium transition-all shadow-lg active:scale-95 group"
          >
            <span>{followUp}</span>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </motion.button>
        )}
      </motion.div>
    );
  };

  // ---------------------------------------------------------
  // 🚀 MAIN RENDER
  // ---------------------------------------------------------

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-end justify-center md:block md:pb-0">

      {/* 1. Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(openChat())}
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 pointer-events-auto group flex items-center gap-3 px-5 py-4 bg-gray-900 text-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10"
          >
            <div className="relative">
              <MessageSquare size={24} className="text-white shrink-0" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-gray-900 rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-base tracking-tight hidden md:block pr-1">Ask Copilot</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Main Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto fixed bottom-0 left-0 w-full h-[85vh] md:absolute md:top-auto md:left-auto md:bottom-8 md:right-8 md:w-[420px] md:h-[650px] bg-white md:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-200/50"
          >
            {/* --- Header (DARK VERSION) --- */}
            <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 p-5 flex justify-between items-center shrink-0 border-b border-white/10 relative z-20 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-900/20 border border-white/10">
                  <Sparkles size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">VKart Copilot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeChat())}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- Messages Area --- */}
            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  ref={msg.type === "bot" ? (node) => setBotMessageRef(msg.id, node) : null}
                  className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.type === "user" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-[85%] px-5 py-3.5 rounded-2xl rounded-tr-sm bg-gray-900 text-white text-[14px] leading-relaxed shadow-md"
                    >
                      {msg.text}
                    </motion.div>
                  ) : (
                    renderBotMessage(msg)
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest pl-2"
                >
                  <Loader2 size={12} className="animate-spin text-amber-500" />
                  Thinking...
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* --- Input Area (No Footer) --- */}
            <div className="p-4 bg-white border-t border-gray-100 relative z-20">
              {messages.length <= 1 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        disabled={isLoading || cooldown > 0}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Ask anything about products..."}
                  className="w-full bg-gray-50 text-[14px] px-5 py-4 rounded-xl border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none font-medium placeholder:text-gray-400 pr-14"
                  disabled={isLoading || cooldown > 0}
                />

                <button
                  onClick={handleSend}
                  disabled={isLoading || cooldown > 0 || !input.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all
                    ${!input.trim() || isLoading
                      ? "text-gray-300 bg-transparent cursor-not-allowed"
                      : "bg-gray-900 text-white shadow-md hover:scale-105 active:scale-95"
                    }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              {/* Footer removed here */}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatAssistant;
