import React from "react";
import usePermission from "./usePermission";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import AdminToast from "./ui/AdminToast";
import EmptyList from "./ui/EmptyList";
import ErrorBanner from "./ui/ErrorBanner";
import ListPageHeader from "./ui/ListPageHeader";
import CouponCards from "./coupons/CouponCards";
import CouponForm from "./coupons/CouponForm";
import CouponTable from "./coupons/CouponTable";
import useCoupons from "./coupons/useCoupons";

export default function AdminCoupons() {
  const { canWrite } = usePermission("coupons");
  const c = useCoupons();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <AdminToast toast={c.toast} />

        <ListPageHeader
          title="Coupons"
          subtitle={`${c.coupons.length} total coupons`}
          onRefresh={c.refetch}
          refreshing={c.fetching}
          onCreate={canWrite ? c.openCreate : undefined}
          createLabel="New Coupon"
          createShortLabel="Coupon"
        />

        <ErrorBanner message={c.error} />

        {c.showForm && (
          <CouponForm
            editing={c.editing}
            form={c.form}
            setForm={c.setForm}
            saving={c.saving}
            onClose={c.closeForm}
            onSubmit={c.save}
          />
        )}

        {c.loading ? (
          <SkeletonRegion label="Loading coupons">
            <TableSkeleton rows={5} cols={5} />
          </SkeletonRegion>
        ) : c.coupons.length === 0 ? (
          <EmptyList
            title="No coupons yet"
            hint="Create your first coupon to offer discounts to customers."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <CouponCards
              coupons={c.coupons}
              canWrite={canWrite}
              onToggle={c.toggleActive}
              onEdit={c.openEdit}
              onDelete={c.remove}
            />
            <CouponTable
              coupons={c.coupons}
              canWrite={canWrite}
              onToggle={c.toggleActive}
              onEdit={c.openEdit}
              onDelete={c.remove}
            />
          </div>
        )}
      </div>
    </div>
  );
}
