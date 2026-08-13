// Single source of truth for admin role labels and the module permission
// list, mirroring backend/config/permissions.js. Previously duplicated
// across AdminHeader.js, AdminEmployees.js, and AdminProfile.js.

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  product_manager: "Product Manager",
  customer_service: "Customer Service",
  reviewer: "Reviewer",
  order_manager: "Order Manager",
  sales_manager: "Sales Manager",
};

export const MODULES = [
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "coupons", label: "Coupons" },
  { key: "sales", label: "Sales" },
  { key: "membership", label: "Membership" },
  { key: "users", label: "Users" },
  { key: "reviews", label: "Reviews" },
  { key: "settings", label: "Settings" },
  { key: "notifications", label: "Notifications" },
  { key: "employees", label: "Employees" },
];

export const ROLE_PRESETS = {
  super_admin: {},
  product_manager: { products: "write" },
  customer_service: { users: "write" },
  reviewer: { reviews: "write" },
  order_manager: { orders: "write" },
  sales_manager: { coupons: "write", sales: "write", membership: "write" },
};
