import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import { TABS } from "./supportConfig";
import useSupportSocket from "./useSupportSocket";

export default function useSupport(canWrite) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("unassigned");
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const typingTimeoutRef = useRef(null);
  const { socketRef, customerTyping } = useSupportSocket(selectedId);

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
      const res = await axiosInstance.post(
        `/api/admin/support/conversations/${selectedId}/messages`,
        { text }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.supportConversation(selectedId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "conversations"] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action) => {
      const res = await axiosInstance.patch(`/api/admin/support/conversations/${selectedId}`, {
        action,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.supportConversation(selectedId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "support", "conversations"] });
    },
  });

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
      // handled via mutation error state
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    loadingList: listQuery.isLoading,
    conversations,
    conversation,
    customerTyping,
    replyText,
    changeReply: handleChangeReply,
    send,
    runAction: (action) => actionMutation.mutate(action),
  };
}
