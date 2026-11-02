import React from "react";
import {
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@heroicons/react/outline";
import { formatINR } from "../../../utils/format";
import { fadeInClass } from "./dashboardData";
import { StatCard } from "./DashboardParts";

export default function StatsGrid({ stats, users }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      <div className={fadeInClass(0)}>
        <StatCard
          title="Total Revenue"
          value={formatINR(stats.totalRevenue)}
          subtitle="Gross Income"
          icon={<CurrencyRupeeIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />}
          gradient="from-[#b56a3f] to-[#8f4e2f]"
          trend="+12.5%"
          trendUp={true}
        />
      </div>
      <div className={fadeInClass(100)}>
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All time"
          icon={<ShoppingBagIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />}
          gradient="from-[#2f2d28] to-[#4f4a42]"
          trend={`+${stats.thisMonthOrders} this mo`}
          trendUp={true}
        />
      </div>
      <div className={fadeInClass(200)}>
        <StatCard
          title="Avg. Order"
          value={formatINR(stats.avgOrderValue)}
          subtitle="Per Order"
          icon={<TrendingUpIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />}
          gradient="from-[#59634f] to-[#414a39]"
          trend="+2.4%"
          trendUp={true}
        />
      </div>
      <div className={fadeInClass(300)}>
        <StatCard
          title="Customers"
          value={stats.activeCustomers || users.length}
          subtitle="Total Users"
          icon={<UsersIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />}
          gradient="from-[#8b6653] to-[#6f4c3d]"
          trend={`+${users.length}`}
          trendUp={true}
        />
      </div>
    </div>
  );
}
