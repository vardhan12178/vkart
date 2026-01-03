import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { XIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";

// Dynamic announcements - easily add/remove messages here
const ANNOUNCEMENTS = [
    {
        badge: "New Arrival",
        text: "Premium Wireless Headphones",
        link: "/products?category=headphones",
    },
    {
        badge: "Hot Deal",
        text: "Up to 40% Off on Electronics",
        link: "/products?category=electronics",
    },
    {
        badge: "Trending",
        text: "Latest Smartphones Collection",
        link: "/products?category=smartphones",
    },
    {
        badge: "Best Seller",
        text: "Top-Rated Beauty Products",
        link: "/products?category=beauty",
    },
];

const AnnouncementBar = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Rotate announcements every 5 seconds
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    const currentAnnouncement = ANNOUNCEMENTS[currentIndex];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-900 text-white relative z-[60] overflow-hidden"
            >
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center sm:justify-between text-[10px] sm:text-xs font-bold tracking-wide uppercase">

                    <Link
                        to={currentAnnouncement.link}
                        className="flex-1 min-w-0 text-center sm:text-left truncate sm:whitespace-normal pr-8 sm:pr-0 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="inline"
                            >
                                <span className="text-amber-400 mr-2 bg-gray-800/50 px-1.5 py-0.5 rounded hidden sm:inline-block">
                                    {currentAnnouncement.badge}
                                </span>
                                <span className="text-amber-400 mr-2 sm:hidden">
                                    {currentAnnouncement.badge.split(' ')[0]}
                                </span>
                                <span>{currentAnnouncement.text}</span>
                                <span className="hidden sm:inline"> — <span className="underline decoration-amber-400/50 underline-offset-4 decoration-2 hover:decoration-amber-400 transition-all">Shop Now</span></span>
                            </motion.div>
                        </AnimatePresence>
                    </Link>

                    {/* Progress dots */}
                    <div className="hidden md:flex items-center gap-1.5 mr-6">
                        {ANNOUNCEMENTS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex
                                        ? "bg-amber-400 w-3"
                                        : "bg-gray-600 hover:bg-gray-500"
                                    }`}
                                aria-label={`Go to announcement ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <div className="hidden sm:flex items-center gap-6 text-gray-400 whitespace-nowrap">
                        <span>Free Shipping over ₹499</span>
                        <span>Easy 7-Day Returns</span>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close announcement"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnnouncementBar;

