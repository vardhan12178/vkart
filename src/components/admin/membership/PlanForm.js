import React from "react";
import { TrashIcon } from "@heroicons/react/outline";
import FormModal from "../ui/FormModal";

export default function PlanForm({ plan, onClose, onSubmit }) {
  const { editing, form, saving, handleField, handleFeature, addFeature, removeFeature } = plan;
  return (
    <FormModal
      title={editing ? "Edit Plan" : "Create Plan"}
      saving={saving}
      submitLabel={editing ? "Update Plan" : "Create Plan"}
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
            placeholder="Monthly"
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
            placeholder="monthly"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            Duration (days)
          </label>
          <input
            type="number"
            value={form.durationDays}
            onChange={(e) => handleField("durationDays", e.target.value)}
            required
            min="1"
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            Price (₹)
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleField("price", e.target.value)}
            required
            min="0"
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1 block">
            Original ₹
          </label>
          <input
            type="number"
            value={form.originalPrice}
            onChange={(e) => handleField("originalPrice", e.target.value)}
            min="0"
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Features */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase">
            Features
          </label>
          <button
            type="button"
            onClick={addFeature}
            className="text-xs font-bold text-orange-600 hover:underline"
          >
            + Add Feature
          </button>
        </div>
        <div className="space-y-2">
          {form.features.map((f, idx) => (
            <div key={idx} className="flex gap-1.5 sm:gap-2">
              <input
                value={f}
                onChange={(e) => handleFeature(idx, e.target.value)}
                placeholder="Feature perk text"
                className="flex-1 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none"
              />
              {form.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-red-400 hover:text-red-600 p-1 shrink-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => handleField("isPopular", e.target.checked)}
            className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs sm:text-sm font-bold text-slate-700">Popular</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleField("isActive", e.target.checked)}
            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-xs sm:text-sm font-bold text-slate-700">Active</span>
        </label>
        <div className="ml-auto flex items-center gap-1.5">
          <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Sort</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => handleField("sortOrder", e.target.value)}
            className="w-14 px-2 py-1 rounded-xl border border-slate-200 text-xs font-bold text-center bg-slate-50/50"
          />
        </div>
      </div>
    </FormModal>
  );
}
