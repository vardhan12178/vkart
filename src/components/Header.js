import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCartIcon, MenuIcon, XIcon } from '@heroicons/react/outline';

const Header = () => {
  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-blue-500 p-4 relative z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-white text-xl font-bold">
          <ShoppingCartIcon className="w-8 h-8 mr-2" />
          Vkart
        </Link>
    
        <div className="block lg:hidden relative">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none relative"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-8 h-8" />
            ) : (
              <MenuIcon className="w-8 h-8" />
            )}
            {!isMobileMenuOpen && cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
  
        <nav className="hidden lg:flex">
          <ul className="flex justify-end items-center space-x-4">
            <li>
              <Link to="/" className="text-white hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/about" className="text-white hover:underline">About</Link>
            </li>
            <li>
              <Link to="/contact" className="text-white hover:underline">Contact</Link>
            </li>
            <li>
              <Link to="/products" className="text-white hover:underline">Products</Link>
            </li>
            <li>
              <Link to="/cart" className="text-white flex items-center hover:underline">
                <ShoppingCartIcon className="w-6 h-6 mr-1" />
                Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartCount}</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
  
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-blue-700 py-4 px-8 absolute top-full left-0 right-0">
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <Link to="/" onClick={closeMobileMenu} className="text-white hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMobileMenu} className="text-white hover:underline">About</Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMobileMenu} className="text-white hover:underline">Contact</Link>
            </li>
            <li>
              <Link to="/products" onClick={closeMobileMenu} className="text-white hover:underline">Products</Link>
            </li>
            <li>
              <Link to="/cart" onClick={closeMobileMenu} className="text-white hover:underline flex items-center">
                <ShoppingCartIcon className="w-6 h-6 mr-1" />
                Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartCount}</span>}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
