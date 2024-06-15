import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCartIcon, LogoutIcon, MenuIcon, XIcon } from '@heroicons/react/outline'; // Assuming these are the correct icons needed
import Cookies from 'js-cookie';

const Header = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-white text-xl font-bold">
          <ShoppingCartIcon className="w-8 h-8 mr-2" /> 
          Vkart
        </Link>
        {/* Hamburger Menu Icon for Mobile */}
        <div className="block lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-8 h-8" />
            ) : (
              <MenuIcon className="w-8 h-8" />
            )}
          </button>
        </div>
        {/* Desktop Menu */}
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
            <li>
              <button onClick={handleLogout} className="text-white hover:underline flex items-center">
                <LogoutIcon className="w-6 h-6 mr-1" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-0 left-0 right-0 bg-blue-500 py-4 px-8">
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
              <li>
                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="text-white hover:underline flex items-center">
                  <LogoutIcon className="w-6 h-6 mr-1" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
