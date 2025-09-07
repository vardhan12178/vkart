import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  InformationCircleIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
    {children}
  </span>
);

const Card = ({ title, icon: Icon, children }) => (
  <section className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200/60 via-amber-200/60 to-white shadow">
    <div className="rounded-3xl bg-white/90 ring-1 ring-gray-200 p-6">
      <div className="mb-3 flex items-center gap-3">
        {Icon ? (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-gray-700">{children}</div>
    </div>
  </section>
);

const Toast = ({ show, ok, text }) =>
  show ? (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-5 right-5 z-50 rounded-xl px-4 py-2 text-sm shadow-lg ring-1 ${
        ok ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-red-50 text-red-800 ring-red-200"
      }`}
    >
      {text}
    </div>
  ) : null;

export default function License() {
  const [toast, setToast] = useState({ show: false, ok: true, text: "" });
  const attribution = `Vkart (portfolio demo). Code & UI: © ${new Date().getFullYear()} Vkart. Not for redistribution. Product data from public demo sources (e.g., DummyJSON). Icons/images follow their respective licenses.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(attribution);
      setToast({ show: true, ok: true, text: "Attribution copied" });
    } catch {
      setToast({ show: true, ok: false, text: "Copy failed" });
    } finally {
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
    }
  };

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Toast show={toast.show} ok={toast.ok} text={toast.text} />
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/55 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <header className="max-w-4xl">
          <Badge>Licenses & Attribution</Badge>
          <div className="mt-3 rounded-3xl bg-white/80 ring-1 ring-gray-200 p-6 md:p-8 backdrop-blur">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">License</h1>
            <p className="mt-3 text-lg text-gray-700">
              This is a portfolio/demo experience. Content is illustrative and not intended for production use.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card title="Summary" icon={InformationCircleIcon}>
            <p>
              All code and UI here are provided for <strong>personal portfolio</strong> and <strong>educational</strong> use.
              <span className="ml-1 font-medium">Do not redistribute</span>, sell, or publish as-is without permission.
            </p>
          </Card>

          <Card title="Attribution Template">
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800">
              <code className="whitespace-pre-wrap break-words">{attribution}</code>
            </div>
            <button
              onClick={copy}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Copy
            </button>
          </Card>

          <Card title="Third-party Data & Assets" icon={ShieldCheckIcon}>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">Product data</span>: Pulled from public demo sources such as DummyJSON. Review their
                terms before reuse.
              </li>
              <li>
                <span className="font-medium">Heroicons</span> (MIT).{" "}
                <a
                  href="https://github.com/tailwindlabs/heroicons/blob/master/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-orange-700 hover:underline"
                >
                  License <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </li>
              <li>
                <span className="font-medium">Illustrations/Images</span>: Each retains its original license. Replace placeholders
                before any real deployment.
              </li>
            </ul>
          </Card>

          <Card title="Usage Guidelines">
            <ul className="list-disc pl-5 space-y-1">
              <li>✅ You may read and learn from the code.</li>
              <li>✅ You may adapt small snippets for personal learning with attribution.</li>
              <li>🚫 You may not resell, repackage, or publish this project as your own.</li>
              <li>🚫 Do not use brand names, logos, or sample data in production contexts.</li>
            </ul>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card title="Trademarks & Disclaimer" icon={ExclamationCircleIcon}>
            <p>
              All third-party names, brands, and logos are used for demonstration only and are the property of their respective
              owners. This project is provided <em>as-is</em> without any warranties.
            </p>
          </Card>

          <Card title="Contact">
            <p>
              For permissions or credit corrections, reach out via the{" "}
              <Link to="/contact" className="text-orange-700 hover:underline">
                Contact
              </Link>{" "}
              page.
            </p>
            <p className="mt-2 text-xs text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
