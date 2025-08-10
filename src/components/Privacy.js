import React, { useState } from "react";
import {
  ShieldCheckIcon,
  EyeOffIcon,
   CakeIcon,
  InformationCircleIcon,
  AdjustmentsIcon,
} from "@heroicons/react/outline";

const Row = ({ title, children, icon: Icon }) => (
  <section className="rounded-2xl ring-1 ring-gray-200 bg-white/80 p-6 shadow">
    <div className="mb-2 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-gray-700" />}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
  </section>
);

const Privacy = () => {
  // Mock cookie preferences (demo only)
  const [prefs, setPrefs] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Privacy Policy</h1>
          <p className="mt-3 text-lg text-gray-700">
            This portfolio doesn’t collect real personal data. Any info you enter is used only to demonstrate app flows.
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Row title="What We Actually Collect" icon={ShieldCheckIcon}>
            <p>
              <strong>Nothing sensitive.</strong> There’s no real sign‑up, payment, or analytics running here. If you see a
              profile, order, or address — it’s <em>mock data</em> for demo purposes.
            </p>
          </Row>

          <Row title="Data We Simulate" icon={InformationCircleIcon}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Profile details (name, email) – generated or typed locally during the demo.</li>
              <li>Orders and cart items – fake entries to illustrate checkout flows.</li>
              <li>Support messages – example threads, not sent to a real backend.</li>
            </ul>
          </Row>

          <Row title="Cookies (Demo)" icon={ CakeIcon}>
            <p>
              We may set a <strong>test token</strong> to simulate authentication or remember cart state during the session. It has no tracking
              purpose and expires quickly.
            </p>
            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Cookie Preferences (demo only)</div>
              <div className="space-y-2 text-sm">
                {[
                  { key: "essential", label: "Essential (required)", hint: "Needed for basic features like staying signed in." },
                  { key: "analytics", label: "Analytics", hint: "Anonymous stats to improve UX (not active in this portfolio)." },
                  { key: "marketing", label: "Marketing", hint: "Personalized offers/ads (not used here)." },
                ].map((c) => (
                  <label key={c.key} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={prefs[c.key]}
                      disabled={c.key === "essential"}
                      onChange={() => toggle(c.key)}
                    />
                    <span>
                      <span className="font-medium text-gray-900">{c.label}</span>
                      <div className="text-gray-600">{c.hint}</div>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">These toggles are illustrative only; no preferences are stored.</div>
            </div>
          </Row>

          <Row title="Third‑party Services" icon={EyeOffIcon}>
            <p>
              When sample product data is fetched from public demo APIs (like DummyJSON), requests are made from your browser.
              No personal identifiers are attached.
            </p>
          </Row>

          <Row title="Your Controls" icon={AdjustmentsIcon}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Clear your browser storage (LocalStorage/SessionStorage) to remove demo data.</li>
              <li>Disable cookies in your browser if you want a clean, stateless demo.</li>
              <li>Use the mock toggles above to see how a real app would expose choices.</li>
            </ul>
          </Row>
        </div>

        <p className="mt-6 text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
};

export default Privacy;
