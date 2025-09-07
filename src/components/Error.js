import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineExclamationCircle,
  HiOutlineHome,
  HiOutlineArrowLeft,
  HiOutlineSearch,
  HiOutlineMail,
} from "react-icons/hi";

export default function Error() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-40 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center sm:py-24">
        <div className="mb-8 inline-flex items-center justify-center rounded-3xl bg-white/70 p-3 ring-1 ring-gray-200 shadow-xl backdrop-blur">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <HiOutlineExclamationCircle className="size-8" />
          </div>
        </div>

        <p className="text-sm font-semibold tracking-widest text-orange-600">ERROR 404</p>
        <h1 className="mt-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
          We couldn’t find that page
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
          The link may be broken, or the page might have been moved. Try searching, go back home, or let us know.
        </p>

        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white font-semibold shadow-lg transition hover:opacity-95 active:scale-[0.98]"
          >
            <HiOutlineHome className="size-5" />
            Go to Homepage
          </Link>
          <button
            type="button"
            onClick={() =>
              window.history.length > 1 ? window.history.back() : (window.location.href = "/")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-800 ring-1 ring-gray-200 shadow-lg transition hover:bg-gray-50 active:scale-[0.98]"
          >
            <HiOutlineArrowLeft className="size-5" />
            Go Back
          </button>
        </div>

        <div className="mt-6 w-full rounded-2xl bg-white/70 p-2 ring-1 ring-gray-200 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-gray-200">
            <HiOutlineSearch className="size-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search VKart"
              className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/products?search=${encodeURIComponent(e.currentTarget.value)}`;
                }
              }}
            />
            <button
              onClick={(e) => {
                const v = e.currentTarget.parentElement?.querySelector("input")?.value || "";
                window.location.href = `/products?search=${encodeURIComponent(v)}`;
              }}
              className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:opacity-95"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Need help?{" "}
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-800"
          >
            <HiOutlineMail className="size-4" />
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}
