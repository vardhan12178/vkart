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
    try {
      Cookies.remove('jwt_token');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      alert('Failed to log out. Please try again.');
    }
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
    <header className="bg-white bg-gradient-to-r from-white to-orange-50 shadow-sm fixed top-0 left-0 right-0 z-50 border-b-2 border-gradient-to-r from-orange-100 to-orange-300 sticky">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center text-gray-900 text-xl font-semibold font-poppins">
            <ShoppingCartIcon className="w-8 h-8 mr-2 text-orange-500" />
            Vkart
          </Link>
          <button
            className="text-gray-900 md:hidden relative"
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
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
            <ul className="flex space-x-8">
              <li>
                <Link to="/products" className="text-gray-700 hover:text-orange-500 transition duration-300">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products/electronics" className="text-gray-700 hover:text-orange-500 transition duration-300">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products/men" className="text-gray-700 hover:text-orange-500 transition duration-300">
                  Men's Clothing
                </Link>
              </li>
              <li>
                <Link to="/products/women" className="text-gray-700 hover:text-orange-500 transition duration-300">
                  Women's Clothing
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-700 hover:text-orange-500 transition duration-300">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-700 flex items-center hover:text-orange-500 transition duration-300 transform hover:scale-105">
                  <ShoppingCartIcon className="w-6 h-6 mr-1" />
                  Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartCount}</span>}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-gray-700 hover:text-orange-500 transition duration-300 flex items-center">
                  <LogoutIcon className="w-6 h-6 mr-1" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className={`md:hidden bg-white shadow-lg absolute top-16 right-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-in-out`}>
          <ul className="space-y-4 p-4">
            <li>
              <Link to="/products" className="text-gray-700 hover:text-orange-500 transition duration-300" onClick={closeMobileMenu}>
                All Products
              </Link>
            </li>
            <li>
              <Link to="/products/electronics" className="text-gray-700 hover:text-orange-500 transition duration-300" onClick={closeMobileMenu}>
                Electronics
              </Link>
            </li>
            <li>
              <Link to="/products/men" className="text-gray-700 hover:text-orange-500 transition duration-300" onClick={closeMobileMenu}>
                Men's Clothing
              </Link>
            </li>
            <li>
              <Link to="/products/women" className="text-gray-700 hover:text-orange-500 transition duration-300" onClick={closeMobileMenu}>
                Women's Clothing
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-gray-700 hover:text-orange-500 transition duration-300" onClick={closeMobileMenu}>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-gray-700 flex items-center hover:text-orange-500 transition duration-300" onClick={closeMobileMenu}>
                <ShoppingCartIcon className="w-6 h-6 mr-1" />
                Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">{cartCount}</span>}
              </Link>
            </li>
            <li>
              <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="text-gray-700 hover:text-orange-500 transition duration-300 flex items-center">
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