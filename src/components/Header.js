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
    <header className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-white text-xl font-bold">
          <ShoppingCartIcon className="w-8 h-8 mr-2" />
          Vkart
        </Link>
        <button className="text-white md:hidden" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <XIcon className="w-8 h-8" /> : <MenuIcon className="w-8 h-8" />}
        </button>
        <nav className={`md:flex items-center ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <ul className="md:flex md:space-x-6 space-y-2 md:space-y-0">
            <li>
              <Link to="/products" className="text-white hover:underline">
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-white hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-white hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-white flex items-center">
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
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-500 p-4 absolute top-0 left-0 right-0">
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-white hover:underline" onClick={closeMobileMenu}>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white hover:underline" onClick={closeMobileMenu}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white hover:underline" onClick={closeMobileMenu}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-white flex items-center" onClick={closeMobileMenu}>
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
