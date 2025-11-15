import React, { useMemo, useState } from "react";
import { 
  FaPaperPlane, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaClock 
} from "react-icons/fa";

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
      setToast({ show: true, ok: true, text: "Message sent successfully." });
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

      {/* Header */}
      <section className="container mx-auto px-6 lg:px-10 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Contact <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">VKart</span>
        </h1>
        <p className="mt-3 text-gray-700">
          Support, product questions, or business inquiries — we’re here to help.
        </p>
      </section>

      {/* Main section */}
      <section className="container mx-auto px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT – Form */}
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200 via-amber-200 to-white shadow-xl">
            <div className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-gray-200 p-6 sm:p-8">

              {toast.show && (
                <div
                  className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
                    toast.ok
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-red-50 text-red-800 ring-red-200"
                  }`}
                >
                  {toast.text}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <input type="text" name="honey" value={form.honey} onChange={handleChange} className="hidden" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`mt-1 w-full rounded-xl bg-white/70 border px-4 py-3 outline-none ${
                        errors.name ? "border-red-300" : "border-gray-300 focus:ring-2 focus:ring-orange-200"
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`mt-1 w-full rounded-xl bg-white/70 border px-4 py-3 outline-none ${
                        errors.email ? "border-red-300" : "border-gray-300 focus:ring-2 focus:ring-orange-200"
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-900">Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Choose a topic…"
                    className="mt-1 w-full rounded-xl bg-white/70 border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200"
                  />

                  {/* Quick Subject Suggestions */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Order Issue", "Product Info", "Business Inquiry", "Feedback"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, subject: tag }))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                          form.subject === tag
                            ? "bg-orange-600 text-white ring-orange-600"
                            : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-900">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className={`mt-1 h-40 w-full rounded-xl bg-white/70 border px-4 py-3 outline-none resize-y ${
                      errors.message ? "border-red-300" : "border-gray-300 focus:ring-2 focus:ring-orange-200"
                    }`}
                    placeholder="How can we assist you?"
                  />
                  <div className="flex justify-between mt-1 text-xs">
                    <span className={`${errors.message ? "text-red-600" : "text-gray-500"}`}>
                      {errors.message || "We usually reply within 24 hours."}
                    </span>
                    <span className={left < 40 ? "text-orange-600" : "text-gray-400"}>
                      {left} / {MAX_MESSAGE}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg hover:opacity-95 active:scale-[0.99] disabled:opacity-75"
                >
                  <FaPaperPlane />
                  {busy ? "Sending…" : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT – Contact Info + Extras */}
          <aside className="space-y-8">
            {/* Premium card */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-200 via-amber-200 to-white shadow-xl">
              <div className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-gray-200 p-6">
                <h3 className="text-xl font-extrabold text-gray-900">Support Channels</h3>
                <p className="mt-1 text-gray-700">Reach us through any of the options below.</p>

                <ul className="mt-5 space-y-4">
                  <li className="flex gap-3">
                    <span className="h-10 w-10 grid place-items-center rounded-xl bg-orange-100 text-orange-700">
                      <FaEnvelope />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">Support email</p>
                      <p className="text-gray-700">We reply within 24 hours</p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="h-10 w-10 grid place-items-center rounded-xl bg-orange-100 text-orange-700">
                      <FaClock />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">Response hours</p>
                      <p className="text-gray-700">Mon–Sat, 9:00 – 18:00 IST</p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="h-10 w-10 grid place-items-center rounded-xl bg-orange-100 text-orange-700">
                      <FaMapMarkerAlt />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">Office</p>
                      <p className="text-gray-700">Operating remotely across India</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* FAQ Mini block */}
            <div className="rounded-3xl bg-white/70 backdrop-blur shadow-xl ring-1 ring-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900">Quick FAQs</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li>• Order confirmation emails may take up to 5 minutes.</li>
                <li>• Returns/Refunds are processed within 5–7 business days.</li>
                <li>• Product support is available for all VKart purchases.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-6 mb-16 bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl py-10 px-6 text-center shadow-xl ring-1 ring-orange-400 sm:max-w-4xl sm:mx-auto">
        <h3 className="text-2xl font-extrabold text-white">Prefer talking to a human?</h3>
        <p className="mt-2 text-white/90">Our support team is friendly, fast, and ready to help.</p>

        <div className="mt-6 flex justify-center gap-4">
          <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:opacity-95">
            Email Support
          </button>
          <button className="rounded-xl ring-1 ring-white/80 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
            Help Center
          </button>
        </div>
      </section>
    </main>
  );
}
