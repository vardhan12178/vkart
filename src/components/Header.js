// Header.js
import Cookies from 'js-cookie';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide header on login page
  if (location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <header className="bg-blue-500 p-4">
      <nav>
        <ul className="flex justify-end">
          <li className="mr-6">
            <Link to="/" className="text-white hover:underline">Home</Link>
          </li>
          <li className="mr-6">
            <Link to="/about" className="text-white hover:underline">About</Link>
          </li>
          <li className="mr-6">
            <Link to="/contact" className="text-white hover:underline">Contact</Link>
          </li>
          <li>
            <button className="text-white hover:underline" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
