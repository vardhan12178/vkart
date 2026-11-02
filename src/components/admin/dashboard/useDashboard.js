import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { qk } from "../../../query/queryKeys";
import {
  computeStats,
  filterByRange,
  greetingNow,
  recentOrdersOf,
  revenueByDay,
  stageSeries,
  topProductsOf,
} from "./dashboardData";

export default function useDashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const dashboardQuery = useQuery({
    queryKey: qk.admin.dashboard,
    queryFn: async () => {
      const [ordersRes, usersRes] = await Promise.all([
        axiosInstance.get("/api/admin/orders"),
        axiosInstance.get("/api/admin/users"),
      ]);

      const rawOrders = ordersRes.data ?? [];
      const rawUsers = usersRes.data ?? [];

      return {
        orders: Array.isArray(rawOrders) ? rawOrders : rawOrders.items || rawOrders.orders || [],
        users: Array.isArray(rawUsers) ? rawUsers : rawUsers.items || rawUsers.users || [],
      };
    },
  });

  const orders = useMemo(() => dashboardQuery.data?.orders ?? [], [dashboardQuery.data]);
  const users = useMemo(() => dashboardQuery.data?.users ?? [], [dashboardQuery.data]);

  const filteredOrders = useMemo(() => filterByRange(orders, timeRange), [orders, timeRange]);
  const stats = useMemo(() => computeStats(orders), [orders]);
  const stageData = useMemo(() => stageSeries(filteredOrders), [filteredOrders]);
  const revenueSeries = useMemo(
    () => revenueByDay(filteredOrders, timeRange),
    [filteredOrders, timeRange]
  );
  const topProducts = useMemo(() => topProductsOf(filteredOrders), [filteredOrders]);
  const recentOrders = useMemo(() => recentOrdersOf(orders), [orders]);
  const greeting = useMemo(() => greetingNow(), []);

  return {
    timeRange,
    setTimeRange,
    refetch: () => dashboardQuery.refetch(),
    fetching: dashboardQuery.isFetching,
    loading: dashboardQuery.isLoading,
    error: dashboardQuery.isError ? "Could not sync dashboard data." : "",
    orders,
    users,
    stats,
    stageData,
    revenueSeries,
    topProducts,
    recentOrders,
    greeting,
  };
}
