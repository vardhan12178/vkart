// CookieBanner.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "vkart-cookie-consent-v1";

const defaultPrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      mode: parsed.mode || "custom",
    };
  } catch {
    return null;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: !!prefs.analytics,
        marketing: !!prefs.marketing,
        mode: prefs.mode || "custom",
      })
    );
  } catch {
    // ignore
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [prefs, setPrefs] = useState({
    ...defaultPrefs,
    mode: "custom",
  });
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    const stored = loadPrefs();
    if (!stored) {
      // No consent yet -> show banner
      setVisible(true);
      return;
    }
    setPrefs(stored);
    setVisible(false);
  }, []);

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true, mode: "all" };
    setPrefs(next);
    savePrefs(next);
    setVisible(false);
    setShowPrefs(false);
  };

  const onlyEssential = () => {
    const next = { necessary: true, analytics: false, marketing: false, mode: "essential" };
    setPrefs(next);
    savePrefs(next);
    setVisible(false);
    setShowPrefs(false);
  };

  const saveCustom = () => {
    const next = { ...prefs, necessary: true, mode: "custom" };
    setPrefs(next);
    savePrefs(next);
    setVisible(false);
    setShowPrefs(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Bottom floating banner */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none">
        <div className="mx-auto max-w-5xl pointer-events-auto rounded-2xl bg-white shadow-2xl ring-1 ring-orange-100">
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow">
                <span className="text-lg font-semibold">i</span>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cookies on VKart</p>
                <p className="mt-1">
                  We use essential cookies to keep this demo running and remember your preferences.
                  Analytics and marketing cookies are <span className="font-semibold">off</span> by
                  default in this portfolio project.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  You can change your choice anytime from the cookie settings.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setShowPrefs(true)}
                className="inline-flex items-center justify-center rounded-xl border border-orange-200 px-3.5 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50"
              >
                Manage preferences
              </button>

              <button
                type="button"
                onClick={onlyEssential}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
              >
                Only essential
              </button>

              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110"
              >
                Accept all
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-[11px] text-gray-500 sm:px-6">
            <span>
              View how we handle data in our{" "}
              <Link to="/privacy" className="font-medium text-orange-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
            <button
              type="button"
              onClick={onlyEssential}
              className="hidden text-xs font-medium text-gray-400 hover:text-gray-600 sm:inline"
              aria-label="Dismiss cookie message"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Preferences modal */}
      {showPrefs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Cookie preferences
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Choose which cookies you want to allow on VKart. You can change this anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrefs(false)}
                className="ml-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close preferences"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
              {/* Necessary */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Necessary</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Required for basic site functionality like keeping you signed in and storing your consent.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Always active
                  </span>
                </div>
              </div>

              {/* Analytics */}
              <PreferenceRow
                title="Analytics"
                description="Helps us understand which pages are visited in this demo. No personal data or tracking is sent in this portfolio setup."
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />

              {/* Marketing */}
              <PreferenceRow
                title="Marketing"
                description="Would normally be used for personalised offers. Not used in this VKart demo, but included to show a realistic flow."
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onlyEssential}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Only essential
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                Save my preferences
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PreferenceRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 rounded-full transition ${
          checked ? "bg-orange-500" : "bg-gray-200"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
