import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";
import { Bone, SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import ManageStatus from "./order/ManageStatus";
import OrderHero from "./order/OrderHero";
import OrderItems from "./order/OrderItems";
import { CustomerCard, DeliveryCard, PaymentCard } from "./order/OrderSideCards";
import OrderTimeline from "./order/OrderTimeline";
import OrderToast from "./order/OrderToast";
import OrderTopBar from "./order/OrderTopBar";
import ReturnsRefunds from "./order/ReturnsRefunds";
import { buildTimeline } from "./order/orderStages";
import useOrderActions from "./order/useOrderActions";
import useOrderToast from "./order/useOrderToast";

const apiBase =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : process.env.REACT_APP_API_BASE_URL || "";

function LoadingOrder() {
  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-4 sm:p-6">
      <SkeletonRegion label="Loading order">
        <Bone className="h-8 w-64" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            <Bone className="h-40" rounded="rounded-2xl" />
            <TableSkeleton rows={3} cols={4} />
          </div>
          <Bone className="h-72" rounded="rounded-2xl" />
        </div>
      </SkeletonRegion>
    </div>
  );
}

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = usePermission("orders");
  const { toast, notify } = useOrderToast();

  const orderQuery = useQuery({
    queryKey: qk.admin.order(id),
    queryFn: async () => (await axiosInstance.get(`/api/admin/orders/${id}`)).data,
    enabled: Boolean(id),
  });
  const order = orderQuery.data || null;
  const actions = useOrderActions(id, order, notify);
  const timeline = useMemo(() => buildTimeline(order), [order]);

  useEffect(() => {
    if (orderQuery.isError) notify("error", "Failed to load order details.");
  }, [orderQuery.isError, notify]);

  if (orderQuery.isLoading) return <LoadingOrder />;

  // Show the error instead of a blank page when the order is missing or the fetch failed.
  if (!order) {
    return (
      <div className="premium-admin-page min-h-screen bg-transparent flex flex-col items-center justify-center p-6 gap-4">
        <OrderToast toast={toast} />
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Order not found</h2>
          <p className="text-slate-500 text-sm mt-1">
            This order may have been removed, or the link is invalid.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-black transition-all"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const copyId = (text) => {
    navigator.clipboard.writeText(text);
    notify("success", "Order ID copied to clipboard!");
  };

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <OrderToast toast={toast} />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <OrderTopBar
          orderId={order._id}
          apiBase={apiBase}
          onBack={() => navigate("/admin/orders")}
          onRefresh={() => orderQuery.refetch()}
          refreshing={orderQuery.isFetching}
        />
        <OrderHero order={order} onCopyId={copyId} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <ManageStatus
              order={order}
              canWrite={canWrite}
              pending={actions.stagePending}
              onChange={actions.updateStage}
            />
            <OrderItems products={order.products} />
            <OrderTimeline entries={timeline} />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <CustomerCard customer={order.customer} />
            <DeliveryCard address={order.shippingAddress} />
            <PaymentCard order={order} />
          </div>
        </div>

        <ReturnsRefunds order={order} canWrite={canWrite} actions={actions} />
      </div>
    </div>
  );
}
