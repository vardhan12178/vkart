import { ShoppingCartIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#0b0f14] text-gray-400">
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500/70" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50/5 via-white/5 to-orange-50/5 ring-1 ring-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold">Get updates from VKart</h3>
              <p className="mt-1 text-sm text-gray-400">New drops, stories, and exclusive offers. No spam.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed — welcome to VKart!");
              }}
              className="flex w-full max-w-md items-center gap-2"
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 active:scale-[0.98] transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white">
                <ShoppingCartIcon className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">VKart</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Curated essentials across categories with a smooth, transparent shopping experience.
            </p>
            <div className="mt-4 flex items-center gap-3" aria-label="Social links">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 hover:text-white hover:bg-white/5 transition"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 hover:text-white hover:bg-white/5 transition"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 hover:text-white hover:bg-white/5 transition"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-orange-400">All Products</Link></li>
              <li><Link to="/blog" className="hover:text-orange-400">Stories & Guides</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-orange-400">About</Link></li>
              <li><Link to="/careers" className="hover:text-orange-400">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
              <li><Link to="/blog" className="hover:text-orange-400">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-orange-400">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400">Privacy Policy</Link></li>
              <li><Link to="/license" className="hover:text-orange-400">License</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-4 text-xs text-gray-500 sm:grid-cols-2">
          <p>© {new Date().getFullYear()} VKart. All rights reserved.</p>
          <p className="sm:text-right">Built for portfolio demonstration — no real payments processed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
