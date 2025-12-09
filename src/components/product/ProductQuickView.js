import React, { useState, useEffect } from "react";
import { FaTimes, FaLayerGroup, FaCartPlus } from "react-icons/fa";
import Stars from "../Stars";

const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const ProductQuickView = ({ product, onClose, onAdd }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const images = product?.images?.length ? product.images : [product?.thumbnail].filter(Boolean);

    useEffect(() => {
        if (!product) return;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, [product]);

    if (!product) return null;

    const price = product.price;
    const mrp = product.discountPercentage
        ? price / (1 - product.discountPercentage / 100)
        : price * 1.2;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in flex flex-col md:flex-row max-h-[90vh]">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 transition-colors"
                >
                    <FaTimes size={18} className="text-gray-500" />
                </button>

                <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col justify-between relative">
                    <div className="flex-1 flex items-center justify-center relative">
                        <img
                            src={images[activeIdx]}
                            alt={product.title}
                            className="max-h-[350px] w-full object-contain mix-blend-multiply"
                        />
                        {product.discountPercentage && (
                            <span className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                                -{Math.round(product.discountPercentage)}%
                            </span>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto py-4 px-2 justify-center scrollbar-hide">
                            {images.map((src, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIdx(idx)}
                                    className={`h-14 w-14 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all ${idx === activeIdx ? "border-gray-900" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <img src={src} alt="" className="h-full w-full object-cover bg-white" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
                    <div className="mb-2 text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <FaLayerGroup /> {product.category}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h2>

                    <div className="flex items-center gap-3 mb-6">
                        <Stars value={product.rating} />
                        <span className="text-xs text-gray-300">|</span>
                        <span className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                        <span className="text-lg text-gray-300 line-through">{formatPrice(mrp)}</span>
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed mb-8 line-clamp-4">{product.description}</p>

                    <div className="mt-auto">
                        <button
                            onClick={() => onAdd(product)}
                            className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <FaCartPlus /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductQuickView;
