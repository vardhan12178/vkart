// src/pages/Compare.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { FaTimes, FaCartPlus } from "react-icons/fa";

/* Helpers */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const normalizeIds = (idsStr) =>
  Array.from(
    new Set(
      (idsStr || "")
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n))
    )
  ).slice(0, 4);

/* Skeleton card for loading */
const Skeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
    <div className="h-40 w-full animate-pulse rounded-xl bg-gray-100" />
    <div className="mt-3 space-y-3">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="h-6 w-full animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [ids, setIds] = useState(() => normalizeIds(searchParams.get("ids")));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // keep URL in sync
  useEffect(() => {
    const next = new URLSearchParams();
    if (ids.length) next.set("ids", ids.join(","));
    setSearchParams(next, { replace: true });
  }, [ids, setSearchParams]);

  // fetch products by ids
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const proms = ids.map((id) =>
          fetch(`https://dummyjson.com/products/${id}`).then((r) => r.json())
        );
        const res = await Promise.all(proms);
        if (!cancelled) {
          // filter out any API errors that come back as objects without id
          setItems(res.filter((p) => p && p.id));
        }
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ids]);

  const removeId = useCallback(
    (id) => setIds((prev) => prev.filter((x) => x !== id)),
    []
  );
  const clearAll = useCallback(() => setIds([]), []);
  const add = useCallback(
    (p) => dispatch(addToCart({ ...p, quantity: 1 })),
    [dispatch]
  );

  // derived
  const hasItems = items.length > 0;

  const specRows = useMemo(
    () => [
      {
        label: "Brand",
        get: (p) => p.brand || "—",
      },
      {
        label: "Category",
        get: (p) => p.category || "—",
      },
      {
        label: "Price",
        get: (p) => {
          const price = p.price * 83;
          const mrp = p.discountPercentage
            ? price / (1 - p.discountPercentage / 100)
            : price * 1.2;
          return (
            <>
              <span className="font-semibold text-gray-900">{INR(price)}</span>{" "}
              <span className="text-xs text-gray-400 line-through">
                {INR(mrp)}
              </span>
              {p.discountPercentage ? (
                <span className="ml-2 rounded-full bg-green-50 px-2 py-[2px] text-[10px] font-semibold text-green-700">
                  {Math.round(p.discountPercentage)}% OFF
                </span>
              ) : null}
            </>
          );
        },
      },
      {
        label: "Rating",
        get: (p) => `${p.rating ?? "—"} / 5`,
      },
      {
        label: "In stock",
        get: (p) => (p.stock ? `${p.stock}` : "—"),
      },
      {
        label: "Description",
        get: (p) => (
          <span className="block text-sm leading-snug text-gray-600">
            {p.description || "—"}
          </span>
        ),
      },
    ],
    []
  );

  // Empty / invalid state
  if (!ids.length) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
          <p className="mt-2 text-gray-600">
            You haven’t selected any products for comparison yet.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Compare
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/products")}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            + Add more
          </button>
          <button
            onClick={clearAll}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Grid on mobile (cards), Table on md+ */}
      <div className="md:hidden space-y-4">
        {loading
          ? Array.from({ length: ids.length }).map((_, i) => <Skeleton key={i} />)
          : items.map((p) => {
              const price = p.price * 83;
              return (
                <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="max-w-[70%] text-lg font-semibold text-gray-900">
                      {p.title}
                    </h2>
                    <button
                      onClick={() => removeId(p.id)}
                      className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                      aria-label="Remove"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl bg-gray-50">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="h-40 w-full object-contain"
                    />
                  </div>
                  <div className="mt-3 text-orange-600 font-extrabold">
                    {INR(price)}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{p.brand} • {p.category}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">{p.description}</p>
                  <div className="mt-3">
                    <button
                      onClick={() => dispatch(addToCart({ ...p, quantity: 1 }))}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
                    >
                      <FaCartPlus /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 w-40 border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-600 bg-gray-50">
                  Product
                </th>
                {ids.map((id, idx) => (
                  <th key={id} className="w-[22%] border-b border-gray-200 p-4 text-left">
                    {loading ? (
                      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-100" />
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="line-clamp-2 text-base font-semibold text-gray-900">
                          {items[idx]?.title || "—"}
                        </span>
                        <button
                          onClick={() => removeId(id)}
                          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                          aria-label={`Remove ${items[idx]?.title || "product"}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Image row */}
              <tr className="align-top">
                <td className="sticky left-0 z-10 border-b border-gray-100 bg-white p-4 text-sm text-gray-600">
                  Image
                </td>
                {ids.map((id, idx) => (
                  <td key={id} className="border-b border-gray-100 p-4">
                    {loading ? (
                      <div className="h-40 w-full animate-pulse rounded-xl bg-gray-100" />
                    ) : items[idx] ? (
                      <div className="overflow-hidden rounded-xl bg-gray-50">
                        <img
                          src={items[idx].thumbnail}
                          alt={items[idx].title}
                          className="mx-auto h-40 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Not found</div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Price row */}
              <tr className="align-top">
                <td className="sticky left-0 z-10 border-b border-gray-100 bg-white p-4 text-sm text-gray-600">
                  Price
                </td>
                {ids.map((id, idx) => (
                  <td key={id} className="border-b border-gray-100 p-4">
                    {loading || !items[idx] ? (
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
                    ) : (
                      (() => {
                        const p = items[idx];
                        const price = p.price * 83;
                        const mrp = p.discountPercentage
                          ? price / (1 - p.discountPercentage / 100)
                          : price * 1.2;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-orange-600">
                              {INR(price)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {INR(mrp)}
                            </span>
                            {p.discountPercentage ? (
                              <span className="rounded-full bg-green-50 px-2 py-[2px] text-[10px] font-semibold text-green-700">
                                {Math.round(p.discountPercentage)}% OFF
                              </span>
                            ) : null}
                          </div>
                        );
                      })()
                    )}
                  </td>
                ))}
              </tr>

              {/* Generic spec rows */}
              {["brand", "category", "rating", "stock"].map((key, rIdx) => (
                <tr key={key} className="align-top">
                  <td className="sticky left-0 z-10 border-b border-gray-100 bg-white p-4 text-sm capitalize text-gray-600">
                    {key}
                  </td>
                  {ids.map((id, idx) => (
                    <td key={id} className="border-b border-gray-100 p-4">
                      {loading || !items[idx] ? (
                        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                      ) : (
                        <span className="text-sm text-gray-800">
                          {String(items[idx][key] ?? "—")}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Description */}
              <tr className="align-top">
                <td className="sticky left-0 z-10 border-b border-gray-100 bg-white p-4 text-sm text-gray-600">
                  Description
                </td>
                {ids.map((id, idx) => (
                  <td key={id} className="border-b border-gray-100 p-4">
                    {loading || !items[idx] ? (
                      <div className="h-12 w-full animate-pulse rounded bg-gray-100" />
                    ) : (
                      <p className="line-clamp-5 text-sm text-gray-700">
                        {items[idx].description || "—"}
                      </p>
                    )}
                  </td>
                ))}
              </tr>

              {/* CTA row */}
              <tr>
                <td className="sticky left-0 z-10 bg-white p-4" />
                {ids.map((id, idx) => (
                  <td key={id} className="p-4">
                    {items[idx] && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatch(addToCart({ ...items[idx], quantity: 1 }))}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
                        >
                          <FaCartPlus /> Add to Cart
                        </button>
                        <button
                          onClick={() => removeId(id)}
                          className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compare;
