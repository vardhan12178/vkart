export const emptyCoupon = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minOrder: "",
  usageLimit: "",
  perUserLimit: "1",
  validFrom: "",
  validTo: "",
  isPublic: false,
  isActive: true,
};

export const formFromCoupon = (c) => ({
  code: c.code || "",
  description: c.description || "",
  type: c.type || "percent",
  value: c.value ?? "",
  maxDiscount: c.maxDiscount ?? "",
  minOrder: c.minOrder ?? "",
  usageLimit: c.usageLimit ?? "",
  perUserLimit: c.perUserLimit ?? "1",
  validFrom: c.validFrom ? c.validFrom.slice(0, 16) : "",
  validTo: c.validTo ? c.validTo.slice(0, 16) : "",
  isPublic: !!c.isPublic,
  isActive: c.isActive !== false,
});

export const payloadFromForm = (form) => ({
  ...form,
  value: Number(form.value),
  maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
  minOrder: form.minOrder ? Number(form.minOrder) : 0,
  usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
  perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
});

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export const isExpired = (d) => d && new Date(d) < new Date();
