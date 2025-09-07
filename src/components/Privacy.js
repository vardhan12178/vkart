import React, { useState } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineEyeOff,
  HiOutlineCake,
  HiOutlineInformationCircle,
  HiOutlineAdjustments,
} from "react-icons/hi";

const IconBadge = ({ children }) => (
  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
    {children}
  </span>
);

const Row = ({ title, icon, children }) => (
  <section className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200/60 via-amber-200/60 to-white shadow">
    <div className="rounded-3xl bg-white/90 ring-1 ring-gray-200 p-6">
      <div className="mb-3 flex items-center gap-3">
        <IconBadge>{icon}</IconBadge>
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-gray-700">{children}</div>
    </div>
  </section>
);

const Switch = ({ checked, disabled, onChange, label, hint }) => (
  <label className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${disabled ? "opacity-90" : ""} bg-white/80 border-gray-200`}>
    <div className="min-w-0">
      <div className="font-semibold text-gray-900">{label}</div>
      {hint ? <div className="text-sm text-gray-600">{hint}</div> : null}
    </div>
    <button
      type="button"
      onClick={!disabled ? onChange : undefined}
      aria-pressed={checked}
      aria-disabled={disabled}
      className={`relative h-7 w-12 rounded-full transition outline-none ring-1 ${
        checked ? "bg-orange-600 ring-orange-500" : "bg-gray-200 ring-gray-300"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  </label>
);

export default function Privacy() {
  const [prefs, setPrefs] = useState({ essential: true, analytics: false, marketing: false });
  const [toast, setToast] = useState("");

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const clearDemoData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setToast("Local demo data cleared");
      setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("Could not clear storage");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        {/* LIGHT hero card (replaces dark block) */}
        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Transparency first
          </div>

          <div className="mt-3 rounded-3xl bg-white/80 ring-1 ring-gray-200 p-6 md:p-8 backdrop-blur">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Privacy Policy</h1>
            <p className="mt-3 text-lg text-gray-700">
              This portfolio doesn’t collect real personal data. Any info you enter is used only to demonstrate app flows.
            </p>
          </div>
        </header>

        {toast ? (
          <div
            role="status"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"
          >
            {toast}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Row title="What We Actually Collect" icon={<HiOutlineShieldCheck className="h-5 w-5" />}>
            <p>
              <strong>Nothing sensitive.</strong> There’s no real sign-up, payment, or analytics running here. If you see a
              profile, order, or address — it’s <em>mock data</em> for demo purposes.
            </p>
          </Row>

          <Row title="Data We Simulate" icon={<HiOutlineInformationCircle className="h-5 w-5" />}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Profile details (name, email) generated or typed locally during the demo.</li>
              <li>Orders and cart items that illustrate checkout flows.</li>
              <li>Support messages as sample threads, not sent to a real backend.</li>
            </ul>
          </Row>

          <Row title="Cookies & Preferences" icon={<HiOutlineCake className="h-5 w-5" />}>
            <p>
              A temporary token may be set to simulate authentication or remember cart state during the session. It has no tracking
              purpose and expires quickly.
            </p>
            <div className="mt-4 grid gap-3">
              <Switch
                checked={prefs.essential}
                disabled
                onChange={() => toggle("essential")}
                label="Essential (required)"
                hint="Needed for basic features like staying signed in."
              />
              <Switch
                checked={prefs.analytics}
                onChange={() => toggle("analytics")}
                label="Analytics"
                hint="Anonymous stats to improve UX (not active in this portfolio)."
              />
              <Switch
                checked={prefs.marketing}
                onChange={() => toggle("marketing")}
                label="Marketing"
                hint="Personalized offers/ads (not used here)."
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearDemoData}
                className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 active:scale-[0.98]"
              >
                Clear Local Demo Data
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                onClick={() => {
                  setToast("Preferences updated");
                  setTimeout(() => setToast(""), 2000);
                }}
              >
                Save Preferences
              </button>
            </div>
          </Row>

          <Row title="Third-party Services" icon={<HiOutlineEyeOff className="h-5 w-5" />}>
            <p>
              When sample product data is fetched from public demo APIs (like DummyJSON), requests are made from your browser.
              No personal identifiers are attached.
            </p>
          </Row>

          <Row title="Your Controls" icon={<HiOutlineAdjustments className="h-5 w-5" />}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Clear your browser storage (LocalStorage/SessionStorage) to remove demo data.</li>
              <li>Disable cookies in your browser if you prefer a stateless demo.</li>
              <li>Use the mock toggles above to preview how a real app would expose choices.</li>
            </ul>
          </Row>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                setToast("Download started");
                setTimeout(() => setToast(""), 1800);
              }}
            >
              Download Policy
            </a>
            <a
              href="#"
              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                setToast("Policy emailed");
                setTimeout(() => setToast(""), 1800);
              }}
            >
              Email Me This
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
