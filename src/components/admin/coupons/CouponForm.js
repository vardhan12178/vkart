import React from "react";
import FormModal, { CheckField, Field, inputClass } from "../ui/FormModal";

export default function CouponForm({ editing, form, setForm, saving, onClose, onSubmit }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const num = (key, placeholder) => (
    <input
      type="number"
      value={form[key]}
      onChange={set(key)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
  return (
    <FormModal
      title={editing ? "Edit Coupon" : "Create Coupon"}
      saving={saving}
      submitLabel={editing ? "Update" : "Create"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <Field label="Code *" className="col-span-2">
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. SAVE10"
            className={`${inputClass} font-mono font-bold`}
          />
        </Field>
        <Field label="Description" className="col-span-2">
          <input
            value={form.description}
            onChange={set("description")}
            placeholder="Shown to users at checkout"
            className={inputClass}
          />
        </Field>
        <Field label="Type *">
          <select
            value={form.type}
            onChange={set("type")}
            className={`${inputClass} font-semibold`}
          >
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </Field>
        <Field label="Value *">
          {num("value", form.type === "percent" ? "e.g. 10" : "e.g. 100")}
        </Field>
        {form.type === "percent" && (
          <Field label="Max Discount (₹)">{num("maxDiscount", "No cap")}</Field>
        )}
        <Field label="Min Order (₹)">{num("minOrder", "0")}</Field>
        <Field label="Usage Limit">{num("usageLimit", "Unlimited")}</Field>
        <Field label="Per User Limit">{num("perUserLimit", "1")}</Field>
        <Field label="Valid From">
          <input
            type="datetime-local"
            value={form.validFrom}
            onChange={set("validFrom")}
            className={inputClass}
          />
        </Field>
        <Field label="Valid To *">
          <input
            type="datetime-local"
            value={form.validTo}
            onChange={set("validTo")}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <CheckField checked={form.isPublic} onChange={(v) => setForm({ ...form, isPublic: v })}>
          Show at checkout
        </CheckField>
        <CheckField checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })}>
          Active
        </CheckField>
      </div>
    </FormModal>
  );
}
