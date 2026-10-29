// Shared catalog v2 constants. Product data comes from /api/v2 (see catalogApi.js);
// catalogBundle.js holds the bundled fallback copy.

export const CATEGORIES = { mobiles: "Mobiles", laptops: "Laptops", tablets: "Tablets", tvs: "TVs", monitors: "Monitors", audio: "Audio", wearables: "Watches", skincare: "Skincare", "fashion-men": "Men's Fashion", "fashion-women": "Women's Fashion", appliances: "Appliances", "kitchen-appliances": "Kitchen", grooming: "Grooming", sports: "Sports" };

// Storefront tab for a product: fashion splits by gender, large appliances share one tab
export const catOf = (p) => (p.category === "fashion" ? `fashion-${(p.keySpecs?.gender || "men").toLowerCase()}` : p.categoryPath?.[0] === "home-appliances" ? "appliances" : p.category);
