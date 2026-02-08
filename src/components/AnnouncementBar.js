import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { XIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import axios from "./axiosInstance";

const FALLBACK = [
    { text: "Free Shipping over ₹499", link: "/products" },
];

const AnnouncementBar = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [announcements, setAnnouncements] = useState(FALLBACK);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const { data } = await axios.get("/api/admin/settings/announcements/public");
                if (data?.length) setAnnouncements(data);
            } catch { /* use fallback */ }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (!isVisible || announcements.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isVisible, announcements.length]);

    if (!isVisible || !announcements.length) return null;

    const current = announcements[currentIndex];
    const bgColor = current.bgColor || "#111827";
    const textColor = current.textColor || "#FFFFFF";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative z-[60] overflow-hidden"
                style={{ backgroundColor: bgColor, color: textColor }}
            >
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center sm:justify-between text-[10px] sm:text-xs font-bold tracking-wide uppercase">

                    <Link
                        to={current.link || "/products"}
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
                                <span>{current.text}</span>
                                <span className="hidden sm:inline"> — <span className="underline decoration-current/50 underline-offset-4 decoration-2 hover:decoration-current transition-all">Shop Now</span></span>
                            </motion.div>
                        </AnimatePresence>
                    </Link>

                    {/* Progress dots */}
                    {announcements.length > 1 && (
                        <div className="hidden md:flex items-center gap-1.5 mr-6">
                            {announcements.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex
                                        ? "bg-white/80 w-3"
                                        : "bg-white/30 hover:bg-white/50"
                                        }`}
                                    aria-label={`Go to announcement ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="hidden sm:flex items-center gap-6 whitespace-nowrap" style={{ color: `${textColor}99` }}>
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

