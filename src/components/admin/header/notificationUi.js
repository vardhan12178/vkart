import React from "react";
import {
  BellIcon,
  ExclamationCircleIcon,
  ShoppingBagIcon,
  UserAddIcon,
} from "@heroicons/react/outline";

export const getNotificationIcon = (type, title = "") => {
  const titleUpper = (title || "").toUpperCase();

  if (titleUpper.includes("ORDER") || type === "order")
    return <ShoppingBagIcon className="h-5 w-5 text-[#59634f]" />;
  if (titleUpper.includes("ALERT") || type === "alert")
    return <ExclamationCircleIcon className="h-5 w-5 text-[#75483b]" />;
  if (titleUpper.includes("USER") || type === "user")
    return <UserAddIcon className="h-5 w-5 text-[#b56a3f]" />;

  // More specific checks
  if (titleUpper.includes("STOCK"))
    return <ExclamationCircleIcon className="h-5 w-5 text-[#b56a3f]" />;
  if (titleUpper.includes("PAYMENT")) return <ShoppingBagIcon className="h-5 w-5 text-[#776c5b]" />;

  return <BellIcon className="h-5 w-5 text-slate-400" />;
};

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
