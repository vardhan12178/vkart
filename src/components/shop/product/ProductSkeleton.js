import React from "react";
import { Bone, SkeletonRegion } from "../../ui/Skeleton";

export default function ProductSkeleton() {
  return (
    <div className="bg-sand pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <SkeletonRegion label="Loading product">
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-paper p-6 shadow-sm lg:grid-cols-2 lg:p-8">
            <Bone className="aspect-square" rounded="rounded-2xl" />
            <div className="space-y-4">
              <Bone className="h-4 w-1/4" />
              <Bone className="h-8 w-3/4" />
              <Bone className="h-10 w-1/3" />
              <Bone className="h-24" rounded="rounded-2xl" />
            </div>
          </div>
        </SkeletonRegion>
      </div>
    </div>
  );
}
