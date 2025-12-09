import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "./axiosInstance";
import { MessageSquare, X, Send, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { closeChat, openChat } from "../redux/uiSlice";

const AIChatAssistant = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isChatOpen);

  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! I'm your VKart AI Assistant. Looking for something specific?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // 🛡️ RATE LIMIT PROTECTION
  const [cooldown, setCooldown] = useState(0);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSend = async () => {
    if (!input.trim() || cooldown > 0 || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setIsLoading(true);
    setCooldown(3);

    try {
      const res = await axios.post("/api/chat", {
        message: userMessage
      });

      const { reply, products } = res.data;

      setMessages((prev) => [
        ...prev,
        { type: "bot", text: reply, products: products }
      ]);

    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "I'm having trouble connecting to the server. Please try again!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    dispatch(closeChat());
    navigate(`/product/${productId}`);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(openChat())}
            className="absolute bottom-0 right-0 group flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-full shadow-2xl hover:shadow-gray-900/40 transition-shadow whitespace-nowrap"
          >
            <MessageSquare size={24} className="text-white shrink-0" />
            <span className="font-bold text-lg tracking-wide hidden md:block">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 right-0 w-[90vw] md:w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/5"
          >

            {/* Header */}
            <div className="bg-gray-900 p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white tracking-wide">VKart Copilot</h3>
                  <p className="text-xs text-gray-400 font-medium">Assistant</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeChat())}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={idx}
                  className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
                >

                  {/* Text Bubble */}
                  <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === "user"
                    ? "bg-gray-900 text-white rounded-br-sm"
                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm"
                    }`}>
                    {msg.text}
                  </div>

                  {/* Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 space-y-3 w-full pl-2">
                      {msg.products.map((prod, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          key={prod._id}
                          onClick={() => handleProductClick(prod._id)}
                          className="group flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-900 transition-colors shadow-sm cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                            <img
                              src={prod.thumbnail}
                              alt={prod.title}
                              className="w-full h-full object-contain mix-blend-multiply p-2"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{prod.title}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-green-600">₹{prod.price}</p>
                              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all">
                                <ChevronRight size={14} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-400 text-xs ml-2"
                >
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    />
                  </div>
                  <span className="font-medium">Thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Ask for gift ideas..."}
                className="flex-1 bg-gray-50 focus:bg-white text-sm px-5 py-4 rounded-full border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-900 transition-all placeholder:text-gray-400 font-medium"
                disabled={isLoading || cooldown > 0}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={isLoading || cooldown > 0 || !input.trim()}
                className={`p-4 rounded-full text-white transition-all shadow-md ${isLoading || cooldown > 0 || !input.trim()
                  ? "bg-gray-100 text-gray-300 shadow-none cursor-not-allowed"
                  : "bg-gray-900 hover:bg-black hover:shadow-lg"
                  }`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatAssistant;
