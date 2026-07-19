import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "./axiosInstance";
import { addToCart } from "../redux/cartSlice";
import { showToast } from "../utils/toast";
import {
  X, Send, Loader2, Sparkles, MessageCircleMore,
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
  const location = useLocation();
  const showDesktopLauncher = location.pathname === "/";

  // ---------------------------------------------------------
  // 🧠 STATE MANAGEMENT
  // ---------------------------------------------------------
  const initGreeting = {
    id: createMessageId(),
    type: "bot",
    structured: {
      greeting: "Hi — I’m the VKart concierge.",
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
            className="flex w-fit items-center gap-2 self-start rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-4 py-2 text-xs font-bold text-[#75462f]"
          >
            <Sparkles size={12} className="text-[#a85d37]" />
            {greeting}
          </motion.div>
        )}

        {/* 2. Main Text Bubble */}
        {response && (
          <motion.div variants={itemVariants} className="relative group">
            <div className="rounded-[1.1rem] rounded-tl-sm border border-black/[0.07] bg-[#fffdf8] px-5 py-4 text-[#1d1c19]">
              <p className="text-[15px] font-medium leading-relaxed text-[#4f4b44]">
                {response.summary}
              </p>

              {/* Bullet Points */}
              {response.points && response.points.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {response.points.map((point, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex items-start gap-2.5 border-t border-black/[0.06] px-0 py-2 text-[13px] text-[#6f6b62]"
                    >
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a85d37]" />
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
            className="flex gap-3 rounded-[1.1rem] border border-[#a85d37]/12 bg-[#eee8df] px-4 py-3"
          >
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#a85d37]" />
            <p className="text-xs font-medium leading-relaxed text-[#5f5a52]">
              <span className="mb-0.5 block font-bold text-[#1d1c19]">Why this pick?</span>
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
                  className={`relative flex cursor-pointer gap-4 rounded-[1.1rem] border bg-[#fffdf8] p-3 transition-all
                    ${isBestMatch
                      ? "border-[#a85d37]/30 ring-1 ring-[#a85d37]/10"
                      : "border-black/[0.07] hover:border-black/15"
                    }`}
                >
                  {/* Thumbnail */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.85rem] border border-black/[0.06] bg-[#eeeae2] p-1.5">
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
                      <h4 className="line-clamp-1 text-sm font-bold text-[#1d1c19]">{prod.title}</h4>
                      {isBestMatch && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#a85d37] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">
                          <Sparkles size={8} /> Top Pick
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#817c73]">
                      {prod.category || 'Electronic'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-[#1d1c19]">{INR(prod.price)}</span>
                      <span className="text-[10px] font-bold text-[#5f6a52]">In stock</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="self-center flex flex-col items-center gap-1.5 pr-1">
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#1d1c19] text-white transition-colors hover:bg-black"
                      title="Add to bag"
                      aria-label={`Add ${prod.title} to bag`}
                    >
                      <ShoppingCart size={14} />
                    </button>
                    <ChevronRight size={14} className="text-[#aaa49a]" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* 5. Alternatives / Suggestions */}
        {alternatives && alternatives.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-1">
            <span className="mb-1 w-full text-[10px] font-bold uppercase tracking-wider text-[#8e887e]">Also consider:</span>
            {alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(alt)}
                className="rounded-full border border-black/[0.08] bg-transparent px-3 py-1.5 text-xs text-[#5f5a52] transition-colors hover:bg-black/[0.04]"
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
            className="group mt-2 flex w-full items-center justify-between rounded-full bg-[#1d1c19] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            <span>{followUp}</span>
            <ArrowRight size={16} className="text-[#d7d1c7] transition-transform group-hover:translate-x-1" />
          </motion.button>
        )}
      </motion.div>
    );
  };

  // ---------------------------------------------------------
  // 🚀 MAIN RENDER
  // ---------------------------------------------------------

  return (
    <div className="premium-assistant fixed inset-0 z-[100] pointer-events-none flex items-end justify-center md:block md:pb-0">

      {/* 1. Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(openChat())}
            className={`premium-assistant-toggle pointer-events-auto absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.15rem] border border-black/10 bg-[#f0e8dd] text-[#1d1c19] shadow-[0_16px_42px_rgba(29,28,25,.14)] transition-colors hover:bg-[#fffdf8] ${showDesktopLauncher ? "md:h-auto md:w-auto md:gap-3 md:p-2 md:pr-5" : "sm:hidden"}`}
            aria-label="Ask VKart assistant"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.8rem] bg-[#3f493d] text-[#fffdf8]">
              <MessageCircleMore size={18} strokeWidth={1.8} />
            </div>
            {showDesktopLauncher && (
              <span className="hidden flex-col items-start leading-none md:flex">
                <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#817a70]">Product concierge</span>
                <span className="mt-1.5 text-sm font-bold tracking-[-0.01em] text-[#1d1c19]">Ask VKart</span>
              </span>
            )}
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
            className="premium-assistant-panel pointer-events-auto fixed inset-x-3 bottom-3 flex h-[min(42rem,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-[1.4rem] border border-black/10 bg-[#fffdf8] shadow-[0_30px_90px_rgba(29,28,25,.22)] md:absolute md:inset-auto md:bottom-8 md:right-8 md:h-[680px] md:w-[430px]"
            role="dialog"
            aria-modal="true"
            aria-label="Ask VKart product concierge"
          >
            {/* --- Header (DARK VERSION) --- */}
            <div className="premium-assistant-header bg-[#fffdf8] p-5 flex justify-between items-center shrink-0 border-b border-black/[0.08] relative z-20 text-[#1d1c19]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1d1c19] flex items-center justify-center text-white">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h3 className="font-editorial text-2xl text-[#1d1c19] leading-tight tracking-[-0.03em]">Ask VKart</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#59634f]" />
                    <p className="text-[9px] text-[#777269] font-bold uppercase tracking-[0.16em]">Product concierge</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeChat())}
                className="p-2 rounded-full text-[#777269] hover:text-[#1d1c19] hover:bg-black/5 transition-all"
                aria-label="Close product concierge"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- Messages Area --- */}
            <div ref={scrollAreaRef} className="premium-assistant-messages flex-1 overflow-y-auto p-5 space-y-6 bg-[#f6f3ed]">
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
                      className="max-w-[85%] px-5 py-3.5 rounded-[1.15rem] rounded-tr-sm bg-[#a85d37] text-white text-[14px] leading-relaxed"
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
                  className="flex items-center gap-2 pl-2 text-xs font-bold uppercase tracking-widest text-[#8e887e]"
                >
                  <Loader2 size={12} className="animate-spin text-[#a85d37]" />
                  Thinking...
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* --- Input Area (No Footer) --- */}
            <div className="premium-assistant-input p-4 bg-[#fffdf8] border-t border-black/[0.08] relative z-20">
              {messages.length <= 1 && (
                <div className="mb-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8e887e]">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        disabled={isLoading || cooldown > 0}
                        className="text-[11px] px-3 py-2 bg-[#f1ede5] hover:bg-[#e8e1d7] text-[#5f5b52] rounded-full transition-colors border border-black/[0.07] disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="w-full bg-[#f5f1e9] text-[14px] px-5 py-4 rounded-full border border-black/[0.07] focus:bg-white focus:border-[#a85d37]/40 focus:ring-4 focus:ring-[#a85d37]/10 transition-all outline-none font-medium placeholder:text-[#969086] pr-14"
                  disabled={isLoading || cooldown > 0}
                />

                <button
                  onClick={handleSend}
                  disabled={isLoading || cooldown > 0 || !input.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2.5 transition-all
                    ${!input.trim() || isLoading
                      ? "cursor-not-allowed bg-transparent text-[#c4beb4]"
                      : "bg-[#1d1c19] text-white hover:bg-black"
                    }`}
                  aria-label="Send message"
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
