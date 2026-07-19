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

  const handleSubscribe = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await axios.post("/api/newsletter/subscribe", { email });
    } catch {
      // The signup is intentionally optimistic so a temporary network issue
      // does not interrupt the footer experience.
    }
    setSubscribed(true);
    setBusy(false);
  };

  return (
    <footer className="relative overflow-hidden bg-[#171612] text-white" role="contentinfo" aria-label="Site footer">
      <div className="absolute right-[-10rem] top-[-15rem] h-[34rem] w-[34rem] rounded-full border border-white/[0.06]" />
      <div className="absolute right-[-3rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full border border-white/[0.05]" />

      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-7 sm:py-16">
        <div className="grid gap-10 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16 lg:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d18a5e]">The VKart letter</p>
            <h2 className="mt-5 max-w-xl font-editorial text-4xl leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl">
              Good things, occasionally delivered.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/55">
              Thoughtful new arrivals, useful buying guides, and first access to private offers. No inbox clutter.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#d18a5e] text-[#171612]">
                <Check size={19} />
              </span>
              <div>
                <p className="text-sm font-bold">You’re on the list.</p>
                <p className="mt-1 text-xs text-white/45">Watch your inbox for the next VKart edit.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="rounded-[1.25rem] border border-white/10 bg-[#11100d] p-2 sm:flex sm:items-center" aria-label="Newsletter subscription">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div className="relative min-w-0 flex-1">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  className="w-full border-0 bg-transparent py-4 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-[.9rem] bg-[#d18a5e] px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#171612] transition-colors hover:bg-[#e0a37d] disabled:opacity-50 sm:w-auto"
              >
                {busy ? "Joining…" : "Join the list"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(3,1fr)] lg:py-16">
          <div>
            <Link to="/" onClick={scrollToTop} className="inline-flex items-center gap-3" aria-label="VKart home">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#171612]">
                <ShoppingBag size={18} />
              </span>
              <span className="text-xl font-extrabold tracking-[-0.05em]">VKart</span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-6 text-white/35">
              A considered destination for technology, style, and the everyday things worth keeping.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{group.title}</h3>
              <ul className="mt-6 space-y-4">
                {group.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} onClick={scrollToTop} className="text-sm text-white/70 transition-colors hover:text-[#d18a5e]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-7 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VKart. All rights reserved.</p>
          <p>Curated with care in India.</p>
        </div>
      </div>
    </footer>
  );
}
