import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Stars from "../Stars";
import {
  ArrowRight,
  ShoppingCart,
  X,
} from "lucide-react";

const formatPrice = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
}).format(amount);

const ProductQuickView = ({ product, onClose, onAdd }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const images = product?.images?.length
        ? product.images
        : [product?.thumbnail].filter(Boolean);

    useEffect(() => {
        if (!product) return undefined;
        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [product, onClose]);

    useEffect(() => setActiveIdx(0), [product?._id]);

    if (!product) return null;

    const price = product.price;
    const mrp = product.discountPercentage
        ? price / (1 - product.discountPercentage / 100)
        : price * 1.2;
    const saving = product.discountPercentage
        ? Math.round(product.discountPercentage)
        : 0;
    const isAvailable = product.stock > 0;

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 sm:p-5">
            <button
                type="button"
                className="absolute inset-0 cursor-default bg-[#1d1c19]/48 backdrop-blur-[2px]"
                onClick={onClose}
                aria-label="Close product preview"
                tabIndex={-1}
            />

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="quick-view-title"
                className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-3xl border border-black/8 bg-[#fffdf8] shadow-[0_34px_100px_rgba(29,28,25,.28)] sm:max-h-[min(46rem,calc(100dvh-2.5rem))] md:grid md:grid-cols-[1.08fr_.92fr] md:overflow-hidden"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/8 bg-[#fffdf8]/90 text-[#6f6b62] backdrop-blur-sm transition-colors hover:bg-[#eee8df] hover:text-[#1d1c19]"
                    aria-label="Close product preview"
                >
                    <X size={15} />
                </button>

                <div className="flex min-h-80 shrink-0 flex-col bg-[#ece8df] p-5 sm:p-7 md:min-h-152">
                    <div className="flex items-center justify-between pr-12">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6f6b62]">
                            A closer look
                        </span>
                        {saving > 0 && (
                            <span className="rounded-full border border-[#a85d37]/18 bg-[#f3e9df] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#874f33]">
                                Save {saving}%
                            </span>
                        )}
                    </div>

                    <div className="flex min-h-40 sm:min-h-60 flex-1 items-center justify-center py-5">
                        <img
                            src={images[activeIdx]}
                            alt={product.title}
                            className="max-h-48 sm:max-h-76 w-full object-contain mix-blend-multiply md:max-h-112"
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((src, idx) => (
                                <button
                                    type="button"
                                    key={`${src}-${idx}`}
                                    onClick={() => setActiveIdx(idx)}
                                    className={`h-12 sm:h-14 w-12 sm:w-14 shrink-0 overflow-hidden rounded-[0.8rem] border bg-[#fffdf8] p-1 transition-opacity ${idx === activeIdx
                                        ? "border-[#1d1c19] opacity-100"
                                        : "border-black/8 opacity-55 hover:opacity-100"
                                    }`}
                                    aria-label={`View image ${idx + 1} of ${images.length}`}
                                    aria-pressed={idx === activeIdx}
                                >
                                    <img loading="lazy" decoding="async" src={src} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col justify-center p-6 sm:p-9 md:overflow-y-auto md:p-10">
                    <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a85d37]">
                        {product.category || "The collection"}
                    </p>
                    <h2 id="quick-view-title" className="font-editorial text-[2rem] font-normal leading-[1.02] tracking-[-0.035em] text-[#1d1c19] sm:text-[2.55rem]">
                        {product.title}
                    </h2>

                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-black/8 pb-5">
                        <Stars value={product.rating} />
                        <span className="h-3 w-px bg-black/10" aria-hidden="true" />
                        <span className={`text-xs font-bold ${isAvailable ? "text-[#59634f]" : "text-[#75483b]"}`}>
                            {isAvailable ? "Ready to ship" : "Currently unavailable"}
                        </span>
                    </div>

                    <div className="mt-6 flex items-baseline gap-3">
                        <span className="text-3xl font-extrabold tracking-[-0.04em] text-[#1d1c19]">{formatPrice(price)}</span>
                        <span className="text-sm text-[#9b958b] line-through">{formatPrice(mrp)}</span>
                    </div>

                    <p className="mt-5 line-clamp-4 text-sm leading-6 text-[#6f6b62]">
                        {product.description}
                    </p>

                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            onClick={() => onAdd(product)}
                            disabled={!isAvailable}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1c19] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#a8a299]"
                        >
                            <ShoppingCart size="1em" aria-hidden="true" /> {isAvailable ? "Add to bag" : "Unavailable"}
                        </button>
                        <Link
                            to={`/product/${product._id}`}
                            onClick={onClose}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3.5 text-sm font-bold text-[#4f4b44] transition-colors hover:bg-black/4 hover:text-[#1d1c19]"
                        >
                            View full details <ArrowRight size={12} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductQuickView;
