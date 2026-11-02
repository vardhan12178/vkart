import React from "react";
import { Bone, SkeletonRegion } from "../../ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <SkeletonRegion label="Loading dashboard" className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Bone key={i} className="h-28 sm:h-36" rounded="rounded-2xl sm:rounded-[1.5rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 sm:gap-6">
        <Bone className="xl:col-span-2 h-64 sm:h-80" rounded="rounded-2xl sm:rounded-[1.5rem]" />
        <Bone className="h-64 sm:h-80" rounded="rounded-2xl sm:rounded-[1.5rem]" />
      </div>
    </SkeletonRegion>
  );
}
