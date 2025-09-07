import React, { useMemo, useState } from "react";
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";

const MAX_MESSAGE = 800;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honey: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ show: false, ok: true, text: "" });

  const left = useMemo(() => Math.max(0, MAX_MESSAGE - form.message.length), [form.message]);

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
      await new Promise((res) => setTimeout(res, 1200));
      setToast({ show: true, ok: true, text: "Message sent! We'll reply soon." });
      setForm({ name: "", email: "", subject: "", message: "", honey: "" });
    } catch {
      setToast({ show: true, ok: false, text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    }
  };

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div aria-hidden className="pointer-events-none absolute -top-28 -left-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <section className="container mx-auto px-6 lg:px-10 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Contact <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">VKart</span>
        </h1>
        <p className="mt-3 text-gray-700">We’re here to help—questions, feedback, or partnership ideas.</p>
      </section>

      <section className="container mx-auto px-6 lg:px-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200 via-amber-200 to-white shadow-2xl">
            <div className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-gray-200 p-6 sm:p-8">
              {toast.show && (
                <div
                  className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
                    toast.ok
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-red-50 text-red-800 ring-red-200"
                  }`}
                  role="status"
                >
                  {toast.text}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <input type="text" name="honey" value={form.honey} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900">Name</label>
                    <div className="mt-1 relative">
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={`w-full rounded-xl bg-white/70 border px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                          errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-orange-200"
                        }`}
                        aria-invalid={!!errors.name}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900">Email</label>
                    <div className="mt-1 relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl bg-white/70 border px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                          errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-orange-200"
                        }`}
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-900">Subject <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What’s this about?"
                    className="mt-1 w-full rounded-xl bg-white/70 border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-orange-200"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Order issue", "Product query", "Partnership", "Feedback"].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, subject: t }))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                          form.subject === t ? "bg-orange-600 text-white ring-orange-600" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={`mt-1 h-40 w-full resize-y rounded-xl bg-white/70 border px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                      errors.message ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-orange-200"
                    }`}
                    aria-invalid={!!errors.message}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    {errors.message ? (
                      <p className="text-xs text-red-600">{errors.message}</p>
                    ) : (
                      <span className="text-xs text-gray-500">We typically reply within 24h.</span>
                    )}
                    <span className={`text-xs ${left < 40 ? "text-orange-600" : "text-gray-400"}`}>{left} / {MAX_MESSAGE}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-xl hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                  aria-busy={busy}
                >
                  <FaPaperPlane />
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">By contacting us, you agree to our friendly reply emails. No spam.</p>
              </form>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200 via-amber-200 to-white shadow-2xl">
              <div className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-gray-200 p-6">
                <h3 className="text-xl font-extrabold text-gray-900">Get in touch</h3>
                <p className="mt-1 text-gray-700">Reach us through any of the channels below.</p>
                <ul className="mt-5 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700"><FaMapMarkerAlt /></span>
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-700">123 VKart Street, E-Commerce City, India</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700"><FaPhone /></span>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <a href="tel:+911234567890" className="text-gray-700 hover:text-gray-900">+91 123 456 7890</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700"><FaEnvelope /></span>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a href="mailto:support@vkart.com" className="text-gray-700 hover:text-gray-900">support@vkart.com</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700"><FaClock /></span>
                    <div>
                      <p className="font-semibold text-gray-900">Office hours</p>
                      <p className="text-gray-700">Mon–Sat, 9:00 – 18:00 IST</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <div className="h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-gray-500 text-sm">
                Map preview
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* <section className="relative mx-4 mb-16 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-center shadow-2xl ring-1 ring-orange-300 sm:mx-auto sm:max-w-4xl">
        <h3 className="text-2xl font-extrabold text-white">Prefer talking to a human?</h3>
        <p className="mt-2 text-white/90">Our friendly team is ready to help with orders, returns, and product advice.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="tel:+911234567890" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:opacity-95">Call Us</a>
          <a href="mailto:support@vkart.com" className="rounded-xl ring-1 ring-white/80 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Email Support</a>
        </div>
      </section> */}
    </main>
  );
}
