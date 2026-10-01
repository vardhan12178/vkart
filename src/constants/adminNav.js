import {
  ClipboardList,
  Headset,
  LayoutDashboard,
  Package,
  Settings,
  Sparkles,
  Star,
  Tag,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";

// Admin sections, shared by the sidebar and the header quick search.
// `module` is the permission gate (null = always visible); `searchable`
// marks list pages that accept a `?q=` search term.
export const ADMIN_NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", module: null },
  { name: "Products", icon: Package, path: "/admin/products", module: "products", searchable: true },
  { name: "Orders", icon: ClipboardList, path: "/admin/orders", module: "orders", searchable: true },
  { name: "Reviews", icon: Star, path: "/admin/reviews", module: "reviews", searchable: true },
  { name: "Coupons", icon: Tag, path: "/admin/coupons", module: "coupons" },
  { name: "Sales", icon: Zap, path: "/admin/sales", module: "sales" },
  { name: "Membership", icon: Sparkles, path: "/admin/membership", module: "membership" },
  { name: "Users", icon: Users, path: "/admin/users", module: "users", searchable: true },
  { name: "Support", icon: Headset, path: "/admin/support", module: "support" },
  { name: "Employees", icon: UsersRound, path: "/admin/employees", module: "employees" },
  { name: "Settings", icon: Settings, path: "/admin/settings", module: "settings" },
];
