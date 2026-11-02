import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import BrandSelect from "../BrandSelect";
import { CATEGORIES } from "../catalogData";
import { Bone } from "../../ui/Skeleton";

export default function ListHeading({
  category,
  q,
  heading,
  loading,
  page,
  total,
  sort,
  setSort,
  sortOptions,
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 pb-4 pt-5">
      <div>
        <nav className="flex items-center gap-1 text-xs text-muted-light">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <FiChevronRight />
          {category && !q ? (
            <span className="text-ink">{CATEGORIES[category]}</span>
          ) : (
            <>
              <Link to="/products" className="hover:text-ink">
                Products
              </Link>
              {q && (
                <>
                  <FiChevronRight />
                  <span className="text-ink">Search</span>
                </>
              )}
            </>
          )}
        </nav>
        <h1 className="mt-1 break-words text-2xl font-bold text-ink sm:text-3xl">{heading}</h1>
        <div className="text-sm text-muted-light">
          {loading && page === 1 ? (
            <Bone className="inline-block h-4 w-24 align-middle" />
          ) : (
            `${total} products`
          )}
        </div>
      </div>
      <BrandSelect
        label="Sort by"
        prefix="Sort by:"
        value={sort}
        onChange={setSort}
        options={sortOptions}
        className="hidden w-64 lg:block"
      />
    </div>
  );
}
