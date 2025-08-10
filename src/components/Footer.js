// src/components/Footer.jsx
import { ShoppingCartIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* hairline gradient */}
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500/70" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <ShoppingCartIcon className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-extrabold tracking-tight text-white">VKart</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Your one-stop shop for curated electronics, fashion, and more — quality products at
              honest prices.
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

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-orange-400">All Products</Link></li>
              <li><Link to="/products?category=smartphones" className="hover:text-orange-400">Electronics</Link></li>
              <li><Link to="/products?category=mens-shirts" className="hover:text-orange-400">Men’s Clothing</Link></li>
              <li><Link to="/products?category=womens-dresses" className="hover:text-orange-400">Women’s Clothing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-orange-400">About</Link></li>
              <li><Link to="/blog" className="hover:text-orange-400">Blog</Link></li>
              <li><Link to="/careers" className="hover:text-orange-400">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-orange-400">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400">Privacy Policy</Link></li>
              <li><Link to="/license" className="hover:text-orange-400">License</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm md:flex-row">
          <p>© {new Date().getFullYear()} VKart. All rights reserved.</p>
          <p className="text-xs text-gray-500">
            Built for portfolio demonstration — no real payments processed.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
