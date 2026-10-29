import React, { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

// Dropdown in VKart's colours (ink #1d1c19, terracotta #a85d37, cream #fffdf8).
// `up` opens the menu above the button (for bars fixed to the bottom of the screen).
export default function BrandSelect({ options, value, onChange, label, prefix, up = false, className = "", buttonClassName = "" }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); };
  }, [open]);

  const choose = (o) => { onChange(o.value); setOpen(false); };
  const onKey = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); setHi(Math.max(0, options.indexOf(current))); return; }
      setHi((i) => (i + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
    } else if ((e.key === "Enter" || e.key === " ") && open && hi >= 0) {
      e.preventDefault();
      choose(options[hi]);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={onKey}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => { setOpen(!open); setHi(options.indexOf(current)); }}
        className={`flex w-full items-center justify-between gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold text-[#1d1c19] transition ${open ? "border-[#1d1c19] ring-2 ring-[#a85d37]/20" : "border-[#d9d2c5] hover:border-[#1d1c19]"} ${buttonClassName}`}>
        <span className="truncate">{prefix && <span className="font-normal text-[#8b867d]">{prefix} </span>}{current?.label ?? label}</span>
        <FiChevronDown className={`flex-none text-[#8b867d] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul role="listbox" aria-label={label}
          className={`absolute right-0 z-50 max-h-72 min-w-full overflow-auto rounded-2xl border border-[#ebe5da] bg-[#fffdf8] p-1.5 shadow-[0_16px_40px_-12px_rgba(29,28,25,0.35)] ${up ? "bottom-full mb-2" : "top-full mt-2"}`}>
          {options.map((o, i) => {
            const active = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={active}>
                <button type="button" onClick={() => choose(o)} onMouseEnter={() => setHi(i)}
                  className={`flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition ${active ? "bg-[#1d1c19] font-semibold text-white" : i === hi ? "bg-[#f1ece3] text-[#1d1c19]" : "text-[#3d3a35]"}`}>
                  {o.label}
                  {active && <FiCheck className="text-[#e0a37f]" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
