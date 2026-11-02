import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { addToCart } from "../redux/cartSlice";
import { closeChat, openChat } from "../redux/uiSlice";
import { showToast } from "../utils/toast";
import { Dots } from "./ui/Skeleton";
import BotMessage from "./chat/BotMessage";
import ChatComposer from "./chat/ChatComposer";
import ChatHeader from "./chat/ChatHeader";
import ChatLauncher from "./chat/ChatLauncher";
import useChat from "./chat/useChat";
import useChatScroll from "./chat/useChatScroll";

const AIChatAssistant = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = useSelector((state) => state.ui.isChatOpen);
  const chatPrompt = useSelector((state) => state.ui.chatPrompt);

  const chat = useChat(chatPrompt);
  const { endRef, setBotRef } = useChatScroll({
    isOpen,
    messages: chat.messages,
    isLoading: chat.isLoading,
    intentRef: chat.scrollIntent,
  });

  const showDesktopLauncher = location.pathname === "/";
  const hideLauncher = ["/cart", "/checkout"].some((path) => location.pathname.startsWith(path));

  const openProduct = (product) => {
    dispatch(closeChat());
    navigate(`/products/${product.slug}`);
  };

  const addProduct = (e, product) => {
    e.stopPropagation();
    // Products with several variants need a choice (size, colour, storage) first
    if (product.variantCount > 1 || !product.sku) {
      openProduct(product);
      showToast("Choose a variant to add it to your bag", "info");
      return;
    }
    dispatch(
      addToCart({
        catalog: "v2",
        productId: product._id,
        sku: product.sku,
        slug: product.slug,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        category: product.category,
        discountPercentage: product.discountPercent || 0,
        quantity: 1,
      })
    );
    showToast("Added to cart", "success");
  };

  return (
    <div className="premium-assistant fixed inset-0 z-[100] pointer-events-none flex items-end justify-center md:block md:pb-0">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeChat())}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[65] md:hidden pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && !hideLauncher && (
          <ChatLauncher onOpen={() => dispatch(openChat())} large={showDesktopLauncher} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="premium-assistant-panel pointer-events-auto fixed inset-x-0 bottom-0 z-[70] flex h-[85dvh] max-h-[85dvh] flex-col overflow-hidden rounded-t-[1.75rem] border-t border-black/10 bg-[#fffdf8] shadow-[0_-16px_48px_rgba(0,0,0,0.2)] md:fixed md:inset-auto md:bottom-6 md:right-6 md:h-[640px] md:w-[420px] md:rounded-[1.5rem] md:border md:border-black/10 md:shadow-[0_24px_64px_rgba(29,28,25,.18)]"
            role="dialog"
            aria-modal="true"
            aria-label="Ask VKart product concierge"
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-black/15 md:hidden" />
            <ChatHeader onClose={() => dispatch(closeChat())} />

            <div className="premium-assistant-messages flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 bg-[#f6f3ed]">
              {chat.messages.map((msg) => (
                <div
                  key={msg.id}
                  ref={msg.type === "bot" ? (node) => setBotRef(msg.id, node) : null}
                  className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.type === "user" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-[82%] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tr-sm bg-[#1d1c19] text-white text-xs sm:text-sm leading-relaxed shadow-sm font-medium"
                    >
                      {msg.text}
                    </motion.div>
                  ) : (
                    <BotMessage
                      message={msg}
                      onPrompt={chat.sendMessage}
                      onOpenProduct={openProduct}
                      onAddProduct={addProduct}
                    />
                  )}
                </div>
              ))}

              {chat.isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 pl-2 text-xs font-semibold text-[#8e887e]"
                >
                  <span className="text-[#a85d37]">
                    <Dots />
                  </span>
                  <span role="status">{chat.loadingText || "Thinking..."}</span>
                </motion.div>
              )}

              <div ref={endRef} className="h-2" />
            </div>

            <ChatComposer
              value={chat.input}
              onChange={chat.setInput}
              onSend={() => chat.sendMessage(chat.input)}
              isLoading={chat.isLoading}
              cooldown={chat.cooldown}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatAssistant;
