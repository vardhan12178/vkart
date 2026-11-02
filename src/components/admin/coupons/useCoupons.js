import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import useAdminToast from "../ui/useAdminToast";
import { emptyCoupon, formFromCoupon, payloadFromForm } from "./couponUtils";

export default function useCoupons() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useAdminToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);

  const couponsQuery = useQuery({
    queryKey: qk.admin.coupons,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/coupons/all");
      return res?.data?.coupons || [];
    },
  });

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.coupons });
    queryClient.invalidateQueries({ queryKey: qk.public.coupons });
  };

  const saveMutation = useMutation({
    mutationFn: async ({ payload, couponId }) =>
      couponId
        ? axiosInstance.patch(`/api/coupons/${couponId}`, payload)
        : axiosInstance.post("/api/coupons", payload),
    onSuccess: refreshLists,
  });

  const deleteMutation = useMutation({
    mutationFn: async (couponId) => axiosInstance.delete(`/api/coupons/${couponId}`),
    onSuccess: refreshLists,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ couponId, isActive }) =>
      axiosInstance.patch(`/api/coupons/${couponId}`, { isActive }),
    onSuccess: refreshLists,
  });

  useEffect(() => {
    if (couponsQuery.isError) showToast("Failed to load coupons", "error");
  }, [couponsQuery.isError, showToast]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCoupon);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm(formFromCoupon(c));
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code || !form.type || !form.value || !form.validTo) {
      showToast("Code, type, value and expiry date are required", "error");
      return;
    }
    try {
      await saveMutation.mutateAsync({ payload: payloadFromForm(form), couponId: editing });
      showToast(editing ? "Coupon updated" : "Coupon created");
      setShowForm(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast("Coupon deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const toggleActive = async (c) => {
    try {
      await toggleMutation.mutateAsync({ couponId: c._id, isActive: !c.isActive });
    } catch {
      showToast("Update failed", "error");
    }
  };

  return {
    toast,
    coupons: couponsQuery.data || [],
    loading: couponsQuery.isLoading,
    fetching: couponsQuery.isFetching,
    error: couponsQuery.isError ? "Failed to load coupons" : "",
    refetch: () => couponsQuery.refetch(),
    showForm,
    closeForm: () => setShowForm(false),
    editing,
    form,
    setForm,
    saving: saveMutation.isPending,
    openCreate,
    openEdit,
    save,
    remove,
    toggleActive,
  };
}
