import React from "react";
import { Bone, Dots } from "../ui/Skeleton";

export default function ProcessingOverlay() {
  return (
    <div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="w-72 max-w-[85vw] rounded-3xl border border-line bg-paper p-6 shadow-xl">
        <Bone className="h-4 w-2/3" />
        <Bone className="mt-3 h-3 w-full" />
        <Bone className="mt-2 h-3 w-4/5" />
        <p className="mt-5 flex items-center gap-2 text-sm font-bold text-ink">
          Processing order <Dots />
        </p>
      </div>
    </div>
  );
}
