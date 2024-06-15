// Header.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCartIcon, LogoutIcon, ShoppingBagIcon } from '@heroicons/react/outline'; // Assuming ShoppingBagIcon is relevant
import Cookies from 'js-cookie';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-white text-xl font-bold">
          <ShoppingBagIcon className="w-8 h-8 mr-2" /> {/* Replace with appropriate icon */}
          Vkart
        </Link>
        <nav>
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
      </div>
    </header>
  );
};

export default Header;
