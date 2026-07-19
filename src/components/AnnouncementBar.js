import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { XIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import axios from "./axiosInstance";

const FALLBACK = [
    { text: "Complimentary delivery on orders over ₹499", link: "/products" },
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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="announcement-bar relative z-[60] overflow-hidden"
            >
                <div className="relative mx-auto flex min-h-8 max-w-[1500px] items-center justify-center px-10 py-2 text-[10px] font-bold uppercase tracking-[0.12em] sm:justify-between sm:px-6 lg:px-8">

                    <Link
                        to={current.link || "/products"}
                        className="min-w-0 truncate text-center transition-opacity hover:opacity-70 sm:flex-1 sm:pr-5 sm:text-left sm:whitespace-normal"
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
                                <span className="hidden sm:inline"> <span aria-hidden="true">·</span> <span className="underline decoration-current/30 underline-offset-4 transition-all hover:decoration-current">Shop the collection</span></span>
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
                                        ? "bg-[#7e6656] w-3"
                                        : "bg-[#7e6656]/25 hover:bg-[#7e6656]/45"
                                        }`}
                                    aria-label={`Go to announcement ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="hidden items-center gap-4 whitespace-nowrap text-[#7c756b] sm:flex">
                        <span>Secure checkout</span>
                        <span className="h-3 w-px bg-black/10" aria-hidden="true" />
                        <span>Easy 7-day returns</span>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#776f64] transition-colors hover:bg-black/[0.06] hover:text-[#1d1c19]"
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

