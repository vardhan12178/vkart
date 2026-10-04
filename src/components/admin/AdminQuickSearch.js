import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "@heroicons/react/outline";
import { ArrowRight } from "lucide-react";
import { canAccess } from "../../utils/adminPermissions";
import { ADMIN_NAV } from "../../constants/adminNav";

const isTypingTarget = (el) =>
  el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

/**
 * Header search for the admin panel. Typing offers two kinds of results:
 * "search <list page> for <term>" (opens that page with ?q=<term>) and
 * jumps to matching sections. Both are filtered by the admin's permissions.
 */
export default function AdminQuickSearch({ adminRole, permissions, variant = "desktop", autoFocus = false, onDone }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const sections = useMemo(
    () => ADMIN_NAV.filter((item) => canAccess(adminRole, permissions, item.module, "read")),
    [adminRole, permissions]
  );

  const results = useMemo(() => {
    const term = query.trim();
    const lower = term.toLowerCase();
    const searches = term
      ? sections
          .filter((item) => item.searchable)
          .map((item) => ({
            key: `search-${item.path}`,
            icon: item.icon,
            label: `Search ${item.name.toLowerCase()} for “${term}”`,
            to: `${item.path}?q=${encodeURIComponent(term)}`,
          }))
      : [];
    const jumps = sections
      .filter((item) => !lower || item.name.toLowerCase().includes(lower))
      .map((item) => ({ key: `go-${item.path}`, icon: item.icon, label: `Go to ${item.name}`, to: item.path }));
    return [...searches, ...jumps];
  }, [query, sections]);

  useEffect(() => setActive(0), [query]);

  // "/" focuses the desktop search from anywhere in the admin, matching the
  // keyboard hint shown inside the input.
  useEffect(() => {
    if (variant !== "desktop") return undefined;
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  const go = (result) => {
    if (!result) return;
    navigate(result.to);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    onDone?.();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      onDone?.();
    }
  };

  const desktop = variant === "desktop";
  const showResults = (open || !desktop) && results.length > 0;

  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon
          className={desktop ? "h-4 w-4 text-[#8b867d] transition-colors group-focus-within:text-[#a85d37]" : "h-5 w-5 text-slate-400"}
        />
      </div>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        type="search"
        role="combobox"
        aria-expanded={showResults}
        aria-controls={`admin-quick-search-${variant}`}
        aria-activedescendant={showResults ? `admin-quick-search-${variant}-${active}` : undefined}
        aria-label="Search the admin panel"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={
          desktop
            ? `
                block w-full pl-11 pr-20 py-2.5
                rounded-full border-0
                bg-[#f1ede5] hover:bg-[#eee9e0] focus:bg-[#fffdf8]
                text-[#1d1c19] placeholder-[#99948a]
                ring-1 ring-black/[0.07] focus:ring-[#a85d37]/20
                transition-all duration-200
                text-sm font-medium outline-hidden
              `
            : `
                block w-full pl-11 pr-4 py-3
                rounded-xl border border-slate-200
                bg-slate-50 text-slate-900 placeholder-slate-500
                focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10
                transition-all duration-200 text-sm font-medium outline-hidden
              `
        }
        placeholder="Search the operation"
      />
      {desktop && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="hidden h-6 items-center rounded-full border border-black/10 bg-[#fffdf8] px-2 text-[10px] font-bold text-[#777269] sm:inline-flex">
            /
          </kbd>
        </div>
      )}

      {showResults && (
        <ul
          id={`admin-quick-search-${variant}`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-[1.15rem] border border-black/8 bg-[#fffdf8] py-1.5 shadow-[0_24px_70px_rgba(29,28,25,.16)]"
        >
          {results.map((result, i) => {
            const Icon = result.icon;
            return (
              <li
                key={result.key}
                id={`admin-quick-search-${variant}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (not click) so the choice lands before the input's blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(result);
                }}
                onMouseEnter={() => setActive(i)}
                className={`mx-1.5 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  i === active ? "bg-[#eee8df] text-[#1d1c19]" : "text-[#5f5a52]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#8b867d]" strokeWidth={1.8} />
                <span className="min-w-0 flex-1 truncate">{result.label}</span>
                {i === active && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a85d37]" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
