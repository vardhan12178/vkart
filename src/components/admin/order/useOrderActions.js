import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import { TERMINAL_STAGES, stageLabel } from "./orderStages";

// Everything an admin can do to one order: move its stage, handle a return, refund, send a replacement.
export default function useOrderActions(id, order, notify) {
  const queryClient = useQueryClient();

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.orders });
    queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
  };
  const setOrder = (updater) => queryClient.setQueryData(qk.admin.order(id), updater);

  const stageMutation = useMutation({
    mutationFn: async (stage) => {
      const res = await axiosInstance.patch(`/api/admin/orders/${id}/stage`, { stage });
      return { stage, data: res.data };
    },
    onSuccess: ({ stage, data }) => {
      setOrder((prev) => data.order || (prev ? { ...prev, stage } : prev));
      refreshLists();
      notify("success", `Status updated to ${stageLabel(stage)}`);
    },
    onError: (err) => notify("error", err?.message || "Failed to update status."),
  });

  const returnMutation = useMutation({
    mutationFn: async (status) => {
      const res = await axiosInstance.patch(`/api/admin/orders/${id}/return`, { status });
      return { status, data: res.data };
    },
    onSuccess: ({ status, data }) => {
      setOrder((prev) => data.order || prev);
      refreshLists();
      notify("success", `Return status: ${status}`);
    },
    onError: () => notify("error", "Failed to update return status."),
  });

  const refundMutation = useMutation({
    mutationFn: async (method) => {
      const res = await axiosInstance.post(`/api/admin/orders/${id}/refund`, { method });
      return { method, data: res.data };
    },
    onSuccess: ({ method, data }) => {
      setOrder((prev) => data.order || prev);
      refreshLists();
      notify("success", `Refund ${method}`);
    },
    onError: () => notify("error", "Failed to initiate refund."),
  });

  const replacementMutation = useMutation({
    mutationFn: async () => (await axiosInstance.post(`/api/admin/orders/${id}/replacement`)).data,
    onSuccess: (data) => {
      setOrder((prev) =>
        data.replacement ? { ...prev, replacementOrderId: data.replacement._id } : prev
      );
      refreshLists();
      notify("success", "Replacement created");
    },
    onError: () => notify("error", "Replacement failed"),
  });

  // Errors are reported by the mutations' own callbacks, so these never throw.
  const attempt = (mutation, value) => mutation.mutateAsync(value).catch(() => {});

  return {
    stagePending: stageMutation.isPending,
    returnPending: returnMutation.isPending,
    refundPending: refundMutation.isPending,
    replacementPending: replacementMutation.isPending,
    updateStage: async (stage) => {
      if (!order) return;
      if (TERMINAL_STAGES.includes(order.stage)) {
        notify("error", "Order is closed and cannot be modified.");
        return;
      }
      if (stage === order.stage) return;
      await attempt(stageMutation, stage);
    },
    updateReturn: async (status) => order && attempt(returnMutation, status),
    refund: async (method) => order && attempt(refundMutation, method),
    createReplacement: () => replacementMutation.mutate(),
  };
}
