import { useEffect, useRef } from "react";

// Scrolling rules: opening shows the newest message; a user message keeps the view at the bottom;
// a bot answer is brought into view from its top so it can be read from the start.
export default function useChatScroll({ isOpen, messages, isLoading, intentRef }) {
  const endRef = useRef(null);
  const botRefs = useRef(new Map());
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      });
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const intent = intentRef.current;
    if (!intent || intent.type === "none") return undefined;

    const timer = setTimeout(() => {
      const node = intent.type === "bot" && intent.id ? botRefs.current.get(intent.id) : null;
      if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
      else endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 70);

    intentRef.current = { type: "none", id: null };
    return () => clearTimeout(timer);
  }, [messages, isLoading, isOpen, intentRef]);

  const setBotRef = (id, node) => {
    if (!id) return;
    if (node) botRefs.current.set(id, node);
    else botRefs.current.delete(id);
  };

  return { endRef, setBotRef };
}
