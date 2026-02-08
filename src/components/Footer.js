import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter, FaArrowRight, FaEnvelope } from "react-icons/fa";
import axios from "./axiosInstance";

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [nlEmail, setNlEmail] = useState("");
  const [nlBusy, setNlBusy] = useState(false);

  return (
    <footer className="bg-[#050505] text-gray-400 border-t border-white/5 font-sans relative overflow-hidden" role="contentinfo" aria-label="Site footer">
      
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">

        {/* --- NEWSLETTER SECTION --- */}
        <div className="mb-16 rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 relative overflow-hidden">
          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
          
          {subscribed ? (
            <div className="relative flex flex-col items-center text-center animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                <FaArrowRight className="-rotate-45" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
              <p className="text-gray-400 max-w-md">
                Thank you for subscribing. Keep an eye on your inbox for the latest VKart drops.
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left max-w-xl">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                  Join the Inner Circle
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  Get exclusive access to new collections, priority support, and special offers directly to your inbox. No spam, ever.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (nlBusy) return;
                  setNlBusy(true);
                  try {
                    await axios.post("/api/newsletter/subscribe", { email: nlEmail });
                    setSubscribed(true);
                  } catch { setSubscribed(true); }
                  setNlBusy(false);
                }}
                className="w-full max-w-md relative"
                aria-label="Newsletter subscription"
              >
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" aria-hidden="true" />
                  <input
                    type="email"
                    required
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-36 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-white text-black hover:bg-gray-200 font-bold rounded-xl px-6 text-sm transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* --- LINKS GRID --- */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 border-b border-white/10 pb-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center gap-3 group"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black transition-transform group-hover:scale-95">
                <ShoppingCartIcon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">VKart</span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              A premium e-commerce experience built for the modern web. Quality products, seamless shopping.
            </p>

            <div className="flex items-center gap-4">
              {[
                { icon: FaGithub, href: "https://github.com" },
                { icon: FaLinkedin, href: "https://linkedin.com" },
                { icon: FaTwitter, href: "https://twitter.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold mb-6">Shop</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/products" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">All Products</Link></li>
              <li><Link to="/blog" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Stories & Guides</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Customer Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/about" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Contact</Link></li>
              <li><Link to="/blog" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Latest News</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/terms" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/license" onClick={scrollToTop} className="hover:text-orange-500 transition-colors">Licenses</Link></li>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600 font-medium">
          <p>© {new Date().getFullYear()} VKart Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Sitemap</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;