import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "../axiosInstance";
import { clearChatPrompt } from "../../redux/uiSlice";
import { buildHistory, loadMessages, saveMessages, withMessageId } from "./messages";

const FAILURE = {
  structured: {
    response: {
      summary: "I'm having a little trouble connecting right now. Please try again in a moment.",
      points: [],
    },
  },
};

// The conversation: messages, sending a question, the model's two-phase answer, and the cooldown.
export default function useChat(chatPrompt) {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [cooldown, setCooldown] = useState(0);
  // Tells the scroll hook what to do after the next message lands
  const scrollIntent = useRef({ type: "none", id: null });

  useEffect(() => saveMessages(messages), [messages]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const appendBotMessage = (payload) => {
    const botMessage = withMessageId({ type: "bot", ...payload });
    scrollIntent.current = { type: "bot", id: botMessage.id };
    setMessages((prev) => [...prev, botMessage]);
  };

  // Phase two of an answer: the model's picks and reasons for the search results.
  // Returns null when the model is slow or fails, so the caller can show the search results.
  const fetchRanking = async (token) => {
    try {
      const { data } = await axios.post("/api/ai/chat/rank", { token }, { timeout: 30000 });
      if (data?.reranked && Array.isArray(data.products) && data.products.length) return data;
    } catch {
      /* fall back to the search results */
    }
    return null;
  };

  const sendMessage = async (raw) => {
    const text = String(raw || "").trim();
    if (!text || cooldown > 0 || isLoading) return;

    const history = buildHistory(messages);
    setInput("");
    scrollIntent.current = { type: "bottom", id: null };
    setMessages((prev) => [...prev, withMessageId({ type: "user", text })]);
    setIsLoading(true);
    setLoadingText("Our AI is searching…");
    setCooldown(3); // keeps people from spamming the model

    try {
      const res = await axios.post("/api/ai/chat", {
        message: text,
        history,
        twoPhase: true,
        // Ignored by the current API; older deployments answer from the right catalog only when asked
        catalog: "v2",
      });
      const { structured, products, rank } = res.data;

      // Wait for the model's picks and show one final answer (search results if they don't come back)
      if (rank?.token) {
        setLoadingText("Our AI is picking the best matches for you…");
        const ranked = await fetchRanking(rank.token);
        appendBotMessage(
          ranked
            ? { structured: ranked.structured, products: ranked.products }
            : { structured, products }
        );
      } else {
        appendBotMessage({ structured, products });
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      appendBotMessage(FAILURE);
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  // A question handed over from search: send it, or leave it in the box while a reply is loading
  useEffect(() => {
    if (!chatPrompt?.text) return;
    dispatch(clearChatPrompt());
    if (isLoading || cooldown > 0) setInput(chatPrompt.text);
    else sendMessage(chatPrompt.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatPrompt]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    loadingText,
    cooldown,
    sendMessage,
    scrollIntent,
  };
}
