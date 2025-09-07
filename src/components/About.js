import React, { useEffect, useMemo, useState } from "react";
import {
  FaBullhorn,
  FaEye,
  FaRocket,
  FaHandsHelping,
  FaUsers,
  FaStore,
  FaAward,
  FaQuestionCircle,
  FaCheckCircle,
  FaShieldAlt,
  FaShippingFast,
  FaHeadset,
  FaLeaf,
} from "react-icons/fa";

function CountUp({ to = 0, duration = 1200, prefix = "", suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span>
      {prefix}
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function About() {
  const [open, setOpen] = useState(0);

  const faqs = useMemo(
    () => [
      {
        q: "What is VKart’s core focus?",
        a: "Curated, high-quality essentials across categories with a frictionless, trustworthy buying experience.",
      },
      {
        q: "Do you ship everywhere?",
        a: "We currently ship to all major cities and are expanding coverage every month.",
      },
      {
        q: "Is this a real store or portfolio demo?",
        a: "This is a portfolio experience that mirrors a real store UX—safe to explore end-to-end.",
      },
    ],
    []
  );

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <section className="container mx-auto px-6 lg:px-10 pt-16 pb-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wider text-orange-600">ABOUT US</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              We’re building the most{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                delightful shopping
              </span>{" "}
              experience.
            </h1>
            <p className="mt-4 text-gray-700 leading-relaxed">
              VKart exists to make online shopping simple, personal, and dependable—powered by thoughtful design and real customer care.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#mission" className="inline-flex items-center rounded-xl bg-orange-600 px-5 py-3 text-white font-semibold shadow hover:brightness-105">
                Our Story
              </a>
              <a href="#values" className="inline-flex items-center rounded-xl px-5 py-3 ring-1 ring-gray-300 text-gray-800 hover:bg-gray-50">
                Our Principles
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-md rounded-3xl bg-white/70 p-6 shadow-xl ring-1 ring-gray-200 backdrop-blur">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <FaUsers className="mx-auto text-xl text-orange-600" />
                  <p className="mt-2 text-2xl font-extrabold text-gray-900">
                    <CountUp to={25000} suffix="+" />
                  </p>
                  <p className="text-xs text-gray-500">Happy Shoppers</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <FaStore className="mx-auto text-xl text-orange-600" />
                  <p className="mt-2 text-2xl font-extrabold text-gray-900">
                    <CountUp to={1500} suffix="+" />
                  </p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <FaAward className="mx-auto text-xl text-orange-600" />
                  <p className="mt-2 text-2xl font-extrabold text-gray-900">4.8★</p>
                  <p className="text-xs text-gray-500">Avg. Rating</p>
                </div>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-gray-700">
                {[
                  "Curated quality across categories",
                  "Fast delivery in major cities",
                  "Human support—no bots, no hassle",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 text-emerald-500" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="container mx-auto px-6 lg:px-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <FaBullhorn className="text-5xl text-orange-500" />,
              title: "Our Mission",
              text: "Revolutionize online shopping with curated products, clarity, and genuine care—so every purchase feels confident.",
            },
            {
              icon: <FaEye className="text-5xl text-orange-500" />,
              title: "Our Vision",
              text: "Be the destination customers trust for quality, value, and a seamless experience across every category.",
            },
            {
              icon: <FaHandsHelping className="text-5xl text-orange-500" />,
              title: "Our Values",
              text: "Integrity, transparency, and customer-centricity guide every decision we make—and every product we stock.",
            },
            {
              icon: <FaRocket className="text-5xl text-orange-500" />,
              title: "Innovation",
              text: "We constantly refine UX and logistics—personalized picks, faster checkout, and reliable delivery windows.",
            },
          ].map((c, i) => (
            <article
              key={i}
              className="group rounded-2xl bg-white/80 p-8 shadow-2xl ring-1 ring-gray-200 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                {c.icon}
                <h3 className="mt-5 text-2xl font-bold text-gray-900">{c.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Our Journey</h2>
          <div className="mt-8 relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-1 rounded-full bg-gradient-to-b from-orange-300 via-amber-300 to-orange-200" />
            <ol className="relative grid gap-8">
              {[
                {
                  year: "2023",
                  title: "VKart Concept",
                  text: "We started as a small experiment to re-imagine a simpler e-commerce UX.",
                },
                {
                  year: "2024",
                  title: "First Release",
                  text: "Launched a polished, mobile-first storefront and streamlined browsing.",
                },
                {
                  year: "Today",
                  title: "Growing with You",
                  text: "Expanding categories, refining delivery, and elevating personalization.",
                },
              ].map((t, i) => (
                <li key={i} className="relative">
                  <div className="mx-auto max-w-xl rounded-2xl bg-white/80 p-5 shadow ring-1 ring-gray-200 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                      <span className="text-sm text-gray-500">{t.year}</span>
                    </div>
                    <p className="mt-2 text-gray-700 leading-relaxed">{t.text}</p>
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 grid size-7 place-items-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-xs font-bold shadow ring-4 ring-white">
                    {i + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="values" className="container mx-auto px-6 lg:px-10 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <FaShieldAlt />, text: "Quality-first sourcing" },
            { icon: <FaShippingFast />, text: "Fast, reliable delivery" },
            { icon: <FaHeadset />, text: "Friendly, human support" },
            { icon: <FaLeaf />, text: "Sustainable practices" },
          ].map((v, i) => (
            <div key={i} className="rounded-2xl bg-white/80 p-5 text-center shadow ring-1 ring-gray-200 backdrop-blur">
              <div className="mx-auto mb-2 grid size-9 place-items-center rounded-xl bg-orange-100 text-orange-600">
                {v.icon}
              </div>
              <p className="font-semibold text-gray-900">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-2">
            <FaQuestionCircle className="text-orange-600" />
            <h3 className="text-2xl font-extrabold text-gray-900">FAQs</h3>
          </div>

          <div className="mt-6 divide-y divide-gray-200 rounded-2xl bg-white/80 shadow ring-1 ring-gray-200 backdrop-blur">
            {faqs.map((f, i) => (
              <button
                key={i}
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full text-left px-5 py-4 focus:outline-none"
                aria-expanded={open === i}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{f.q}</p>
                  <span
                    className={`ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
                      open === i ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {open === i ? "–" : "+"}
                  </span>
                </div>
                {open === i && <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate mx-4 mb-16 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-center shadow-2xl ring-1 ring-orange-300 sm:mx-auto sm:max-w-4xl">
        <h3 className="text-2xl font-extrabold text-white">Ready to explore VKart?</h3>
        <p className="mt-2 text-white/90">Discover curated products with fast delivery and human support.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="/products" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:opacity-95">
            Browse Products
          </a>
          <a href="/contact" className="rounded-xl ring-1 ring-white/80 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
            Contact Support
          </a>
        </div>
      </section>
    </main>
  );
}
