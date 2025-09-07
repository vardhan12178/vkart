import React from "react";
import {
  DocumentTextIcon,
  ExclamationCircleIcon,
  RefreshIcon,
  MailIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";

const Card = ({ title, icon: Icon, children, id }) => (
  <section
    id={id}
    className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200/60 via-amber-200/60 to-white shadow"
  >
    <div className="rounded-3xl bg-white/90 ring-1 ring-gray-200 p-6">
      <div className="mb-3 flex items-center gap-3">
        {Icon ? (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-gray-700">{children}</div>
    </div>
  </section>
);

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString();

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: ShieldCheckIcon,
      body: (
        <p>
          By accessing Vkart (the “Site”), you agree to these sample Terms. The Site is for <em>portfolio demonstration only</em>.
          Features such as authentication, cart, orders, and support are illustrative.
        </p>
      ),
    },
    {
      id: "use-of-service",
      title: "2. Use of Service",
      icon: ExclamationCircleIcon,
      body: (
        <p>
          Don’t attempt to disrupt, reverse-engineer, or abuse the Site. Avoid uploading sensitive information; any data you enter
          is treated as <em>test data</em> and may be reset at any time.
        </p>
      ),
    },
    {
      id: "accounts-content",
      title: "3. Accounts & Content",
      icon: InformationCircleIcon,
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Accounts may be mocked; sessions can be cleared without notice.</li>
          <li>Uploaded images/files (if any) should be non-sensitive and license-compliant.</li>
          <li>Demo content that is offensive or infringes third-party rights may be removed.</li>
        </ul>
      ),
    },
    {
      id: "payments-simulated",
      title: "4. Payments (Simulated)",
      icon: DocumentTextIcon,
      body: (
        <p>
          Checkout and payments are <strong>not real</strong>. No actual processing occurs and no charges are made. Any order
          confirmations are placeholders.
        </p>
      ),
    },
    {
      id: "third-party-services",
      title: "5. Third-party Services",
      icon: ShieldCheckIcon,
      body: (
        <p>
          Sample product data may be fetched from public demo APIs (e.g., DummyJSON). External services retain their own terms and
          privacy policies. Review those before reuse.
        </p>
      ),
    },
    {
      id: "limitation-of-liability",
      title: "6. Limitation of Liability",
      icon: ExclamationCircleIcon,
      body: (
        <p>
          The Site is provided “as-is”, without warranties of any kind. To the maximum extent permitted by law, the creator shall
          not be liable for any damages arising from your use of this demo.
        </p>
      ),
    },
    {
      id: "changes",
      title: "7. Changes",
      icon: RefreshIcon,
      body: (
        <p>
          We may update these Terms to reflect new demo features. Updates take effect when posted. The current revision date is
          shown below.
        </p>
      ),
    },
    {
      id: "contact",
      title: "8. Contact",
      icon: MailIcon,
      body: (
        <p>
          Questions about this demo? Reach out via the Contact page. For third-party licenses, see the License page.
        </p>
      ),
    },
  ];

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <header id="top" className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Sample legal copy for a portfolio
          </div>

          <div className="mt-3 rounded-3xl bg-white/80 ring-1 ring-gray-200 p-6 md:p-8 backdrop-blur">
            <h1 className="flex items-center gap-3 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              <DocumentTextIcon className="h-10 w-10 text-orange-600" />
              Terms of Service
            </h1>
            <p className="mt-3 text-lg text-gray-700">
              Vkart is a <strong>demonstration</strong> project. These terms are sample content to mimic a real app and are not
              legally binding.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-5">
          {sections.map((s) => (
            <Card key={s.id} id={s.id} title={s.title} icon={s.icon}>
              {s.body}
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/80 p-4 ring-1 ring-gray-200">
          <span className="text-xs text-gray-600">Last updated: {lastUpdated}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
            >
              Print <ExternalLinkIcon className="h-4 w-4" />
            </button>
            <a
              href="#top"
              className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
