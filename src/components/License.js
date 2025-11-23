import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaBalanceScale, 
  FaCode, 
  FaCheck, 
  FaTimes, 
  FaCreativeCommons, 
  FaLayerGroup, 
  FaExclamationCircle, 
  FaEnvelope 
} from "react-icons/fa";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    html { scroll-behavior: smooth; }
  `}</style>
);

export default function License() {
  const year = new Date().getFullYear();
  const [activeSection, setActiveSection] = useState("purpose");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "purpose";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute("id");
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { id: "purpose", title: "1. Project Purpose", icon: FaLayerGroup },
    { id: "license", title: "2. License Summary", icon: FaCreativeCommons },
    { id: "attribution", title: "3. Attribution", icon: FaCode },
    { id: "thirdparty", title: "4. 3rd Party Assets", icon: FaLayerGroup },
    { id: "permissions", title: "5. Do's & Don'ts", icon: FaBalanceScale },
    { id: "disclaimer", title: "6. Disclaimer", icon: FaExclamationCircle },
    { id: "contact", title: "7. Contact", icon: FaEnvelope },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 relative overflow-hidden">
      <AnimStyles />
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-amber-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <div className="relative bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-6">
            Usage Rights
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            License & Attribution
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Usage guidelines for the VKart portfolio project, including permissions, restrictions, and open-source credits.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-400">Last Updated: {year}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* --- SIDEBAR NAVIGATION (Desktop Sticky) --- */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-4">Table of Contents</p>
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeSection === item.id
                    ? "bg-gray-900 text-white shadow-lg"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className={activeSection === item.id ? "text-orange-400" : "text-gray-400"} />
                {item.title}
              </a>
            ))}
          </div>
        </aside>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 max-w-3xl space-y-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          
          {/* 1. Purpose */}
          <section id="purpose" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">1</span>
              Purpose of This Project
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p>
                VKart is built exclusively for <strong>learning, skill demonstration, and recruitment purposes</strong>. 
                It acts as a proof-of-concept for full-stack e-commerce development. It is not a registered business entity and does not conduct commercial activity.
              </p>
            </div>
          </section>

          {/* 2. License Summary */}
          <section id="license" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">2</span>
              License Summary
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">
                The original code, UI designs, and architecture of this demo are licensed under a custom Portfolio License:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-700 mb-4">
                © {year} VKart Portfolio Demo <br/>
                <span className="text-green-600">✓ Permission:</span> Personal learning, code review, portfolio display. <br/>
                <span className="text-red-500">✕ Restriction:</span> Do not redistribute, resell, or whitelabel as a commercial product.
              </div>
              <p>
                You are free to fork the repository to study the code, but you may not deploy a clone of this site for commercial gain.
              </p>
            </div>
          </section>

          {/* 3. Attribution */}
          <section id="attribution" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">3</span>
              Attribution Template
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">
                If you adapt significant portions of the UI logic or backend architecture for your own open-source learning project, please include a credit:
              </p>
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto group relative">
                <code className="text-gray-300 text-xs sm:text-sm font-mono">
                  // Portions of this code adapted from VKart (Portfolio) <br/>
                  // © {year} Bala Vardhan Pula.
                </code>
              </div>
            </div>
          </section>

          {/* 4. Third Party */}
          <section id="thirdparty" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">4</span>
              Third-Party Assets
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Heroicons & React Icons:</span> MIT License
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">DummyJSON:</span> Public Demo Data Source
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Product Images:</span> Sourced from open demo catalogs. Not owned by VKart.
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Dos and Donts */}
          <section id="permissions" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">5</span>
              What You Can Do
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-green-800 font-bold flex items-center gap-2 mb-3">
                  <FaCheck className="text-sm" /> Permitted
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Review code for hiring.</li>
                  <li>• Use patterns for personal learning.</li>
                  <li>• Fork repo for experimentation.</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h3 className="text-red-800 font-bold flex items-center gap-2 mb-3">
                  <FaTimes className="text-sm" /> Restricted
                </h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• Reselling as a template.</li>
                  <li>• Removing attribution.</li>
                  <li>• Representing VKart as a real business.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Disclaimer */}
          <section id="disclaimer" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">6</span>
              Disclaimer
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p>
                VKart and all related names, branding, and products used here are fictional or used for demonstration. Any resemblance to actual active commercial entities is coincidental.
              </p>
              <p className="mt-2 text-sm italic">
                This project is provided "as-is" without warranties of any kind.
              </p>
            </div>
          </section>

          {/* 7. Contact */}
          <section id="contact" className="scroll-mt-28 mb-20">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">7</span>
              Contact
            </h2>
            <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
              <p className="mb-6 text-gray-300">
                For licensing inquiries, attribution questions, or recruitment opportunities, please reach out.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                <FaEnvelope /> Contact Developer
              </Link>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}