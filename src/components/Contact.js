import React, { useMemo, useState } from "react";
import {
  FaPaperPlane,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaUser,
  FaCommentAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaQuestionCircle
} from "react-icons/fa";

const MAX_MESSAGE = 800;

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honey: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ show: false, ok: true, text: "" });

  const left = useMemo(() => Math.max(0, MAX_MESSAGE - form.message.length), [form.message]);

  // --- LOGIC: Validation & Submit (Kept Exact) ---
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Please provide a valid email.";
    if (!form.message.trim()) e.message = "Please write a message.";
    if (form.message.length > MAX_MESSAGE) e.message = `Please keep your message within ${MAX_MESSAGE} characters.`;
    if (form.honey) e.honey = "Spam detected.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setBusy(true);
      await new Promise((res) => setTimeout(res, 1200)); // Simulating API
      setToast({ show: true, ok: true, text: "Message sent successfully." });
      setForm({ name: "", email: "", subject: "", message: "", honey: "" });
    } catch {
      setToast({ show: true, ok: false, text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    }
  };

  /* --- UI COMPONENTS --- */
  const InputField = ({ label, name, type = "text", icon: Icon, placeholder }) => (
    <div className="mb-5">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
          {Icon && <Icon />}
        </div>
        <input
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border-0 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-inner ring-1 ring-inset transition-all placeholder:text-gray-400 focus:ring-2 focus:bg-white ${errors[name] ? "ring-red-300 focus:ring-red-500" : "ring-gray-200 focus:ring-orange-500/50"
            }`}
        />
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{errors[name]}</p>}
    </div>
  );

  return (
    <main className="relative min-h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      <AnimStyles />

      {/* Ambient Background Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-orange-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border ${toast.ok ? "bg-emerald-50/90 border-emerald-100 text-emerald-800" : "bg-red-50/90 border-red-100 text-red-800"
            }`}>
            {toast.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span className="text-sm font-semibold">{toast.text}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
          <span className="text-orange-600 font-bold tracking-widest text-xs uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Contact Us
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Let's start a conversation.
          </h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Have questions about a product, or just want to say hello? We're ready to answer all your questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">

          {/* --- LEFT: Contact Form --- */}
          <div className="lg:col-span-7 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-white/60">

              <form onSubmit={handleSubmit} noValidate>
                {/* Honey Pot */}
                <input type="text" name="honey" value={form.honey} onChange={handleChange} className="hidden" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <InputField
                    label="Full Name" name="name"
                    icon={FaUser} placeholder="John Doe"
                  />
                  <InputField
                    label="Email Address" name="email" type="email"
                    icon={FaEnvelope} placeholder="john@example.com"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                    Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Order Issue", "Product Info", "Business", "Other"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, subject: tag }))}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${form.subject === tag
                            ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Message
                  </label>
                  <div className="relative group">
                    <div className="absolute top-4 left-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <FaCommentAlt />
                    </div>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className={`w-full h-40 rounded-2xl border-0 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 shadow-inner ring-1 ring-inset transition-all placeholder:text-gray-400 focus:ring-2 focus:bg-white resize-none ${errors.message ? "ring-red-300 focus:ring-red-500" : "ring-gray-200 focus:ring-orange-500/50"
                        }`}
                    />
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <span className={`text-[10px] font-bold ${left < 50 ? "text-orange-600" : "text-gray-400"}`}>
                      {left} / {MAX_MESSAGE}
                    </span>
                  </div>
                  {errors.message && <p className="text-xs text-red-500 font-medium ml-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {busy ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <FaPaperPlane size={14} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: Info & FAQ --- */}
          <div className="lg:col-span-5 space-y-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>

            {/* Info Card */}
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <h3 className="text-xl font-black mb-6 relative z-10">Contact Information</h3>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <FaEnvelope className="text-lg text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider opacity-80">Email</p>
                    <p className="font-semibold text-lg">support@vkart.com</p>
                    <p className="text-xs text-gray-500 mt-0.5">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <FaClock className="text-lg text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider opacity-80">Hours</p>
                    <p className="font-semibold text-lg">Mon - Sat, 9am - 6pm</p>
                    <p className="text-xs text-gray-500 mt-0.5">Support team available</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <FaMapMarkerAlt className="text-lg text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider opacity-80">Location</p>
                    <p className="font-semibold text-lg">Remote First</p>
                    <p className="text-xs text-gray-500 mt-0.5">Operating across India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini FAQ Card */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaQuestionCircle className="text-orange-500 text-xl" />
                <h3 className="text-lg font-bold text-gray-900">Quick Answers</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Returns are processed within 5-7 days.",
                  "Tracking IDs are emailed once shipped.",
                  "We offer a 1-year warranty on electronics."
                ].map((faq, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    {faq}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}