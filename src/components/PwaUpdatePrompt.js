import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

const HOURLY = 60 * 60 * 1000;

/**
 * Registers the Workbox service worker and, when a new deploy is available,
 * offers a one-tap refresh instead of swapping assets under an open page.
 */
export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Long-lived tabs: look for a new deploy hourly.
      if (registration) setInterval(() => registration.update().catch(() => {}), HOURLY);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-full border border-black/10 bg-[#1d1c19] py-2 pl-4 pr-2 text-xs font-semibold text-white shadow-[0_18px_50px_rgba(29,28,25,.25)]"
    >
      <span>A new version of VKart is available.</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#a85d37] px-3 py-1.5 font-bold transition-colors hover:bg-[#874526]"
      >
        <RefreshCw size={12} /> Refresh
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss"
        className="rounded-full p-1.5 text-white/60 transition-colors hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}
