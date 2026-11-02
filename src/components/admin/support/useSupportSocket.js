import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { qk } from "../../../query/queryKeys";
import { getSocketBaseUrl } from "../../../utils/notificationHelpers";

// Live updates for the support inbox: new conversations/messages refresh the lists and the
// open thread, and the customer's typing state is surfaced for the selected conversation.
export default function useSupportSocket(selectedId) {
  const queryClient = useQueryClient();
  const [customerTyping, setCustomerTyping] = useState(false);
  const socketRef = useRef(null);
  const customerTypingTimeoutRef = useRef(null);
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
        queryClient.invalidateQueries({
          queryKey: qk.admin.supportConversation(selectedIdRef.current),
        });
      }
    });

    socket.on("support:typing", ({ conversationId, isTyping, from }) => {
      if (
        from !== "USER" ||
        !selectedIdRef.current ||
        String(conversationId) !== String(selectedIdRef.current)
      )
        return;
      setCustomerTyping(!!isTyping);
      clearTimeout(customerTypingTimeoutRef.current);
      if (isTyping) {
        customerTypingTimeoutRef.current = setTimeout(() => setCustomerTyping(false), 4000);
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socketRef, customerTyping };
}
