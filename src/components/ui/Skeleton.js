import React from "react";
import { useLocation } from "react-router-dom";

// Loading placeholders. The shimmer lives in index.css (.skeleton); users who prefer reduced motion get a still block.
export const cx = (...parts) => parts.filter(Boolean).join(" ");

export function Bone({ className = "", rounded = "rounded-md", dark = false, ...rest }) {
  return (
    <div
      aria-hidden="true"
      className={cx("skeleton", dark && "skeleton-dark", rounded, className)}
      {...rest}
    />
  );
}

// Wrapper that tells screen readers something is loading, once, instead of announcing every block.
export function SkeletonRegion({ label = "Loading", className = "", children }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

export function TextLines({ lines = 3, className = "" }) {
  return (
    <div className={cx("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} className={cx("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function CardSkeleton({ ratio = "aspect-[4/5]" }) {
  return (
    <div>
      <Bone className={ratio} rounded="rounded-2xl" />
      <Bone className="mt-3 h-3 w-1/3" />
      <Bone className="mt-2 h-4 w-4/5" />
      <Bone className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function GridSkeleton({
  count = 8,
  className = "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4",
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RailSkeleton({ count = 6 }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-36 flex-none sm:w-44">
          <Bone className="aspect-square" rounded="rounded-xl" />
          <Bone className="mt-2 h-3 w-2/3" />
          <Bone className="mt-1.5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5, className = "" }) {
  return (
    <div
      className={cx("overflow-hidden rounded-2xl border border-slate-200/70 bg-white", className)}
    >
      <div className="flex gap-4 border-b border-slate-100 p-4">
        {Array.from({ length: cols }, (_, i) => (
          <Bone key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-slate-50 p-4 last:border-0">
          {Array.from({ length: cols }, (_, c) => (
            <Bone key={c} className={cx("h-4 flex-1", c === 0 && "max-w-[8rem]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton({ rows = 3, className = "" }) {
  return (
    <div className={cx("space-y-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-line bg-paper p-4">
          <Bone className="h-20 w-20 shrink-0" rounded="rounded-xl" />
          <div className="flex-1">
            <Bone className="h-4 w-1/2" />
            <Bone className="mt-2 h-3 w-1/3" />
            <Bone className="mt-4 h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

const Shell = ({ children, className = "" }) => (
  <div className={cx("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8", className)}>
    {children}
  </div>
);

export function HomeSkeleton() {
  return (
    <SkeletonRegion label="Loading the store">
      <Shell>
        <Bone className="h-64 w-full sm:h-80 lg:h-96" rounded="rounded-3xl" />
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Bone key={i} className="aspect-square" rounded="rounded-2xl" />
          ))}
        </div>
        <Bone className="mb-4 mt-12 h-6 w-48" />
        <RailSkeleton />
      </Shell>
    </SkeletonRegion>
  );
}

export function ListingSkeleton() {
  return (
    <SkeletonRegion label="Loading products">
      <Shell>
        <Bone className="h-8 w-56" />
        <Bone className="mt-3 h-4 w-32" />
        <div className="mt-8 flex gap-8">
          <div className="hidden w-56 shrink-0 space-y-4 lg:block">
            {Array.from({ length: 5 }, (_, i) => (
              <Bone key={i} className="h-24 w-full" rounded="rounded-2xl" />
            ))}
          </div>
          <GridSkeleton
            count={8}
            className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3"
          />
        </div>
      </Shell>
    </SkeletonRegion>
  );
}

export function ProductSkeleton() {
  return (
    <SkeletonRegion label="Loading product">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-2">
          <Bone className="aspect-square w-full" rounded="rounded-3xl" />
          <div>
            <Bone className="h-3 w-24" />
            <Bone className="mt-3 h-8 w-4/5" />
            <Bone className="mt-4 h-4 w-40" />
            <Bone className="mt-6 h-9 w-44" />
            <div className="mt-8 flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Bone key={i} className="h-11 w-16" rounded="rounded-xl" />
              ))}
            </div>
            <Bone className="mt-8 h-12 w-full" rounded="rounded-full" />
            <TextLines className="mt-8" lines={4} />
          </div>
        </div>
      </Shell>
    </SkeletonRegion>
  );
}

export function CartSkeleton() {
  return (
    <SkeletonRegion label="Loading your bag">
      <Shell>
        <Bone className="h-8 w-40" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <CardListSkeleton rows={3} />
          <Bone className="h-72 w-full" rounded="rounded-2xl" />
        </div>
      </Shell>
    </SkeletonRegion>
  );
}

export function AccountSkeleton() {
  return (
    <SkeletonRegion label="Loading your account">
      <Shell>
        <div className="flex items-center gap-4">
          <Bone className="h-16 w-16" rounded="rounded-full" />
          <div className="flex-1">
            <Bone className="h-5 w-48" />
            <Bone className="mt-2 h-3 w-32" />
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_1fr]">
          <div className="hidden space-y-2 lg:block">
            {Array.from({ length: 5 }, (_, i) => (
              <Bone key={i} className="h-10 w-full" rounded="rounded-xl" />
            ))}
          </div>
          <CardListSkeleton rows={4} />
        </div>
      </Shell>
    </SkeletonRegion>
  );
}

export function ContentSkeleton() {
  return (
    <SkeletonRegion label="Loading page">
      <Shell className="max-w-3xl">
        <Bone className="h-9 w-2/3" />
        <TextLines className="mt-8" lines={6} />
        <TextLines className="mt-8" lines={5} />
      </Shell>
    </SkeletonRegion>
  );
}

export function AuthSkeleton() {
  return (
    <SkeletonRegion label="Loading">
      <Shell className="max-w-md">
        <Bone className="mx-auto h-8 w-40" />
        <div className="mt-8 space-y-4 rounded-3xl border border-line bg-paper p-6">
          <Bone className="h-12 w-full" rounded="rounded-xl" />
          <Bone className="h-12 w-full" rounded="rounded-xl" />
          <Bone className="h-12 w-full" rounded="rounded-full" />
        </div>
      </Shell>
    </SkeletonRegion>
  );
}

export function AdminSkeleton() {
  return (
    <SkeletonRegion label="Loading the admin panel" className="flex min-h-screen bg-[#f2f0eb]">
      <div className="hidden w-60 shrink-0 space-y-3 border-r border-slate-200/70 bg-white p-4 lg:block">
        <Bone className="h-8 w-28" />
        {Array.from({ length: 8 }, (_, i) => (
          <Bone key={i} className="h-9 w-full" rounded="rounded-xl" />
        ))}
      </div>
      <div className="flex-1 p-4 sm:p-8">
        <Bone className="h-8 w-56" />
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Bone key={i} className="h-24" rounded="rounded-2xl" />
          ))}
        </div>
        <TableSkeleton className="mt-6" rows={6} />
      </div>
    </SkeletonRegion>
  );
}

// Picks a layout that resembles the page being loaded, for the app-level and route-level waits.
export function RouteSkeleton() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return <AdminSkeleton />;
  if (pathname === "/") return <HomeSkeleton />;
  if (pathname === "/products" || pathname === "/compare") return <ListingSkeleton />;
  if (pathname.startsWith("/products/")) return <ProductSkeleton />;
  if (pathname.startsWith("/cart") || pathname.startsWith("/wishlist")) return <CartSkeleton />;
  if (/^\/(profile|orders|prime|order-success)/.test(pathname)) return <AccountSkeleton />;
  if (/^\/(login|register|forgot-password|reset-password|verify-email)/.test(pathname))
    return <AuthSkeleton />;
  return <ContentSkeleton />;
}

// Small in-button progress marker: three dots, no spinning ring.
export function Dots({ className = "" }) {
  return (
    <span aria-hidden="true" className={cx("inline-flex items-center gap-0.5", className)}>
      <i className="dot" />
      <i className="dot" />
      <i className="dot" />
    </span>
  );
}
