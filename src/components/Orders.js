import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "./axiosInstance";
import OrderCard from "./OrderCard";
import { qk } from "../query/queryKeys";
import {
    FaBoxOpen,
    FaShoppingBag,
    FaArrowLeft,
} from "react-icons/fa";

// Skeleton loader for orders
const OrdersSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
        ))}
    </div>
);

export default function Orders() {
    const navigate = useNavigate();
    const { orderId: routeOrderId } = useParams(); // From /orders/:orderId
    const [searchParams] = useSearchParams();
    const highlightOrderId = routeOrderId || searchParams.get("order"); // Support both

    const { isAuthenticated } = useSelector((state) => state.auth);

    const highlightRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const {
        data: orders = [],
        isLoading: loading,
        isError,
        refetch,
    } = useQuery({
        queryKey: qk.profile.orders,
        enabled: isAuthenticated,
        retry: false,
        queryFn: async () => {
            try {
                const response = await axios.get("/api/profile/orders");
                return (response.data || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
            } catch (err) {
                if (err?.response?.status === 401) {
                    navigate("/login", { replace: true });
                    return [];
                }
                throw err;
            }
        },
    });

    // Scroll to highlighted order
    useEffect(() => {
        if (!loading && highlightOrderId && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 300);
        }
    }, [loading, highlightOrderId]);

    if (!isAuthenticated) return null;

    return (
    <div className="premium-page premium-orders min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] pb-20">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-gray-50 to-white opacity-70" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-all shadow-sm"
                        >
                            <FaArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="font-editorial text-4xl sm:text-6xl font-normal text-[#1d1c19] tracking-[-0.04em]">
                                Your orders.
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Everything purchased, delivered, and in progress.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500">
                            <FaShoppingBag size={18} />
                        </div>
                        <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 min-h-[400px] p-6 sm:p-8">
                    {loading ? (
                        <OrdersSkeleton />
                    ) : isError ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400 mx-auto mb-4">
                                <FaBoxOpen size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">Failed to load orders. Please try again.</p>
                            <button
                                onClick={() => refetch()}
                                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 text-3xl">
                                <FaBoxOpen />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Start shopping to fill this page with your purchases.
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-black transition-all"
                            >
                                <FaShoppingBag size={14} />
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const isHighlighted = order._id === highlightOrderId;
                                return (
                                    <div
                                        key={order._id}
                                        ref={isHighlighted ? highlightRef : null}
                                        className={`transition-all duration-500 rounded-2xl ${isHighlighted
                                            ? "ring-2 ring-orange-500 ring-offset-2 bg-orange-50/30"
                                            : ""
                                            }`}
                                    >
                                        <OrderCard order={order} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                {orders.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <Link
                            to="/products"
                            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
                        >
                            <FaShoppingBag size={12} />
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
