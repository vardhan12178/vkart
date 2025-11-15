import React from "react";
import { Link } from "react-router-dom";


const Section = ({ number, title, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        {number}
      </span>
      {title}
    </h2>
    <div className="mt-3 text-sm leading-relaxed text-gray-700">{children}</div>
  </section>
);

export default function License() {
  const year = new Date().getFullYear();

  return (
    <main className="min-h-[70vh] bg-[#f9fafb]">
      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        {/* SIMPLE HEADER */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Licensing & Attribution
          </div>

          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              License
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-700">
              VKart is a <strong>portfolio demonstration project</strong>.  
              This page outlines usage permissions, attribution requirements,
              and third-party licenses used in the demo.
            </p>
            <p className="mt-2 text-xs text-gray-500">Last updated: {year}</p>
          </div>
        </div>

        {/* SECTIONS */}
        <div className="mt-8 grid gap-6">
          <Section number="1" title="Purpose of This Project">
            <p>
              VKart is built exclusively for{" "}
              <strong>learning, skill demonstration, and recruitment</strong>.
              It is not a real company, does not provide real services, and is
              not intended for commercial distribution.
            </p>
          </Section>

          <Section number="2" title="License Summary">
            <p>
              All original code and UI components in this demo are licensed as:
            </p>

            <p className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
              © {year} VKart Portfolio Demo  
              <br />
              Permission: Personal learning & portfolio display only  
              <br />
              Restriction: Do not redistribute, resell, or publish as your own  
            </p>

            <p className="mt-3 text-gray-700 text-sm">
              You may explore the code, learn from it, and adapt small snippets
              with attribution. You may not clone and publicly launch this demo
              as a commercial or public project.
            </p>
          </Section>

          <Section number="3" title="Attribution Template">
            <p className="text-sm">
              If you reuse small portions (UI, logic, helpers), please include:
            </p>
            <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800">
              <code className="whitespace-pre-wrap break-words">
                “Portions of UI/code adapted from VKart (Portfolio Demo) —  
                © {year} Bala Vardhan Pula.”
              </code>
            </div>
          </Section>

          <Section number="4" title="Third-party Libraries & Data">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Heroicons</strong> — MIT License  
              </li>
              <li>
                <strong>React Icons</strong> — MIT License  
              </li>
              <li>
                <strong>DummyJSON API</strong> — Public Demo Data Source  
              </li>
              <li>
                Illustrations, placeholders, and product images retain their
                original licenses and should be replaced before real deployment.
              </li>
            </ul>
          </Section>

          <Section number="5" title="What You May / May Not Do">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>✅ Learn from the project.</li>
              <li>✅ Reuse UI ideas or small code segments with attribution.</li>
              <li>🚫 Do not copy and republish this project as your own.</li>
              <li>🚫 Do not resell, package, or offer as a commercial template.</li>
              <li>
                🚫 Do not use VKart brand name, icons, or fictional company text
                in a real business or commercial context.
              </li>
            </ul>
          </Section>

          <Section number="6" title="Disclaimer">
            <p>
              VKart and all related names used here are fictional. Any resemblance
              to actual products, brands, or companies is coincidental.
            </p>
            <p className="mt-2">
              This project is provided <em>“as-is”</em> without warranties or
              guarantees.
            </p>
          </Section>

          <Section number="7" title="Contact">
            <p>
              For questions, attribution help, or corrections, reach out via the{" "}
              <Link className="text-orange-700 font-semibold hover:underline" to="/contact">
                Contact Page
              </Link>.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
