import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  InformationCircleIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl ring-1 ring-gray-200 bg-white/80 p-6 shadow">
    <div className="mb-2 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-gray-700" />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
  </div>
);

const License = () => {
  const [copied, setCopied] = useState(false);
  const attribution = `Vkart (portfolio demo). Code & UI: © ${new Date().getFullYear()} Vkart. Not for redistribution. Product data from public demo sources (e.g., DummyJSON). Icons/images follow their respective licenses.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(attribution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">License</h1>
          <p className="mt-3 text-lg text-gray-700">
            This is a portfolio/demo project. Content here is illustrative and not meant for production use.
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SectionCard title="Summary" icon={InformationCircleIcon}>
            <p>
              All code and UI in this repository are provided for <strong>personal portfolio</strong> and
              <strong> educational</strong> purposes. <span className="font-medium">Do not redistribute</span>,
              sell, or publish as-is without permission.
            </p>
          </SectionCard>

          <SectionCard title="Attribution Template">
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800">
              <code className="whitespace-pre-wrap break-words">{attribution}</code>
            </div>
            <button
              onClick={copy}
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:border-gray-400"
            >
              <DocumentDuplicateIcon className="h-4 w-4" /> {copied ? "Copied!" : "Copy"}
            </button>
          </SectionCard>

          <SectionCard title="Third‑party Data & Assets" icon={ShieldCheckIcon}>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">Product data</span>: Pulled from public demo sources (e.g., DummyJSON). Please
                review their terms before reuse.
              </li>
              <li>
                <span className="font-medium">Icons</span>: Heroicons (MIT). See
                <a
                  className="inline-flex items-center gap-1 text-orange-700 hover:underline ml-1"
                  href="https://github.com/tailwindlabs/heroicons/blob/master/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                >
                  license <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </li>
              <li>
                <span className="font-medium">Illustrations/Images</span>: Each image retains its original license. Replace
                placeholders before any real deployment.
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Usage Guidelines">
            <ul className="list-disc pl-5 space-y-1">
              <li>✅ You may read and learn from the code.</li>
              <li>✅ You may adapt small snippets for personal learning with attribution.</li>
              <li>🚫 You may not resell, repackage, or publish this project as your own.</li>
              <li>🚫 Do not use any brand names, logos, or sample data in production contexts.</li>
            </ul>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SectionCard title="Trademarks & Disclaimer" icon={ExclamationCircleIcon}>
            <p>
              All third‑party names, brands, and logos are used for demonstration only and are the property of
              their respective owners. This project is provided <em>as‑is</em> without any warranties.
            </p>
          </SectionCard>

          <SectionCard title="Contact">
            <p>
              For permissions or credit corrections, please reach out via the <Link to="/contact" className="text-orange-700 hover:underline">Contact</Link> page.
            </p>
            <p className="mt-2 text-xs text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </SectionCard>
        </div>
      </div>
    </main>
  );
};

export default License;
