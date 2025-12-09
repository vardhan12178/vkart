import React, { useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";

const AnnouncementBar = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-900 text-white relative z-[60] overflow-hidden"
            >
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center sm:justify-between text-[10px] sm:text-xs font-bold tracking-wide uppercase">

                    <div className="flex-1 min-w-0 text-center sm:text-left truncate sm:whitespace-normal pr-8 sm:pr-0">
                        <span className="text-amber-400 mr-2 bg-gray-800/50 px-1.5 py-0.5 rounded hidden sm:inline-block">New Arrival</span>
                        <span className="text-amber-400 mr-2 sm:hidden">New</span>
                        <span>Premium Wireless Headphones</span>
                        <span className="hidden sm:inline"> — <span className="underline decoration-amber-400/50 underline-offset-4 decoration-2">Shop Now</span></span>
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
