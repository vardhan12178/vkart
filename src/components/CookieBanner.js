import React, { useState, useEffect } from "react";
import { FaCookieBite } from "react-icons/fa"; // Swapped for a sharper icon
import { IoClose } from "react-icons/io5"; // Modern close icon

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounting, setIsMounting] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("cookieConsent");
    if (!hasAccepted) {
      // Slight delay for smooth entrance
      setTimeout(() => {
        setIsMounting(true);
        setIsVisible(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    setIsMounting(false);
    setTimeout(() => {
      localStorage.setItem("cookieConsent", "true");
      setIsVisible(false);
    }, 300); // Wait for exit animation
  };

  const handleDecline = () => {
    setIsMounting(false);
    setTimeout(() => {
      localStorage.setItem("cookieConsent", "false");
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 md:left-auto md:max-w-[400px] z-50 transition-all duration-500 ease-in-out transform ${
        isMounting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Glassmorphism Container */}
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl p-6 overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start gap-4 relative z-10">
          {/* Icon Container */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl flex-shrink-0 text-orange-500">
            <FaCookieBite size={20} />
          </div>

          {/* Close Button (Mobile/Desktop) */}
          <button
            onClick={handleDecline}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 transition-colors"
          >
            <IoClose size={20} />
          </button>

          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Cookie Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug mb-4">
              We use cookies to ensure you get the best experience on our website.{" "}
              <a
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Read Policy
              </a>
            </p>

            {/* Modern Button Layout */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-transform active:scale-95 shadow-sm"
              >
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}