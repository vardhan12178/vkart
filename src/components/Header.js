import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, LogoutIcon } from '@heroicons/react/outline'; // Import icons from Heroicons
import Cookies from 'js-cookie'; // Import Cookies for token management

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Remove JWT token
    Cookies.remove('jwt_token');
    // Navigate to login page
    navigate('/login');
  };

  // Hide header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Vkart</Link> {/* Changed title to Vkart */}
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
                Cart
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-white hover:underline flex items-center"
              >
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
