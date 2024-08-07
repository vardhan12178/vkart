import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCartIcon, LogoutIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import Cookies from 'js-cookie';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-white text-xl font-bold">
          <ShoppingCartIcon className="w-8 h-8 mr-2" />
          Vkart
        </Link>
        <button
          className="text-white md:hidden relative"
          aria-label="Toggle mobile menu"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <XIcon className="w-8 h-8 transform rotate-0 transition-transform duration-300" />
          ) : (
            <>
              <MenuIcon className="w-8 h-8 transform rotate-0 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {cartCount}
                </span>
              )}
            </>
          )}
        </button>
        <nav className="hidden md:flex items-center">
          <ul className="flex space-x-6">
            <li>
              <Link to="/products" className="text-white hover:text-gray-200 transition duration-300">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/products/electronics" className="text-white hover:text-gray-200 transition duration-300">
                Electronics
              </Link>
            </li>
            <li>
              <Link to="/products/men" className="text-white hover:text-gray-200 transition duration-300">
                Men's Clothing
              </Link>
            </li>
            <li>
              <Link to="/products/women" className="text-white hover:text-gray-200 transition duration-300">
                Women's Clothing
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-white hover:text-gray-200 transition duration-300">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-white flex items-center">
                <ShoppingCartIcon className="w-6 h-6 mr-1" />
                Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartCount}</span>}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="text-white hover:text-gray-200 transition duration-300 flex items-center">
                <LogoutIcon className="w-6 h-6 mr-1" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-purple-700 to-indigo-700 p-4 absolute top-16 right-0 z-50 shadow-lg">
          <ul className="space-y-2">
            <li>
              <Link to="/products" className="text-white hover:text-gray-200 transition duration-300" onClick={closeMobileMenu}>
                All Products
              </Link>
            </li>
            <li>
              <Link to="/products/electronics" className="text-white hover:text-gray-200 transition duration-300" onClick={closeMobileMenu}>
                Electronics
              </Link>
            </li>
            <li>
              <Link to="/products/men" className="text-white hover:text-gray-200 transition duration-300" onClick={closeMobileMenu}>
                Men's Clothing
              </Link>
            </li>
            <li>
              <Link to="/products/women" className="text-white hover:text-gray-200 transition duration-300" onClick={closeMobileMenu}>
                Women's Clothing
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-white hover:text-gray-200 transition duration-300" onClick={closeMobileMenu}>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-white flex items-center" onClick={closeMobileMenu}>
                <ShoppingCartIcon className="w-6 h-6 mr-1" />
                Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartCount}</span>}
              </Link>
            </li>
            <li>
              <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="text-white hover:text-gray-200 transition duration-300 flex items-center">
                <LogoutIcon className="w-6 h-6 mr-1" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
