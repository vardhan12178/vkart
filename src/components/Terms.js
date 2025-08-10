import React from "react";
import {
  DocumentTextIcon,
  ExclamationCircleIcon,
  RefreshIcon,
  MailIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";

const Block = ({ title, icon: Icon, children }) => (
  <section className="rounded-2xl ring-1 ring-gray-200 bg-white/80 p-6 shadow">
    <div className="mb-2 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-gray-700" />}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="text-sm leading-relaxed text-gray-700">{children}</div>
  </section>
);

const Terms = () => {
  const lastUpdated = new Date().toLocaleDateString();
  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* soft bg accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <header className="max-w-3xl">
          <h1 className="flex items-center gap-3 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            <DocumentTextIcon className="h-10 w-10 text-orange-600" />
            Terms of Service
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            Vkart is a <strong>demonstration</strong> project. These terms are sample content to mimic a real app and are not legally binding.
          </p>
        </header>

        {/* quick nav */}
        <nav aria-label="On this page" className="mt-6">
          <ul className="flex flex-wrap gap-2 text-sm">
            {["Introduction","Use of Service","Accounts & Content","Payments (Simulated)","Third‑party Services","Limitation of Liability","Changes","Contact"].map((t) => (
              <li key={t}>
                <a href={`#${t.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}`} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-800 hover:border-gray-300">{t}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Block title="1. Introduction" icon={ShieldCheckIcon}>
            <p id="introduction">
              By accessing Vkart (the “Site”), you agree to these sample Terms. The Site is for <em>portfolio demonstration only</em>.
              Features such as authentication, cart, orders, and support are illustrative.
            </p>
          </Block>

          <Block title="2. Use of Service" icon={ExclamationCircleIcon}>
            <p id="use-of-service">
              Don’t attempt to disrupt, reverse‑engineer, or abuse the Site. Avoid uploading sensitive information;
              any data you enter is treated as <em>test data</em> and may be reset at any time.
            </p>
          </Block>

          <Block title="3. Accounts & Content">
            <ul id="accounts-content" className="list-disc pl-5 space-y-1">
              <li>Accounts may be mocked; sessions can be cleared without notice.</li>
              <li>Uploaded images/files (if any) should be non‑sensitive and license‑compliant.</li>
              <li>We may remove demo content that is offensive or infringes third‑party rights.</li>
            </ul>
          </Block>

          <Block title="4. Payments (Simulated)">
            <p id="payments-simulated">
              Checkout and payments are <strong>not real</strong>. No actual processing occurs and no charges are made. Any order confirmations are placeholders.
            </p>
          </Block>

          <Block title="5. Third‑party Services">
            <p id="third-party-services">
              Sample product data may be fetched from public demo APIs (e.g., DummyJSON). External services retain their own
              terms and privacy policies. Review those before reuse.
            </p>
          </Block>

          <Block title="6. Limitation of Liability">
            <p id="limitation-of-liability">
              The Site is provided “as‑is”, without warranties of any kind. To the maximum extent permitted by law, the
              creator shall not be liable for any damages arising from your use of this demo.
            </p>
          </Block>

          <Block title="7. Changes" icon={RefreshIcon}>
            <p id="changes">
              We may update these Terms to reflect new demo features. Updates take effect when posted. The current revision date is below.
            </p>
          </Block>

          <Block title="8. Contact" icon={MailIcon}>
            <p id="contact">
              Questions about this demo? Reach out via the Contact page. For third‑party licenses, see the License page.
            </p>
          </Block>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-gray-600">
          <span>Last updated: {lastUpdated}</span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:border-gray-400"
          >
            Print <ExternalLinkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default Terms;
