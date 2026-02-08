import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaArrowRight, FaBox } from "react-icons/fa";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import axios from "./axiosInstance";
import OrderStages from "./OrderStages";

const OrderSuccess = () => {
    const { orderId } = useParams();
    const { width, height } = useWindowSize();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Confetti effect timer
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Try fetching by order ID (works for both _id and custom orderId strings if API supports it)
                // Assuming existing API endpoint supports getting order by ID. 
                // Using admin endpoint logic generally, but user should verify their own order.
                // If specific endpoint '/api/orders/:id' exists for user, use that.
                // Based on previous context, we might need a user-specific get order endpoint 
                // or use the list and find (less efficient). 
                // Let's assume GET /api/orders/:id or similar exists or we fallback to Profile orders.

                // Better approach: Use the profile orders endpoint and find the specific one 
                // to ensure security (user can only see own orders) if no direct single-order endpoint.
                const response = await axios.get("/api/profile/orders");
                const foundOrder = response.data.find(o =>
                    o._id === orderId || o.orderId === orderId || o.razorpayOrderId === orderId
                );

                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        } else {
            setLoading(false);
            setError(true);
        }

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <FaBox size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't find the details for this order.</p>
                <Link to="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 relative overflow-hidden">
            {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                {/* Status Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-500/5 text-center border border-orange-100 relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600" />

                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce-slow">
                        <FaCheckCircle size={48} />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        Order Placed!
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">
                        Thank you for your purchase. We've received your order and are getting it ready.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                        <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-600 border border-gray-200">
                            Order #{order.orderId || order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="px-4 py-2 bg-orange-50 rounded-full text-sm font-bold text-orange-600 border border-orange-100 animate-pulse">
                            Processing
                        </span>
                    </div>
                </div>

                {/* Timeline Section */}
                <div>
                    <OrderStages
                        currentStage={order.stage}
                        statusHistory={order.statusHistory}
                        createdAt={order.createdAt}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to={`/orders/${order._id}`}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                    >
                        <FaBox className="text-gray-400 group-hover:text-orange-500 transition-colors" /> View Order Details
                    </Link>

                    <Link
                        to="/products"
                        className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg shadow-gray-900/20 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        Continue Shopping <FaArrowRight />
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess; 