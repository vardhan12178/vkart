import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ArrowRight } from "lucide-react";
import { CATEGORIES } from "../shop/catalogData";
import { iconFor } from "../shop/categoryIcons";
import { fetchCategories } from "../shop/catalogApi";

export const CATEGORY_GROUPS = [
  { title: "Electronics", keys: ["mobiles", "laptops", "tablets", "tvs", "monitors", "audio", "wearables"] },
  { title: "Fashion & beauty", keys: ["fashion-men", "fashion-women", "skincare", "grooming"] },
  { title: "Home & living", keys: ["appliances", "kitchen-appliances", "sports"] },
];

export const useCategoryCounts = (enabled = true) => {
  const { data } = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCategories,
    enabled,
    staleTime: 10 * 60 * 1000,
  });
  const list = Array.isArray(data) ? data : data?.categories || [];
  return Object.fromEntries(list.map((c) => [c.slug, c.count]));
};

// Desktop "Categories" mega menu: opens on hover or click, closes on Escape, outside click or navigation
export default function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const location = useLocation();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const timer = useRef(null);
  const counts = useCategoryCounts(touched);

  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = () => { clearTimeout(timer.current); setTouched(true); timer.current = setTimeout(() => setOpen(true), 120); };
  const hide = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), 180); };
  const active = location.pathname === "/products" && new URLSearchParams(location.search).has("cat");

  return (
    <div ref={rootRef} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="categories-menu"
        onClick={() => { clearTimeout(timer.current); setTouched(true); setOpen((o) => !o); }}
        onFocus={() => setTouched(true)}
        className={`relative flex items-center gap-1 px-3 xl:px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${open || active ? "text-ink" : "text-[#5f5b52] hover:text-ink"}`}
      >
        Categories
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>

      {open && (
        <div id="categories-menu" className="absolute left-0 top-full z-50 pt-3">
          <div className="w-[min(46rem,calc(100vw-4rem))] overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_24px_60px_-20px_rgba(29,28,25,0.35)]">
            <div className="grid grid-cols-3 gap-x-6 p-6">
              {CATEGORY_GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-light">{g.title}</p>
                  <ul>
                    {g.keys.map((key) => {
                      const Icon = iconFor(key);
                      return (
                        <li key={key}>
                          <Link
                            to={`/products?cat=${key}`}
                            className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-sand"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tint text-ink-soft transition-colors group-hover:bg-ink group-hover:text-white">
                              <Icon size={15} />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{CATEGORIES[key]}</span>
                            {counts[key] > 0 && <span className="text-xs text-muted-faint">{counts[key]}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line bg-sand px-6 py-3.5 text-sm">
              <Link to="/products" className="inline-flex items-center gap-1.5 font-bold text-ink hover:text-accent">
                Browse all products <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link to="/products?sort=discount" className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline underline-offset-4">
                Biggest discounts today <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
