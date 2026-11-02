import React from "react";
import usePermission from "./usePermission";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import AdminToast from "./ui/AdminToast";
import EmptyList from "./ui/EmptyList";
import ErrorBanner from "./ui/ErrorBanner";
import ListPageHeader from "./ui/ListPageHeader";
import PlanCard from "./membership/PlanCard";
import PlanForm from "./membership/PlanForm";
import useMembership from "./membership/useMembership";

export default function AdminMembership() {
  const { canWrite } = usePermission("membership");
  const m = useMembership();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <AdminToast toast={m.toast} />

        <ListPageHeader
          title="Prime Membership Plans"
          subtitle={`${m.plans.length} subscription tiers`}
          onRefresh={m.refetch}
          refreshing={m.fetching}
          onCreate={canWrite ? m.openCreate : undefined}
          createLabel="New Plan"
          createShortLabel="Plan"
        />

        <ErrorBanner message={m.error} />

        {m.loading ? (
          <SkeletonRegion label="Loading plans">
            <TableSkeleton rows={4} cols={4} />
          </SkeletonRegion>
        ) : m.plans.length === 0 ? (
          <EmptyList
            title="No plans created yet"
            hint="Create your first membership tier to offer premium perks."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {m.plans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                canWrite={canWrite}
                onEdit={m.openEdit}
                onDelete={m.remove}
              />
            ))}
          </div>
        )}

        {m.showForm && <PlanForm plan={m} onClose={m.closeForm} onSubmit={m.save} />}
      </div>
    </div>
  );
}
