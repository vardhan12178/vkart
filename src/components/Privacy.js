import React from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineDatabase,
  HiOutlineGlobeAlt,
  HiOutlineAdjustments,
} from "react-icons/hi";

const Section = ({ number, title, icon: Icon, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        {number}
      </span>
      {title}
      {Icon ? <Icon className="ml-1 h-4 w-4 text-gray-400" /> : null}
    </h2>
    <div className="mt-3 text-sm leading-relaxed text-gray-700">{children}</div>
  </section>
);

export default function Privacy() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <main className="min-h-[70vh] bg-[#f9fafb]">
      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        {/* simple hero, no global <header> styling issues */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Sample privacy notice for a demo project
          </div>

          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-700">
              VKart is a <strong>non-commercial portfolio demonstration</strong>{" "}
              created to showcase full-stack e-commerce features. This Privacy
              Policy explains what information is handled in the demo and how
              you should treat any data you choose to enter.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          <Section
            number="1"
            title="Overview"
            icon={HiOutlineShieldCheck}
          >
            <p>
              This demo is intended for learning, portfolio, and recruitment
              purposes only. It is not an operating online store and is not
              designed to process real customer data, real payments, or real
              orders.
            </p>
          </Section>

          <Section
            number="2"
            title="Information You May Enter"
            icon={HiOutlineInformationCircle}
          >
            <p>
              Some screens allow you to type details such as a name, email
              address, shipping address, or support message. This information is
              used purely to demonstrate typical e-commerce flows (for example,
              filling a checkout form or sending a contact request).
            </p>
            <p className="mt-2">
              You should treat all fields as <strong>test inputs</strong>. Do
              not submit:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Real payment card or banking information.</li>
              <li>
                Government-issued IDs or other highly sensitive personal data.
              </li>
              <li>
                Anything you would not normally share in a public demo
                environment.
              </li>
            </ul>
          </Section>

          <Section
            number="3"
            title="Local Storage, Cookies & Session Data"
            icon={HiOutlineDatabase}
          >
            <p>
              The demo may use browser technologies such as{" "}
              <strong>localStorage</strong>, <strong>sessionStorage</strong>, or
              simple cookies to:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Keep items in your cart while you browse.</li>
              <li>Remember filters or view preferences.</li>
              <li>Simulate a logged-in session.</li>
            </ul>
            <p className="mt-2">
              This data is stored only in your browser and can be cleared at any
              time using your browser settings (clear site data / cookies).
            </p>
          </Section>

          <Section
            number="4"
            title="Analytics & Tracking"
            icon={HiOutlineGlobeAlt}
          >
            <p>
              The hosted portfolio version of VKart does{" "}
              <strong>not</strong> include third-party analytics such as Google
              Analytics, advertising trackers, or remarketing pixels.
            </p>
            <p className="mt-2">
              If you reuse this codebase in your own project and add analytics
              or marketing tools, you should update this section to reflect your
              actual data collection and obtain any required consent.
            </p>
          </Section>

          <Section
            number="5"
            title="Third-party APIs & Demo Data"
            icon={HiOutlineGlobeAlt}
          >
            <p>
              Product listings and other sample content may be sourced from
              public demo APIs or static JSON files. These calls generally
              include only technical request information (such as your IP
              address, as part of normal web traffic) and do not attach
              additional identifiers from this demo.
            </p>
          </Section>

          <Section
            number="6"
            title="Your Choices"
            icon={HiOutlineAdjustments}
          >
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Avoid using real personal or payment details while exploring the
                demo.
              </li>
              <li>
                Clear your browser’s cookies and storage if you want to remove
                any locally stored demo data (cart contents, forms, or mock
                sessions).
              </li>
              <li>
                You may stop using the demo at any time; data may be reset
                without notice as part of development.
              </li>
            </ul>
          </Section>

          <Section number="7" title="Contact" icon={HiOutlineInformationCircle}>
            <p>
              If you have questions about how this portfolio demo works or
              would like more technical details for evaluation or recruitment,
              please use the Contact page provided in the site navigation.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
