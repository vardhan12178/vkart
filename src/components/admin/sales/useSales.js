import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import useAdminToast from "../ui/useAdminToast";
import { emptyCategoryRow, emptySale, formFromSale, payloadFromForm } from "./saleUtils";

export default function useSales() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useAdminToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySale);

  const salesQuery = useQuery({
    queryKey: qk.admin.sales,
    queryFn: async () => {
      const res = await axiosInstance.get("/api/sales");
      return res?.data || [];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "sales", "categories"],
    queryFn: async () => {
      // Sales discount whole storefront categories (mobiles, fashion-women, ...)
      const res = await axiosInstance.get("/api/v2/categories");
      const list = Array.isArray(res.data) ? res.data : res.data?.categories || [];
      return list.map((entry) => entry.slug).filter(Boolean);
    },
  });

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.sales });
    queryClient.invalidateQueries({ queryKey: qk.public.activeSale });
    queryClient.invalidateQueries({ queryKey: qk.home.landing });
    queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    queryClient.invalidateQueries({ queryKey: ["products", "filters"] });
  };

  const saveMutation = useMutation({
    mutationFn: async ({ payload, saleId }) => {
      if (saleId) return axiosInstance.put(`/api/sales/${saleId}`, payload);
      return axiosInstance.post("/api/sales", payload);
    },
    onSuccess: refreshLists,
  });

  const deleteMutation = useMutation({
    mutationFn: async (saleId) => axiosInstance.delete(`/api/sales/${saleId}`),
    onSuccess: refreshLists,
  });

  useEffect(() => {
    if (salesQuery.isError) showToast("Failed to load sales", "error");
  }, [salesQuery.isError, showToast]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptySale);
    setShowForm(true);
  };

  const openEdit = (sale) => {
    setEditing(sale._id);
    setForm(formFromSale(sale));
    setShowForm(true);
  };

  const handleField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleCatField = (idx, key, val) => {
    setForm((p) => {
      const cats = [...p.categories];
      cats[idx] = { ...cats[idx], [key]: val };
      return { ...p, categories: cats };
    });
  };

  const addCategory = () =>
    setForm((p) => ({ ...p, categories: [...p.categories, { ...emptyCategoryRow }] }));

  const removeCategory = (idx) =>
    setForm((p) => ({ ...p, categories: p.categories.filter((_, i) => i !== idx) }));

  const save = async () => {
    try {
      await saveMutation.mutateAsync({ payload: payloadFromForm(form), saleId: editing });
      showToast(editing ? "Sale updated" : "Sale created");
      setShowForm(false);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save", "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast("Sale deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return {
    toast,
    sales: salesQuery.data || [],
    loading: salesQuery.isLoading,
    fetching: salesQuery.isFetching,
    error: salesQuery.isError ? "Failed to load sales" : "",
    refetch: () => salesQuery.refetch(),
    productCategories: categoriesQuery.data || [],
    showForm,
    closeForm: () => setShowForm(false),
    editing,
    form,
    saving: saveMutation.isPending,
    openCreate,
    openEdit,
    handleField,
    handleCatField,
    addCategory,
    removeCategory,
    save,
    remove,
  };
}
