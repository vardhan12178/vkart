import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaUserSecret, 
  FaCookieBite, 
  FaServer, 
  FaGlobeAmericas, 
  FaUserCog, 
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

export default function Privacy() {
  const lastUpdated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const [activeSection, setActiveSection] = useState("overview");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "overview";
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
    { id: "overview", title: "1. Overview", icon: FaShieldAlt },
    { id: "info", title: "2. Data Collection", icon: FaUserSecret },
    { id: "storage", title: "3. Cookies & Storage", icon: FaCookieBite },
    { id: "analytics", title: "4. Analytics (None)", icon: FaServer },
    { id: "thirdparty", title: "5. Third-Party APIs", icon: FaGlobeAmericas },
    { id: "rights", title: "6. Your Rights", icon: FaUserCog },
    { id: "contact", title: "7. Contact", icon: FaEnvelope },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 relative overflow-hidden">
      <AnimStyles />
      
      {/* Ambient Background */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Header */}
      <div className="relative bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-widest mb-6">
            Data & Security
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Transparency regarding how this portfolio demo handles data. No real customer data is processed or sold.
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
                <item.icon className={activeSection === item.id ? "text-green-400" : "text-gray-400"} />
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
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">1</span>
              Overview
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p>
                VKart is a <strong>non-commercial portfolio demonstration</strong> created to showcase full-stack e-commerce features. 
                This policy clarifies that while the site looks and feels real, it is a simulation. 
              </p>
            </div>
          </section>

          {/* 2. Data Collection */}
          <section id="info" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">2</span>
              Information You Enter
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">
                You may be asked to enter details like names, addresses, or emails to test functionalities (e.g., Checkout, Profile).
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 font-medium">
                Please treat all input fields as <strong>Test Inputs</strong>. Do not submit real credit card numbers, passwords used on other sites, or sensitive personal data.
              </div>
            </div>
          </section>

          {/* 3. Storage */}
          <section id="storage" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">3</span>
              Local Storage & Cookies
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p className="mb-4">
                We use browser technologies like <strong>LocalStorage</strong> and <strong>Session Cookies</strong> to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Persist your shopping cart items.</li>
                <li>Keep you logged in during your demo session.</li>
                <li>Save user preferences (like theme or view mode).</li>
              </ul>
              <p className="mt-4 text-sm">This data lives in your browser and can be cleared via settings at any time.</p>
            </div>
          </section>

          {/* 4. Analytics */}
          <section id="analytics" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">4</span>
              Analytics & Tracking
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p>
                The portfolio version of VKart does <strong>not</strong> use third-party tracking pixels, Google Analytics, or advertising cookies. Your browsing activity on this demo is private to your session.
              </p>
            </div>
          </section>

          {/* 5. Third Party */}
          <section id="thirdparty" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">5</span>
              Third-Party Services
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <p>
                This demo may fetch product data from public APIs or use services like <strong>Razorpay (Test Mode)</strong> or <strong>Google OAuth</strong>. Interactions with these services are subject to their respective privacy policies.
              </p>
            </div>
          </section>

          {/* 6. Rights */}
          <section id="rights" className="scroll-mt-28">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">6</span>
              Your Choices
            </h2>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm leading-relaxed text-gray-600">
              <ul className="list-disc pl-5 space-y-2">
                <li>You can clear your browser cache to remove all local data from this site.</li>
                <li>You can delete your demo account via the Profile settings (simulated).</li>
                <li>Since this is a demo, data may be periodically wiped from the database without notice.</li>
              </ul>
            </div>
          </section>

          {/* 7. Contact */}
          <section id="contact" className="scroll-mt-28 mb-20">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm">7</span>
              Contact Information
            </h2>
            <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
              <p className="mb-6 text-gray-300">
                If you have technical questions about how this project handles data or authentication, feel free to reach out.
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