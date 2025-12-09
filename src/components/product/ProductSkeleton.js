import React from "react";

const ProductSkeleton = () => (
    <div className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
        <div className="aspect-[3/4] w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="mt-4 space-y-2">
            <div className="h-3 w-1/3 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-4 w-3/4 rounded-full bg-gray-100 animate-pulse" />
            <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-20 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-6 w-6 rounded-full bg-gray-100 animate-pulse" />
            </div>
        </div>
    </div>
);

export default ProductSkeleton;
