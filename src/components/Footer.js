import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Mail, ShoppingBag } from "lucide-react";
import axios from "./axiosInstance";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["All products", "/products"],
      ["New arrivals", "/products?sort=newest"],
      ["VKart Prime", "/prime"],
      ["Stories & guides", "/blog"],
    ],
  },
  {
    title: "About",
    links: [
      ["Our story", "/about"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Customer care",
    links: [
      ["Help & support", "/contact"],
      ["Track an order", "/orders"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await axios.post("/api/newsletter/subscribe", { email });
      setSubscribed(true);
    } catch {
      setError("Something went wrong — please try again.");
    }
    setBusy(false);
  };

  return (
    <footer className="relative overflow-hidden bg-[#171612] text-white" role="contentinfo" aria-label="Site footer">
      <div className="absolute right-[-10rem] top-[-15rem] h-[34rem] w-[34rem] rounded-full border border-white/[0.06]" />
      <div className="absolute right-[-3rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full border border-white/[0.05]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-7 sm:py-16">
        {/* Newsletter Box */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] lg:grid lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16 lg:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d18a5e]">The VKart Letter</p>
            <h2 className="mt-2 max-w-xl font-editorial text-xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-white">
              Good things, occasionally delivered.
            </h2>
            <p className="mt-1.5 max-w-lg text-xs sm:text-sm leading-relaxed text-white/55">
              Thoughtful new arrivals, useful buying guides, and first access to private offers. No inbox clutter.
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            {subscribed ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3.5 sm:p-5">
                <span className="grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full bg-[#d18a5e] text-[#171612]">
                  <Check size={16} />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold">You’re on the list.</p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-white/45">Watch your inbox for the next VKart selection.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="rounded-xl border border-white/10 bg-[#11100d] p-1.5 sm:flex sm:items-center" aria-label="Newsletter subscription">
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <div className="relative min-w-0 flex-1">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Your email address"
                    className="w-full border-0 bg-transparent py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white outline-none placeholder:text-white/35 focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-1.5 sm:mt-0 group inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-[#d18a5e] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#171612] transition-colors hover:bg-[#e0a37d] disabled:opacity-50"
                >
                  {busy ? "Joining…" : "Join the list"}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
            {error && !subscribed && (
              <p className="mt-2 text-xs font-semibold text-[#e0876a]">{error}</p>
            )}
          </div>
        </div>

        {/* Brand identity strip */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link to="/" onClick={scrollToTop} className="inline-flex items-center gap-2" aria-label="VKart home">
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white text-[#171612]">
              <ShoppingBag size={14} />
            </span>
            <span className="text-base sm:text-lg font-extrabold tracking-tight">VKart</span>
          </Link>
          <p className="text-xs text-white/40">
            A considered destination for technology, style, and everyday essentials.
          </p>
        </div>

        {/* Footer Navigation Columns — 3 balanced columns on mobile */}
        <div className="grid grid-cols-3 gap-3 sm:gap-8 py-6 sm:py-10">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d18a5e]/80 mb-3">{group.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {group.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} onClick={scrollToTop} className="text-[11px] sm:text-xs text-white/60 transition-colors hover:text-white block py-0.5">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 pt-4 text-[10px] text-white/30">
          <p>© {new Date().getFullYear()} VKart. All rights reserved.</p>
          <p>Curated with care in India.</p>
        </div>
      </div>
    </footer>
  );
}
