import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { showToast } from "../../../utils/toast";
import { API, errorText } from "./catalogConfig";

export default function VariantRow({ productId, v, canWrite, onSaved }) {
  const [form, setForm] = useState({ price: v.price, mrp: v.mrp, stock: v.stock });
  useEffect(() => {
    setForm({ price: v.price, mrp: v.mrp, stock: v.stock });
  }, [v.price, v.mrp, v.stock]);
  const changed = ["price", "mrp", "stock"].filter((k) => Number(form[k]) !== v[k]);
  const invalid = !(Number(form.price) > 0)
    ? "Price must be more than zero"
    : Number(form.mrp) < Number(form.price)
      ? "MRP can't be lower than price"
      : !(Number(form.stock) >= 0)
        ? "Stock can't be negative"
        : "";

  const save = useMutation({
    mutationFn: () =>
      axiosInstance
        .patch(
          `${API}/${productId}/variants/${encodeURIComponent(v.sku)}`,
          Object.fromEntries(changed.map((k) => [k, Number(form[k])]))
        )
        .then((r) => r.data),
    onSuccess: (row) => {
      onSaved(row);
      showToast(`Saved ${v.label}`, "success");
    },
    onError: (err) => showToast(errorText(err), "error"),
  });

  const field = (key, label) => (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 md:sr-only">
        {label}
      </span>
      <input
        type="number"
        min={key === "stock" ? 0 : 1}
        inputMode="numeric"
        disabled={!canWrite || save.isPending}
        aria-label={`${label} for ${v.label}`}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`w-full rounded-lg border px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50 ${
          Number(form[key]) !== v[key]
            ? "border-orange-300 bg-orange-50/40"
            : "border-slate-200 bg-white"
        }`}
      />
    </label>
  );

  return (
    <div className="grid grid-cols-2 items-end gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))_5rem] md:items-center md:gap-3">
      <div className="col-span-2 min-w-0 md:col-span-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {v.label}{" "}
          {v.isDefault && (
            <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              DEFAULT
            </span>
          )}
        </p>
        <p className="truncate font-mono text-[11px] text-slate-400">{v.sku}</p>
      </div>
      {field("price", "Price")}
      {field("mrp", "MRP")}
      {field("stock", "Stock")}
      <div className="col-span-2 flex justify-end md:col-span-1">
        {canWrite && (
          <button
            type="button"
            disabled={!changed.length || Boolean(invalid) || save.isPending}
            onClick={() => save.mutate()}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
        )}
      </div>
      {invalid && changed.length > 0 && (
        <p className="col-span-full text-right text-[11px] font-semibold text-red-600" role="alert">
          {invalid}
        </p>
      )}
    </div>
  );
}
