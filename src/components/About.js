import React, { useMemo, useState } from "react";
import {
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaLock,
  FaCheckCircle,
  FaShieldAlt,
  FaRocket,
  FaCartPlus,
  FaQuestionCircle,
  FaCogs,
} from "react-icons/fa";

export default function About() {
  const [open, setOpen] = useState(-1);

  const faqs = useMemo(
    () => [
      {
        q: "Is VKart a real store?",
        a: "No. VKart is a portfolio project built by a single developer (Bala Vardhan) to demonstrate MERN stack expertise, UI/UX skills, and real e-commerce flows.",
      },
      {
        q: "Does the checkout and payment system actually work?",
        a: "Yes. VKart integrates Razorpay (test mode), Google OAuth login, JWT auth, and secure backend flows just like a real-world app.",
      },
      {
        q: "Is there an admin panel?",
        a: "Yes. VKart has a full admin dashboard for managing products, users, and orders. Access is restricted, but the full demo can be shown during an interview.",
      },
      {
        q: "Why did you build VKart?",
        a: "To show real-world engineering ability, clean architecture, problem solving, and production-like front-end and back-end implementation.",
      },
    ],
    []
  );

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">

      {/* Background bubbles */}
      <div aria-hidden className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      {/* HERO */}
      <section className="container mx-auto px-6 lg:px-10 pt-20 pb-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wider text-orange-600">
              ABOUT THIS PROJECT
            </p>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              VKart — A Modern{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                Full-Stack E-Commerce
              </span>{" "}
              Case Study.
            </h1>

            <p className="mt-4 text-gray-700 leading-relaxed text-lg">
              VKart is a complete e-commerce system built from scratch using the
              MERN stack. It showcases production-like flows, UI polish,
              authentication, payments, admin tools, and clean component
              architecture — all created by a single developer.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="mx-auto max-w-md rounded-3xl bg-white/70 p-6 shadow-xl ring-1 ring-gray-200 backdrop-blur">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
              Technology Stack
            </h3>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl bg-orange-50 p-4">
                <FaReact className="mx-auto text-3xl text-orange-600" />
                <p className="mt-2 font-semibold text-gray-900">React + Redux</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <FaNodeJs className="mx-auto text-3xl text-orange-600" />
                <p className="mt-2 font-semibold text-gray-900">Node.js + Express</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <FaDatabase className="mx-auto text-3xl text-orange-600" />
                <p className="mt-2 font-semibold text-gray-900">MongoDB</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <FaLock className="mx-auto text-3xl text-orange-600" />
                <p className="mt-2 font-semibold text-gray-900">OAuth + JWT + 2FA</p>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-700 text-center">
              Real authentication, real payments, real architecture. All flows work end-to-end.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="container mx-auto px-6 lg:px-10 pb-16">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">
          Project Goals & Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <FaCogs className="text-5xl text-orange-500" />,
              title: "Full Admin Dashboard",
              text: "Manage products, users, orders, inventory, and more. All CRUD operations implemented with secure APIs.",
            },
            {
              icon: <FaLock className="text-5xl text-orange-500" />,
              title: "Advanced Authentication",
              text: "JWT-based login, Google OAuth, secure password hashing, and Two-Factor Authentication support.",
            },
            {
              icon: <FaCartPlus className="text-5xl text-orange-500" />,
              title: "Real Checkout Flow",
              text: "Integrated Razorpay test-mode payments, delivery info, order summary, and confirmation screens.",
            },
            {
              icon: <FaRocket className="text-5xl text-orange-500" />,
              title: "Modern UI & UX",
              text: "Clean responsive design, filters, persistent cart, smooth interactions, and production-quality components.",
            },
          ].map((f, i) => (
            <article
              key={i}
              className="group rounded-2xl bg-white/80 p-8 shadow-xl ring-1 ring-gray-200 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                {f.icon}
                <h3 className="mt-4 text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  {f.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="container mx-auto px-6 lg:px-10 pb-16">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          System Architecture Overview
        </h2>

        <p className="max-w-3xl mx-auto text-center text-gray-700 leading-relaxed mb-10">
          VKart is structured like a real production system with isolated concerns,
          modular components, and scalable back-end routing. The project reflects
          strong engineering practices, not template usage.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            "Modular React component design",
            "Redux Toolkit state management",
            "Express REST API architecture",
            "MongoDB schema & indexing",
            "Secure auth & token lifecycle",
            "Protected admin routes",
            "Image upload pipeline",
            "Checkout + payment validation",
          ].map((text, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/80 p-5 shadow ring-1 ring-gray-200 backdrop-blur flex items-center gap-3"
            >
              <FaCheckCircle className="text-emerald-500" />
              <p className="text-gray-900 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
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
                className="w-full text-left px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{f.q}</p>
                  <span
                    className={`ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      open === i
                        ? "bg-orange-600 text-white"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {open === i ? "–" : "+"}
                  </span>
                </div>

                {open === i && (
                  <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate mx-4 mb-20 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-12 text-center shadow-2xl ring-1 ring-orange-300 sm:mx-auto sm:max-w-4xl">
        <h3 className="text-2xl font-extrabold text-white">
          Want a full walkthrough of VKart?
        </h3>

        <p className="mt-2 text-white/90 max-w-xl mx-auto">
          I can provide a complete code and feature walkthrough during an
          interview — frontend, backend, admin tools, payments, and architecture.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/products"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow hover:opacity-95"
          >
            Browse Products
          </a>

          <a
            href="https://github.com/vardhan12178/vkart"
            target="_blank"
            className="rounded-xl ring-1 ring-white/80 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            View Source Code
          </a>
        </div>
      </section>
    </main>
  );
}
