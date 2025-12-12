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
  FaQuestion,
  FaCogs,
  FaGithub,
  FaArrowRight,
  FaServer,
  FaCode,
  FaLayerGroup,
  FaBrain,
  FaAws
} from "react-icons/fa";
import { SiRedux, SiTailwindcss, SiRazorpay, SiRedis } from "react-icons/si";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-float { animation: float 6s ease-in-out infinite; }
  `}</style>
);

export default function About() {
  const [open, setOpen] = useState(0);

  const faqs = useMemo(
    () => [
      {
        q: "Is VKart a real store?",
        a: "No. VKart is a portfolio project built by a single developer to demonstrate MERN stack expertise, UI/UX skills, and real e-commerce flows.",
      },
      {
        q: "Does the checkout actually work?",
        a: "Yes. VKart integrates Razorpay (test mode), Google OAuth login, JWT auth, and secure backend flows just like a real-world app.",
      },
      {
        q: "Is there an admin panel?",
        a: "Yes. VKart has a full admin dashboard for managing products, users, and orders. Access is restricted for security, but code is available on GitHub.",
      },
      {
        q: "Why did you build VKart?",
        a: "To show real-world engineering ability, clean architecture, problem solving, and production-like front-end and back-end implementation.",
      },
    ],
    []
  );

  return (
    <main className="relative min-h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      <AnimStyles />

      {/* Ambient Background Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative container mx-auto px-4 pt-20 pb-24 sm:pt-32 sm:pb-32 text-center z-10">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm mb-8">
            <FaRocket /> Project Case Study
          </span>

          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
            Building a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Production-Ready</span> <br className="hidden sm:block" /> E-Commerce Engine.
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed font-medium">
            VKart isn't just a template. It's a complete, full-stack system engineered with modern practices, secure authentication, and complex state management.
          </p>
        </div>
      </section>

      {/* --- TECH STACK BENTO GRID --- */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {[
            { icon: FaReact, name: "React.js", color: "text-blue-400" },
            { icon: SiRedux, name: "Redux Toolkit", color: "text-purple-500" },
            { icon: FaNodeJs, name: "Node.js", color: "text-green-500" },
            { icon: FaDatabase, name: "MongoDB Vector", color: "text-green-600" },
            { icon: SiRedis, name: "Redis Cache", color: "text-red-500" },
            { icon: FaAws, name: "AWS S3", color: "text-orange-500" },
            { icon: SiTailwindcss, name: "Tailwind CSS", color: "text-sky-400" },
            { icon: FaLock, name: "JWT Auth", color: "text-orange-500" },
            { icon: SiRazorpay, name: "Razorpay", color: "text-blue-600" },
          ].map((tech, i) => (
            <div key={i} className="group bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-lg hover:bg-white transition-all duration-300 hover:-translate-y-1">
              <tech.icon className={`text-4xl ${tech.color} group-hover:scale-110 transition-transform`} />
              <span className="font-bold text-gray-700 text-sm">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- KEY FEATURES (Cards) --- */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Core Architecture</h2>
            <p className="text-gray-500 mt-2">Built to handle real-world scenarios.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <FaCogs />,
              title: "Admin Dashboard",
              desc: "Full CRUD capabilities for products and users protected by admin middleware."
            },
            {
              icon: <FaShieldAlt />,
              title: "Secure Auth",
              desc: "JWT-based sessions with HttpOnly cookies and Google OAuth integration."
            },
            {
              icon: <FaCartPlus />,
              title: "Checkout Flow",
              desc: "End-to-end payment processing with address management and order tracking."
            },
            {
              icon: <FaLayerGroup />,
              title: "State Management",
              desc: "Centralized Redux store for cart, user session, and persistent UI states."
            },
            {
              icon: <FaBrain />,
              title: "AI Intelligence",
              desc: "RAG-powered assistant using MongoDB Vector Search for context-aware support."
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- ARCHITECTURE LIST --- */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCode className="text-2xl text-gray-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-12">Engineering Decisions</h2>

            <div className="grid sm:grid-cols-2 text-left gap-x-12 gap-y-6">
              {[
                "Modular component architecture for reusability",
                "Optimistic UI updates for snappy feel",
                "Data validation via Mongoose Schemas",
                "MongoDB indexing for faster queries",
                "Responsive mobile-first Tailwind styling",
                "Secure environment variable management",
                "Image optimization and lazy loading",
                "RESTful API best practices"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <FaCheckCircle className="text-green-500 mt-1 shrink-0" />
                  <span className="font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ ACCORDION --- */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-bold tracking-widest text-xs uppercase">Questions</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Common Queries</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${open === i
                    ? "bg-white border-orange-200 shadow-lg shadow-orange-500/5"
                    : "bg-white/50 border-gray-200 hover:bg-white"
                  }`}
              >
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className={`font-bold transition-colors ${open === i ? "text-orange-600" : "text-gray-900"}`}>
                    {f.q}
                  </span>
                  <span className={`ml-4 text-xl font-light transition-transform duration-300 ${open === i ? "rotate-45 text-orange-600" : "text-gray-400"}`}>
                    +
                  </span>
                </button>
                <div
                  className={`px-6 text-gray-600 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${open === i ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA / FOOTER --- */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Decor */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800/50 via-transparent to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
              Ready to see the code?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Dive into the repository to explore the folder structure, custom hooks, and backend logic.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-all active:scale-95"
              >
                Live Demo
              </a>
              <a
                href="https://github.com/vardhan12178/vkart"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 text-white font-bold border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <FaGithub size={20} /> Source Code
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}