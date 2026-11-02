import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import useAdminToast from "../ui/useAdminToast";
import { emptyPlan, formFromPlan, payloadFromForm } from "./planUtils";

export default function useMembership() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useAdminToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);

  const plansQuery = useQuery({
    queryKey: qk.admin.membershipPlans,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/membership/admin/plans");
      return res?.data || [];
    },
  });

  const refreshPlans = () => queryClient.invalidateQueries({ queryKey: qk.admin.membershipPlans });

  const saveMutation = useMutation({
    mutationFn: async ({ payload, planId }) => {
      if (planId) return axiosInstance.put(`/api/membership/admin/plans/${planId}`, payload);
      return axiosInstance.post("/api/membership/admin/plans", payload);
    },
    onSuccess: refreshPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId) => axiosInstance.delete(`/api/membership/admin/plans/${planId}`),
    onSuccess: refreshPlans,
  });

  useEffect(() => {
    if (plansQuery.isError) showToast("Failed to load plans", "error");
  }, [plansQuery.isError, showToast]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan);
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditing(plan._id);
    setForm(formFromPlan(plan));
    setShowForm(true);
  };

  const handleField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleFeature = (idx, val) => {
    setForm((p) => {
      const feats = [...p.features];
      feats[idx] = val;
      return { ...p, features: feats };
    });
  };

  const addFeature = () => setForm((p) => ({ ...p, features: [...p.features, ""] }));

  const removeFeature = (idx) =>
    setForm((p) => ({ ...p, features: p.features.filter((_, i) => i !== idx) }));

  const save = async () => {
    try {
      await saveMutation.mutateAsync({ payload: payloadFromForm(form), planId: editing });
      showToast(editing ? "Plan updated" : "Plan created");
      setShowForm(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save", "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast("Plan deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return {
    toast,
    plans: plansQuery.data || [],
    loading: plansQuery.isLoading,
    fetching: plansQuery.isFetching,
    error: plansQuery.isError ? "Failed to load plans" : "",
    refetch: () => plansQuery.refetch(),
    showForm,
    closeForm: () => setShowForm(false),
    editing,
    form,
    saving: saveMutation.isPending,
    openCreate,
    openEdit,
    handleField,
    handleFeature,
    addFeature,
    removeFeature,
    save,
    remove,
  };
}
