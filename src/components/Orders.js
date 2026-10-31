import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "./axiosInstance";
import OrderCard from "./OrderCard";
import { qk } from "../query/queryKeys";
import { ArrowLeftIcon, PackageOpenIcon, ShoppingBagIcon } from "./ui/icons";

// Skeleton loader for orders
const OrdersSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="h-28 bg-white rounded-2xl border border-line animate-pulse"
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
        <div className="premium-page premium-orders min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] pb-16">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tint via-sand to-white opacity-70" />

            <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-10">
                {/* Modern Proportional Header */}
                <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="h-9 w-9 rounded-xl bg-white border border-line-strong/80 text-muted hover:text-ink hover:bg-sand flex items-center justify-center transition shadow-2xs shrink-0"
                            title="Go back"
                        >
                            <ArrowLeftIcon size={13} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-ink tracking-tight leading-tight truncate">
                                Your Orders
                            </h1>
                            <p className="text-xs sm:text-sm text-muted mt-0.5 font-medium truncate">
                                Purchases, deliveries, and active shipments.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1.5 bg-ink text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                            <ShoppingBagIcon size={11} className="text-accent" />
                            <span>{orders.length} {orders.length === 1 ? "Order" : "Orders"}</span>
                        </span>
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xs border border-line-strong/70 min-h-[360px] p-3.5 sm:p-7">
                    {loading ? (
                        <OrdersSkeleton />
                    ) : isError ? (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-alert/10 rounded-2xl flex items-center justify-center text-alert mx-auto mb-3">
                                <PackageOpenIcon size={22} />
                            </div>
                            <h3 className="text-base font-bold text-ink mb-1">
                                Unable to load orders
                            </h3>
                            <p className="text-muted text-xs sm:text-sm mb-5">Something went wrong while fetching your orders.</p>
                            <button
                                onClick={() => refetch()}
                                className="px-5 py-2.5 rounded-xl bg-ink text-white font-bold text-xs sm:text-sm shadow-xs hover:bg-black transition"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-muted-faint mx-auto mb-3 text-2xl">
                                <PackageOpenIcon />
                            </div>
                            <h3 className="text-base font-bold text-ink">No orders yet</h3>
                            <p className="text-muted text-xs sm:text-sm mt-0.5 mb-5">
                                Start shopping to fill this page with your purchases.
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-black transition"
                            >
                                <ShoppingBagIcon size={12} />
                                <span>Browse Products</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {orders.map((order) => {
                                const isHighlighted =
                                    order._id === highlightOrderId ||
                                    order.orderId === highlightOrderId ||
                                    order.orderNumber === highlightOrderId ||
                                    (highlightOrderId && String(order._id).includes(highlightOrderId));
                                return (
                                    <div
                                        key={order._id}
                                        ref={isHighlighted ? highlightRef : null}
                                        className={`transition-all duration-300 rounded-2xl sm:rounded-3xl ${
                                            isHighlighted
                                                ? "shadow-md ring-1 ring-ink/10"
                                                : ""
                                        }`}
                                    >
                                        <OrderCard order={order} defaultOpen={Boolean(isHighlighted || orders.length === 1)} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Footer Link */}
                {orders.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <Link
                            to="/products"
                            className="text-xs sm:text-sm font-bold text-muted hover:text-ink transition-colors inline-flex items-center gap-1.5"
                        >
                            <ShoppingBagIcon size={12} />
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
