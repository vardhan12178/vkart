import React from "react";
import { TrashIcon } from "@heroicons/react/outline";
import FormModal from "../ui/FormModal";
import { categoryLabel } from "./saleUtils";

export default function SaleForm({ sale, onClose, onSubmit }) {
  const { editing, form, saving, productCategories } = sale;
  const { handleField, handleCatField, addCategory, removeCategory } = sale;
  return (
    <FormModal
      title={editing ? "Edit Sale" : "Create Sale"}
      size="max-w-2xl"
      saving={saving}
      submitLabel={editing ? "Update Sale" : "Create Sale"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => handleField("name", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            Slug *
          </label>
          <input
            value={form.slug}
            onChange={(e) => handleField("slug", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none"
            placeholder="republic-day-sale"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
          Description
        </label>
        <input
          value={form.description}
          onChange={(e) => handleField("description", e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-slate-500/20 bg-slate-50/50 focus:bg-white outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            Start Date *
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => handleField("startDate", e.target.value)}
            required
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            End Date *
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => handleField("endDate", e.target.value)}
            required
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase">
            Category Discounts
          </label>
          <button
            type="button"
            onClick={addCategory}
            className="text-xs font-bold text-orange-600 hover:underline"
          >
            + Add Category
          </button>
        </div>
        <div className="space-y-2">
          {form.categories.map((cat, idx) => (
            <div key={idx} className="flex gap-1.5 sm:gap-2 items-center">
              <select
                value={cat.category}
                onChange={(e) => handleCatField(idx, "category", e.target.value)}
                className="flex-1 px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
              >
                <option value="">Select category</option>
                {productCategories
                  .filter(
                    (c) =>
                      c === cat.category ||
                      !form.categories.some(
                        (fc, fi) => fi !== idx && fc.category.toLowerCase() === c.toLowerCase()
                      )
                  )
                  .map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                value={cat.discountPercent}
                onChange={(e) => handleCatField(idx, "discountPercent", e.target.value)}
                placeholder="Disc %"
                min="1"
                max="95"
                className="w-16 sm:w-20 px-2 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
              />
              <input
                type="number"
                value={cat.primeDiscountPercent}
                onChange={(e) => handleCatField(idx, "primeDiscountPercent", e.target.value)}
                placeholder="Prime %"
                min="0"
                max="95"
                className="w-16 sm:w-20 px-2 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
              />
              {form.categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  className="text-red-400 hover:text-red-600 transition p-1 shrink-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => handleField("isActive", e.target.checked)}
          className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
        />
        <span className="text-xs sm:text-sm font-bold text-slate-700">Active</span>
      </label>
    </FormModal>
  );
}
