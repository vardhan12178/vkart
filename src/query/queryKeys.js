export const qk = {
  auth: {
    session: ["auth", "session"],
    adminVerify: ["auth", "admin-verify"],
  },
  home: {
    landing: ["home", "landing"],
  },
  products: {
    list: (params = {}) => ["products", "list", params],
    filters: (params = {}) => ["products", "filters", params],
    details: (id) => ["products", "details", id],
    suggest: (q) => ["products", "suggest", q],
    categories: ["products", "categories"],
    related: (id, category) => ["products", "related", id, category],
    recent: (id) => ["products", "recent", id],
  },
  profile: {
    root: ["profile"],
    orders: ["profile", "orders"],
    addresses: ["profile", "addresses"],
    wallet: ["profile", "wallet"],
    cart: ["profile", "cart"],
    wishlist: ["profile", "wishlist"],
  },
  admin: {
    settings: ["admin", "settings"],
    dashboard: ["admin", "dashboard"],
    notifications: ["admin", "notifications"],
    users: ["admin", "users"],
    orders: ["admin", "orders"],
    order: (id) => ["admin", "orders", id],
    products: ["admin", "products"],
    reviews: ["admin", "reviews"],
    coupons: ["admin", "coupons"],
    sales: ["admin", "sales"],
    membershipPlans: ["admin", "membership", "plans"],
    membershipStatus: ["admin", "membership", "status"],
  },
  public: {
    announcements: ["public", "announcements"],
    activeSale: ["public", "active-sale"],
    coupons: ["public", "coupons"],
  },
  membership: {
    plans: ["membership", "plans"],
    status: ["membership", "status"],
  },
};
