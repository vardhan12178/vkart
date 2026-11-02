const STORAGE_KEY = "vkart_chat_history";

export const DEFAULT_PROMPTS = [
  "Best gaming phone under 30k",
  "Recommend a lightweight laptop for coding",
  "Top wireless earbuds under 5k",
  "Best running shoes for daily use",
];

export const createMessageId = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const withMessageId = (msg) => (msg?.id ? msg : { ...msg, id: createMessageId() });

export const greetingMessage = () =>
  withMessageId({
    type: "bot",
    structured: {
      greeting: "Hi — I’m the VKart concierge.",
      response: {
        summary: "I can help you find the best products, check prices, or compare specs.",
        points: ["Try 'Best gaming phone under 30k'", "Or 'Running shoes for men'"],
      },
      followUp: null,
    },
  });

// The conversation survives page changes within a tab (sessionStorage), not new sessions.
export function loadMessages() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(withMessageId);
    }
  } catch {
    /* storage unavailable or corrupted: start fresh */
  }
  return [greetingMessage()];
}

export function saveMessages(messages) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* storage full or blocked: the chat still works for this page */
  }
}

// Only the last few turns go to the server, to save tokens and bandwidth.
export const buildHistory = (messages) =>
  messages.slice(-6).map((msg) => ({
    role: msg.type === "user" ? "user" : "assistant",
    content: msg.type === "user" ? msg.text : msg.structured?.response?.summary || "",
  }));
