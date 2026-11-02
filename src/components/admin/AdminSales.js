import React from "react";
import usePermission from "./usePermission";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import AdminToast from "./ui/AdminToast";
import EmptyList from "./ui/EmptyList";
import ErrorBanner from "./ui/ErrorBanner";
import ListPageHeader from "./ui/ListPageHeader";
import SaleCards from "./sales/SaleCards";
import SaleForm from "./sales/SaleForm";
import SaleTable from "./sales/SaleTable";
import useSales from "./sales/useSales";

export default function AdminSales() {
  const { canWrite } = usePermission("sales");
  const sale = useSales();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <AdminToast toast={sale.toast} />

        <ListPageHeader
          title="Sales & Promotions"
          subtitle={`${sale.sales.length} promotional events`}
          onRefresh={sale.refetch}
          refreshing={sale.fetching}
          onCreate={canWrite ? sale.openCreate : undefined}
          createLabel="New Sale"
          createShortLabel="Sale"
        />

        <ErrorBanner message={sale.error} />

        {sale.loading ? (
          <SkeletonRegion label="Loading sales">
            <TableSkeleton rows={4} cols={4} />
          </SkeletonRegion>
        ) : sale.sales.length === 0 ? (
          <EmptyList
            title="No sales created yet"
            hint="Set up a seasonal or promotional discount event."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <SaleCards
              sales={sale.sales}
              canWrite={canWrite}
              onEdit={sale.openEdit}
              onDelete={sale.remove}
            />
            <SaleTable
              sales={sale.sales}
              canWrite={canWrite}
              onEdit={sale.openEdit}
              onDelete={sale.remove}
            />
          </div>
        )}

        {sale.showForm && <SaleForm sale={sale} onClose={sale.closeForm} onSubmit={sale.save} />}
      </div>
    </div>
  );
}
