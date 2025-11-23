import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFileContract, FaShieldAlt, FaUserShield, FaCreditCard, FaExclamationTriangle, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    html { scroll-behavior: smooth; }
  `}</style>
);

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const [activeSection, setActiveSection] = useState("overview");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute("id");
        }
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { id: "overview", title: "1. Overview", icon: FaFileContract },
    { id: "usage", title: "2. Acceptable Use", icon: FaUserShield },
    { id: "accounts", title: "3. Accounts & Content", icon: FaShieldAlt },
    { id: "payments", title: "4. Payments (Simulated)", icon: FaCreditCard },
    { id: "liability", title: "5. Liability & Disclaimer", icon: FaExclamationTriangle },
    { id: "contact", title: "6. Contact Us", icon: FaEnvelope },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 relative overflow-hidden">
      <AnimStyles />
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Header */}
      <div className="relative bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-6">
            Legal Documentation
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Please read these terms carefully before using VKart. By accessing or using our service, you agree to be bound by these terms.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-400">Last Updated: {lastUpdated}</p>
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
          
          {/* 1. Overview */}
          <section id="overview" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">1</span>
              Overview
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">
                VKart (“the Site”) is a <strong>non-commercial portfolio project</strong> created for educational and demonstration purposes. It simulates a real-world e-commerce environment but does not facilitate actual sales or product delivery.
              </p>
              <p>
                By using this website, you acknowledge that it is a technology demonstration and agree not to use it for any illegal or unauthorized purpose.
              </p>
            </div>
          </section>

          {/* 2. Acceptable Use */}
          <section id="usage" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">2</span>
              Acceptable Use
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">You agree to use the Site only for lawful purposes. You are strictly prohibited from:</p>
              <ul className="space-y-3 list-none pl-0">
                {[
                  "Submitting real personal, financial, or sensitive data.",
                  "Attempting to breach, exploit, or reverse-engineer the application.",
                  "Uploading malicious code, viruses, or harmful content.",
                  "Using automated scripts to scrape or overload the system."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <FaExclamationTriangle className="text-amber-500 mt-1 shrink-0 size-4" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 3. Accounts */}
          <section id="accounts" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">3</span>
              Accounts & Content
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p>
                Account creation features are for demonstration only. Any data you enter (names, emails, addresses) may be stored in a temporary database. 
                <strong> We reserve the right to delete any account or data at any time without notice.</strong>
              </p>
            </div>
          </section>

          {/* 4. Payments */}
          <section id="payments" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">4</span>
              Payments (Simulated)
            </h2>
            <div className="bg-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-100 leading-relaxed text-gray-800">
              <div className="flex items-start gap-4">
                <FaCreditCard className="text-3xl text-orange-500 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">No Real Charges</h3>
                  <p className="text-sm opacity-90">
                    The checkout process integrates with Razorpay's <strong>Test Mode</strong>. No real money is deducted, and no financial transactions occur. Do not enter real credit card details.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Liability */}
          <section id="liability" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">5</span>
              Liability & Disclaimer
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">
                The Site is provided on an "AS IS" and "AS AVAILABLE" basis. The creator makes no representations or warranties of any kind, express or implied, regarding the operation of the Site or the information, content, or materials included.
              </p>
              <p>
                In no event shall the creator be liable for any damages arising out of or in connection with your use of the Site.
              </p>
            </div>
          </section>

          {/* 6. Contact */}
          <section id="contact" className="scroll-mt-28 mb-20">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">6</span>
              Contact Information
            </h2>
            <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
              <p className="mb-6 text-gray-300">
                If you have any questions about these Terms, the tech stack, or the project architecture, feel free to reach out.
              </p>
              <div className="flex gap-4">
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  <FaEnvelope /> Contact Support
                </Link>
                <a 
                  href="https://github.com/vardhan12178/vkart" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold border border-white/10 hover:bg-white/20 transition-colors"
                >
                  View Code <FaExternalLinkAlt size={12} />
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}