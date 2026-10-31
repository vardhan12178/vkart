import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Clock, Search, Sparkles, X, ArrowUpRight } from "lucide-react";
import axios from "../axiosInstance";
import { askChat } from "../../redux/uiSlice";
import { fetchProducts, formatPrice } from "../catalogPreview/catalogApi";
import { iconFor } from "../catalogPreview/categoryIcons";
import { buildItems, categoryHref, readRecent, saveRecent, removeRecent, clearRecent } from "./searchSuggest";

const SORT_MAP = { price_asc: "price-asc", price_desc: "price-desc" };

// Header search with a combobox dropdown: recent searches and popular categories on focus, then
// matching categories, products and an "Ask VKart" hand-off while typing. Enter runs the query
// through the AI parser so "phones under 30000" lands on the listing with a price range.
export default function HeaderSearch({ variant = "desktop", autoFocus = false, onDone }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const seqRef = useRef(0);

  const [text, setText] = useState("");
  const [products, setProducts] = useState([]);
  const [recent, setRecent] = useState(readRecent);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [parsing, setParsing] = useState(false);

  const typed = text.trim().length >= 2;
  const items = useMemo(() => buildItems({ query: text, products: typed ? products : [], recent }), [text, typed, products, recent]);

  useEffect(() => {
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("mousedown", onDown); clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => { setActive(-1); }, [text, open]);

  const loadProducts = (q) => {
    const seq = ++seqRef.current;
    if (q.trim().length < 2) { setProducts([]); return; }
    fetchProducts({ q: q.trim(), limit: 5 })
      .then((res) => { if (seq === seqRef.current) setProducts(res?.products || []); })
      .catch(() => { if (seq === seqRef.current) setProducts([]); });
  };

  const finish = ({ clear = false } = {}) => {
    setOpen(false);
    if (clear) { setText(""); setProducts([]); }
    inputRef.current?.blur();
    onDone?.();
  };

  const remember = (value) => setRecent(saveRecent(value));

  const runSearch = async (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    remember(trimmed);
    setText(trimmed);
    finish();
    setParsing(true);
    try {
      const res = await axios.post("/api/ai/parse-search", { query: trimmed });
      const { q, category, minPrice, maxPrice, sort } = res.data;
      // The parser's category names come from the old catalog, so they are used as keywords
      const params = new URLSearchParams();
      params.set("q", q || (category ? category.replace(/-/g, " ") : trimmed));
      if (minPrice != null) params.set("min", String(minPrice));
      if (maxPrice != null) params.set("max", String(maxPrice));
      if (sort && SORT_MAP[sort]) params.set("sort", SORT_MAP[sort]);
      navigate(`/products?${params.toString()}`);
    } catch {
      // AI search is a nice-to-have, never a blocker - fall back to plain search.
      navigate(`/products?q=${encodeURIComponent(trimmed)}`);
    } finally {
      setParsing(false);
    }
  };

  const pick = (item) => {
    if (item.type === "recent") return runSearch(item.text);
    if (item.type === "ask") {
      remember(item.text);
      dispatch(askChat(item.text));
      return finish({ clear: true });
    }
    if (typed) remember(text);
    navigate(item.type === "product" ? `/products/${item.product.slug}` : categoryHref(item));
    return finish({ clear: true });
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      const step = e.key === "ArrowDown" ? 1 : -1;
      // Cycles through the options and back to the input itself (-1)
      setActive((i) => ((i + step + items.length + 2) % (items.length + 1)) - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && active >= 0 && items[active]) pick(items[active]);
      else runSearch(text);
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else if (text) setText("");
    }
  };

  const optionId = (i) => `${listId}-opt-${i}`;
  const showList = open && items.length > 0;
  const desktop = variant === "desktop";

  return (
    <form role="search" ref={rootRef} className="relative w-full" onSubmit={(e) => { e.preventDefault(); runSearch(text); }}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          {parsing
            ? <Sparkles className="h-4 w-4 animate-pulse text-accent" strokeWidth={1.8} />
            : <Search className="h-4 w-4 text-muted-faint" strokeWidth={1.8} />}
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search, or ask e.g. 'phones under 30000'"
          value={text}
          disabled={parsing}
          onChange={(e) => {
            const val = e.target.value;
            setText(val);
            setOpen(true);
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => loadProducts(val), 250);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`block w-full rounded-full border pl-10 pr-10 text-sm font-medium text-ink placeholder:text-muted-faint focus:ring-0 transition-all disabled:opacity-60 ${desktop
            ? "border-black/[0.06] bg-[#f2eee6] py-2.5 focus:border-accent/40 focus:bg-white"
            : "border-black/10 bg-[#f1ede5] py-3 focus:border-accent/40 focus:bg-paper"}`}
        />
        {text && !parsing && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => { setText(""); setProducts([]); inputRef.current?.focus(); }}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-faint hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        )}
      </div>

      {showList && (
        // Phones show the list in the page flow: the expanding search bar clips anything positioned outside it
        <div className={`overflow-hidden rounded-2xl border border-line bg-paper ${desktop
          ? "absolute left-0 right-0 top-full z-50 mt-2 shadow-[0_24px_60px_-20px_rgba(29,28,25,0.35)]"
          : "mt-2 shadow-sm"}`}>
          <ul id={listId} role="listbox" aria-label="Search suggestions" className={`${desktop ? "max-h-[70vh]" : "max-h-[60vh]"} overflow-y-auto overscroll-contain py-2`}>
            {items.map((item, i) => {
              const prev = items[i - 1];
              const heading = sectionTitle(item, prev);
              return (
                <React.Fragment key={item.id}>
                  {heading && (
                    <li role="presentation" className="flex items-center justify-between px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-light">
                      {heading}
                      {item.type === "recent" && (
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setRecent(clearRecent())}
                          className="text-[11px] font-semibold normal-case tracking-normal text-accent hover:underline">
                          Clear
                        </button>
                      )}
                    </li>
                  )}
                  <Option
                    id={optionId(i)}
                    item={item}
                    active={i === active}
                    onHover={() => setActive(i)}
                    onPick={() => pick(item)}
                    onRemove={item.type === "recent" ? () => setRecent(removeRecent(item.text)) : undefined}
                  />
                </React.Fragment>
              );
            })}
          </ul>
          {!typed && (
            <p className="border-t border-line bg-sand px-4 py-2.5 text-xs text-muted">
              Tip: try plain language, like <span className="font-semibold text-ink-soft">"earbuds under 5000"</span>
            </p>
          )}
        </div>
      )}
    </form>
  );
}

const sectionTitle = (item, prev) => {
  if (prev && prev.type === item.type && Boolean(prev.popular) === Boolean(item.popular)) return null;
  if (item.type === "recent") return "Recent searches";
  if (item.type === "category") return item.popular ? "Popular categories" : "Categories";
  if (item.type === "product") return "Products";
  return null;
};

function Option({ id, item, active, onHover, onPick, onRemove }) {
  const base = `group flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors ${active ? "bg-tint shadow-[inset_3px_0_0_#a85d37]" : "hover:bg-sand"}`;
  const props = {
    id,
    role: "option",
    "aria-selected": active,
    onMouseEnter: onHover,
    // Keep focus in the input so the click lands before the outside-click handler closes the list
    onMouseDown: (e) => e.preventDefault(),
    onClick: onPick,
    className: base,
  };

  if (item.type === "recent") {
    return (
      <li {...props}>
        <Clock className="h-4 w-4 shrink-0 text-muted-faint" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{item.text}</span>
        <button type="button" tabIndex={-1} aria-label={`Remove "${item.text}" from recent searches`}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="grid h-6 w-6 place-items-center rounded-full text-muted-faint opacity-60 hover:bg-black/5 hover:text-ink group-hover:opacity-100">
          <X className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </li>
    );
  }

  if (item.type === "category") {
    const Icon = iconFor(item.key);
    return (
      <li {...props}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tint text-ink-soft"><Icon size={15} /></span>
        <span className="min-w-0 flex-1 truncate text-sm text-ink">
          {item.rest ? <><span className="font-semibold">{item.rest}</span> <span className="text-muted">in</span> </> : null}
          <span className={item.rest ? "font-semibold text-accent" : "font-semibold"}>{item.label}</span>
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-faint" strokeWidth={1.8} />
      </li>
    );
  }

  if (item.type === "product") {
    const p = item.product;
    return (
      <li {...props}>
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f6f3ed]">
          {p.image && <img src={p.image.thumb} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1 mix-blend-multiply" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{p.title}</span>
          <span className="block text-xs text-muted">{p.brand} · {formatPrice(p.priceRange?.min ?? p.price)}</span>
        </span>
      </li>
    );
  }

  return (
    <li {...props} className={`${base} mt-1 border-t border-line pt-2.5`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-white"><Sparkles className="h-4 w-4" strokeWidth={1.8} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink">Ask VKart about <span className="font-semibold">"{item.text}"</span></span>
        <span className="block text-xs text-muted">AI picks, comparisons and answers</span>
      </span>
    </li>
  );
}
