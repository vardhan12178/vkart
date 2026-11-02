import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import { PAGE_SIZE, sortOrders } from "./orderListUtils";

export default function useOrdersList() {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("ALL");
  const [filterReturns, setFilterReturns] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [page, setPage] = useState(1);

  const ordersQuery = useQuery({
    queryKey: qk.admin.orders,
    queryFn: async () => {
      const response = await axiosInstance.get("/api/admin/orders");
      const raw = response.data ?? [];
      return Array.isArray(raw) ? raw : raw.items || raw.orders || [];
    },
  });

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const activeOrders = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.stage)).length;
    const completedOrders = orders.filter((o) => o.stage === "DELIVERED").length;
    return { totalRevenue, activeOrders, completedOrders };
  }, [orders]);

  const filtered = useMemo(() => {
    let result = [...orders];

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          (o.customer?.name || "").toLowerCase().includes(q) ||
          (o.customer?.email || "").toLowerCase().includes(q)
      );
    }
    if (filterStage !== "ALL") result = result.filter((o) => o.stage === filterStage);
    if (filterReturns) result = result.filter((o) => o.returnStatus && o.returnStatus !== "NONE");

    return sortOrders(result, sortConfig);
  }, [orders, search, filterStage, filterReturns, sortConfig]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStage, filterReturns]);

  return {
    loading: ordersQuery.isLoading,
    fetching: ordersQuery.isFetching,
    refetch: () => ordersQuery.refetch(),
    stats,
    search,
    setSearch,
    filterStage,
    setFilterStage,
    filterReturns,
    toggleReturns: () => setFilterReturns((v) => !v),
    clearFilters: () => {
      setSearch("");
      setFilterStage("ALL");
      setFilterReturns(false);
    },
    sortConfig,
    sort: (key) =>
      setSortConfig((current) => ({
        key,
        direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
      })),
    filtered,
    pageOrders: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    setPage,
  };
}
