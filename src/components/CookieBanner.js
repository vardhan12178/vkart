import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCookieBite } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounting, setIsMounting] = useState(false);

  useEffect(() => {
    const hasConsentChoice = localStorage.getItem("cookieConsent");
    if (hasConsentChoice) return undefined;

    const timer = window.setTimeout(() => {
      setIsVisible(true);
      requestAnimationFrame(() => setIsMounting(true));
      document.body.classList.add("cookie-consent-open");
    }, 900);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("cookie-consent-open");
    };
  }, []);

  const saveChoice = (choice) => {
    setIsMounting(false);
    document.body.classList.remove("cookie-consent-open");
    window.setTimeout(() => {
      localStorage.setItem("cookieConsent", choice);
      setIsVisible(false);
    }, 220);
  };

  if (!isVisible) return null;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-copy"
      className={`cookie-consent fixed inset-x-3 bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-[110] transition duration-300 ease-out sm:left-5 sm:right-auto sm:w-[min(30rem,calc(100vw-2.5rem))] ${
        isMounting ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-[1.25rem] border border-black/[0.1] bg-[#fffdf8]/95 p-4 text-[#1d1c19] shadow-[0_24px_70px_rgba(29,28,25,.2)] backdrop-blur-xl sm:p-5">
        <button
          type="button"
          onClick={() => saveChoice("essential")}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#8a857b] transition-colors hover:bg-black/[0.05] hover:text-[#1d1c19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a85d37]/30"
          aria-label="Close cookie preferences and use essential cookies only"
        >
          <IoClose size={19} />
        </button>

        <div className="flex items-start gap-3.5 pr-8">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#a85d37]/10 text-[#a85d37]">
            <FaCookieBite size={17} />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#a85d37]">
              Your privacy
            </p>
            <h2 id="cookie-consent-title" className="cookie-consent-title text-base font-bold tracking-[-0.015em]">
              A more considered experience.
            </h2>
            <p id="cookie-consent-copy" className="mt-1.5 text-xs leading-5 text-[#6f6b62] sm:text-[13px]">
              We use optional cookies to improve VKart. Essential cookies keep the store working.{" "}
              <Link to="/privacy" className="font-bold text-[#75472f] underline decoration-[#75472f]/30 underline-offset-3 hover:decoration-[#75472f]">
                Privacy details
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="min-h-11 rounded-full bg-[#1d1c19] px-4 text-xs font-bold text-white transition-colors hover:bg-[#34312c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1c19]/30 focus-visible:ring-offset-2"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => saveChoice("essential")}
            className="min-h-11 rounded-full border border-black/[0.11] bg-transparent px-4 text-xs font-bold text-[#514d45] transition-colors hover:border-[#a85d37]/25 hover:bg-[#a85d37]/[0.07] hover:text-[#75472f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a85d37]/30 focus-visible:ring-offset-2"
          >
            Essential only
          </button>
        </div>
      </div>
    </section>
  );
}
