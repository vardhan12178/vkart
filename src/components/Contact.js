import React, { useMemo, useState } from "react";
import {
  FaPaperPlane,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

const MAX_MESSAGE = 800;

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honey: "", // spam honeypot
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ show: false, ok: true, text: "" });

  const left = useMemo(
    () => Math.max(0, MAX_MESSAGE - form.message.length),
    [form.message]
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Please provide a valid email.";
    if (!form.message.trim()) e.message = "Please write a message.";
    if (form.message.length > MAX_MESSAGE)
      e.message = `Please keep your message within ${MAX_MESSAGE} characters.`;
    // simple spam trap
    if (form.honey) e.honey = "Spam detected.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setBusy(true);
      // Simulate async send — replace with your API when ready
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
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -top-28 -left-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      {/* hero */}
      <section className="container mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Contact <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">VKart</span>
          </h1>
          <p className="mt-3 text-gray-700">
            We’re here to help—questions, feedback, or partnership ideas.
          </p>
        </div>
      </section>

      {/* content */}
      <section className="container mx-auto px-6 lg:px-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* form card */}
          <div className="rounded-2xl bg-white/70 p-6 sm:p-8 shadow-2xl ring-1 ring-gray-200 backdrop-blur">
            {/* toast */}
            {toast.show && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                  toast.ok
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200"
                }`}
                role="status"
              >
                {toast.text}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* hidden honeypot */}
              <input
                type="text"
                name="honey"
                value={form.honey}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                      errors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-orange-200"
                    }`}
                    placeholder="Your full name"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                      errors.email
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-orange-200"
                    }`}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-900">
                  Subject <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-orange-200"
                  placeholder="What’s this about?"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className={`mt-1 h-40 w-full resize-y rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                    errors.message
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-orange-200"
                  }`}
                  placeholder="How can we help?"
                  aria-invalid={!!errors.message}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.message ? (
                    <p className="text-xs text-red-600">{errors.message}</p>
                  ) : (
                    <span className="text-xs text-gray-500">We typically reply within 24h.</span>
                  )}
                  <span
                    className={`text-xs ${
                      left < 40 ? "text-orange-600" : "text-gray-400"
                    }`}
                  >
                    {left} / {MAX_MESSAGE}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 font-semibold text-white shadow hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-80"
                aria-busy={busy}
              >
                <FaPaperPlane />
                {busy ? "Sending…" : "Send Message"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                By contacting us, you agree to our friendly reply emails. No spam.
              </p>
            </form>
          </div>

          {/* info panel */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-white/70 p-6 shadow-2xl ring-1 ring-gray-200 backdrop-blur">
              <h3 className="text-xl font-extrabold text-gray-900">Get in touch</h3>
              <p className="mt-1 text-gray-700">
                Reach us through any of the channels below.
              </p>

              <ul className="mt-5 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-700">123 VKart Street, E-Commerce City, India</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                    <FaPhone />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-700">+91 123 456 7890</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                    <FaEnvelope />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-700">support@vkart.com</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                    <FaClock />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Office hours</p>
                    <p className="text-gray-700">Mon–Sat, 9:00 – 18:00 IST</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* map embed slot (optional, comment in if you have a map key) */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <div className="h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-gray-500 text-sm">
                {/* Replace with your map iframe when ready:
                <iframe
                  title="VKart Location"
                  width="100%"
                  height="100%"
                  src="https://www.google.com/maps/embed?..."
                  loading="lazy"
                  style={{ border: 0 }}
                /> */}
                Map preview
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Contact;
