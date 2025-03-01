import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-100 to-orange-200 py-8 shadow-md shadow-orange-200/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* About Section */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-poppins">About Vkart</h3>
            <p className="text-gray-700 text-sm font-poppins">
              Vkart is your one-stop shop for the latest trends in electronics, fashion, and more. We offer quality products at unbeatable prices.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products" className="text-gray-700 hover:text-orange-500 transition duration-300 text-sm font-poppins">
                  All Products
                </a>
              </li>
              <li>
                <a href="/products/electronics" className="text-gray-700 hover:text-orange-500 transition duration-300 text-sm font-poppins">
                  Electronics
                </a>
              </li>
              <li>
                <a href="/products/men" className="text-gray-700 hover:text-orange-500 transition duration-300 text-sm font-poppins">
                  Men's Clothing
                </a>
              </li>
              <li>
                <a href="/products/women" className="text-gray-700 hover:text-orange-500 transition duration-300 text-sm font-poppins">
                  Women's Clothing
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500 transition duration-300"
              >
                <FaGithub className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500 transition duration-300"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500 transition duration-300"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6"></div>

        {/* Copyright Section */}
        <div className="text-center text-gray-700 text-sm font-poppins">
          <p>
            &copy; {new Date().getFullYear()} Vkart | Developed by Bala Vardhan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;