import React from "react";
import { CubeIcon } from "@heroicons/react/outline";

const Thumb = ({ product, size, icon }) =>
  product.image ? (
    <img src={product.image} alt={product.name} className={size} />
  ) : (
    <div className="h-full w-full flex items-center justify-center text-slate-300">
      <CubeIcon className={icon} />
    </div>
  );

export default function OrderItems({ products = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <CubeIcon className="h-4 w-4 text-orange-500" />
          Order Items
        </h3>
        <span className="text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
          {products.length} Items
        </span>
      </div>

      <div className="block md:hidden divide-y divide-slate-100">
        {products.map((p, idx) => (
          <div key={idx} className="p-3 flex items-center gap-3">
            <div className="h-12 w-12 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 p-0.5">
              <Thumb
                product={p}
                size="h-full w-full object-contain mix-blend-multiply"
                icon="h-5 w-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-slate-400">SKU: VK-{idx + 1024}</span>
                <span>·</span>
                <span>Qty: {p.quantity}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-slate-900">
                ₹{((p.price || 0) * (p.quantity || 0)).toLocaleString("en-IN")}
              </p>
              {p.quantity > 1 && (
                <p className="text-[10px] text-slate-400">₹{p.price?.toLocaleString("en-IN")} ea</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-center">Price</th>
              <th className="px-6 py-3 text-center">Qty</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p, idx) => (
              <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group-hover:border-orange-200 transition-colors">
                      <Thumb product={p} size="h-full w-full object-contain" icon="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">SKU: VK-{idx + 1024}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-600">
                  ₹{p.price?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium text-slate-900">
                  {p.quantity}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                  ₹{((p.price || 0) * (p.quantity || 0)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
