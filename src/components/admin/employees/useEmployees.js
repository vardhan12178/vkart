import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import useAdminToast from "../ui/useAdminToast";

const EMPLOYEES_ENDPOINT = "/api/admin/employees";

export default function useEmployees() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useAdminToast(3500);

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);

  const employeesQuery = useQuery({
    queryKey: qk.admin.employees,
    queryFn: async () => {
      const res = await axiosInstance.get(EMPLOYEES_ENDPOINT);
      return res.data?.employees || [];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.admin.employees });

  function closeModal() {
    setModalMode(null);
    setEditingEmployee(null);
  }

  const addMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post(EMPLOYEES_ENDPOINT, payload),
    onSuccess: () => {
      invalidate();
      showToast("Employee added.");
      closeModal();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to add employee.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => axiosInstance.patch(`${EMPLOYEES_ENDPOINT}/${id}`, payload),
    onSuccess: () => {
      invalidate();
      showToast("Access updated.");
      closeModal();
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to update access.", "error"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`${EMPLOYEES_ENDPOINT}/${id}`),
    onSuccess: () => {
      invalidate();
      showToast("Access revoked.");
      setRevokeTarget(null);
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to revoke access.", "error"),
  });

  return {
    toast,
    employees: employeesQuery.data ?? [],
    loading: employeesQuery.isLoading,
    fetching: employeesQuery.isFetching,
    refetch: () => employeesQuery.refetch(),
    modalMode,
    editingEmployee,
    closeModal,
    openAdd: () => {
      setEditingEmployee(null);
      setModalMode("add");
    },
    openEdit: (employee) => {
      setEditingEmployee(employee);
      setModalMode("edit");
    },
    saving: addMutation.isPending || updateMutation.isPending,
    submit: (payload) => {
      if (modalMode === "add") addMutation.mutate(payload);
      else updateMutation.mutate({ id: editingEmployee._id, payload });
    },
    revokeTarget,
    askRevoke: setRevokeTarget,
    cancelRevoke: () => setRevokeTarget(null),
    revoking: revokeMutation.isPending,
    confirmRevoke: () => revokeMutation.mutate(revokeTarget._id),
  };
}
