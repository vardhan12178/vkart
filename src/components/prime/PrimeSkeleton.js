import React from "react";
import { Bone, SkeletonRegion } from "../ui/Skeleton";

export default function PrimeSkeleton() {
  return (
    <div className="premium-page premium-prime min-h-screen bg-[#f6f3ed]">
      <SkeletonRegion label="Loading membership plans">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Bone className="mx-auto h-9 w-72" />
          <Bone className="mx-auto mt-3 h-4 w-96 max-w-full" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Bone key={i} className="h-80" rounded="rounded-3xl" />
            ))}
          </div>
        </div>
      </SkeletonRegion>
    </div>
  );
}
