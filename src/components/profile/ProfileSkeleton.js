import React from "react";
import { Bone, SkeletonRegion } from "../ui/Skeleton";

export default function ProfileSkeleton() {
  return (
    <SkeletonRegion
      label="Loading your account"
      className="min-h-screen bg-sand py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-line flex flex-col sm:flex-row items-center gap-8">
          <Bone className="h-32 w-32 shrink-0" rounded="rounded-full" />
          <div className="flex-1 space-y-4 w-full">
            <Bone className="h-8 w-48" />
            <Bone className="h-4 w-32" />
            <div className="flex gap-2 pt-2">
              <Bone className="h-10 w-24" />
              <Bone className="h-10 w-24" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Bone key={i} className="h-40" rounded="rounded-3xl" />
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}
