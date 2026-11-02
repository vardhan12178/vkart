export const emptyPlan = {
  name: "",
  slug: "",
  durationDays: "",
  price: "",
  originalPrice: "",
  features: [""],
  isPopular: false,
  isActive: true,
  sortOrder: 0,
};

export const formFromPlan = (plan) => ({
  name: plan.name,
  slug: plan.slug,
  durationDays: plan.durationDays,
  price: plan.price,
  originalPrice: plan.originalPrice || "",
  features: plan.features?.length ? plan.features : [""],
  isPopular: plan.isPopular || false,
  isActive: plan.isActive,
  sortOrder: plan.sortOrder || 0,
});

export const payloadFromForm = (form) => ({
  ...form,
  durationDays: Number(form.durationDays),
  price: Number(form.price),
  originalPrice: Number(form.originalPrice) || undefined,
  sortOrder: Number(form.sortOrder) || 0,
  features: form.features.filter((f) => f.trim()),
});
