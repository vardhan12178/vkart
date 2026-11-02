import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { PackageOpenIcon } from "../ui/icons";
import { Bone } from "../ui/Skeleton";

const OrderCard = lazy(() => import("../OrderCard"));

export default function OrdersTab({ orders }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-line min-h-[400px] p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-line pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-ink">Order History</h2>
          <p className="text-muted text-xs sm:text-sm">Track your recent purchases</p>
        </div>
        <span className="bg-ink text-white px-2.5 py-1 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold">
          {orders.length} Total
        </span>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Bone key={i} className="h-24" rounded="rounded-2xl" />
            ))}
          </div>
        }
      >
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center text-muted-faint mx-auto mb-4 text-3xl">
              <PackageOpenIcon />
            </div>
            <h3 className="text-lg font-bold text-ink">No orders yet</h3>
            <p className="text-muted text-sm mb-6">Start shopping to fill this page.</p>
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl bg-ink text-white font-bold shadow-lg hover:bg-black transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
