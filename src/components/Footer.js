import { ShoppingCartIcon } from '@heroicons/react/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo + About */}
          <div>
            <div className="flex items-center mb-4">
               <Link to="/" className="flex items-center text-gray-900 text-xl font-semibold font-poppins">
            <ShoppingCartIcon className="w-8 h-8 mr-2 text-orange-500" />
            <span  className='text-orange-500'>Vkart</span>
          </Link>
            </div>
            <p className="text-sm">
              Vkart is your one-stop shop for the latest trends in electronics, fashion, and more.
              We offer quality products at unbeatable prices.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-orange-500">All Products</a></li>
              <li><a href="/products/electronics" className="hover:text-orange-500">Electronics</a></li>
              <li><a href="/products/men" className="hover:text-orange-500">Men's Clothing</a></li>
              <li><a href="/products/women" className="hover:text-orange-500">Women's Clothing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-orange-500">About</a></li>
              <li><a href="/blog" className="hover:text-orange-500">Blog</a></li>
              <li><a href="/careers" className="hover:text-orange-500">Careers</a></li>
              <li><a href="/contact" className="hover:text-orange-500">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/terms" className="hover:text-orange-500">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-orange-500">Privacy Policy</a></li>
              <li><a href="/license" className="hover:text-orange-500">License</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 text-sm text-center">
          &copy; {new Date().getFullYear()} Vkart | Developed by Bala Vardhan. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
