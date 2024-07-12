import React, { useState, useEffect } from 'react';
import axios from './axiosInstance';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import '../styles.css';

const Login = ({ setIsLoggedIn }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (token) {
      setIsLoggedIn(true);
      navigate('/');
    }
  }, [navigate, setIsLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      setError('Please enter both User ID and Password.');
      return;
    }

    try {
      const response = await axios.post('/api/login', {
        username: userId,
        password: password,
      });

      const jwtToken = response.data.token;
      Cookies.set('jwt_token', jwtToken, { expires: 30 });

      setIsLoggedIn(true);
      navigate('/');
    } catch (error) {
      console.error('Login API Error:', error);
      setError('Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start">
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex justify-center items-center md:pt-12">
          <img
            src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-login-img.png"
            className="w-full max-w-xs rounded-md"
            alt="website login"
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full md:w-1/2">
          <div className="mb-4">
            <label htmlFor="userId" className="block text-gray-700 font-bold mb-2">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-900"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-900"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
          >
            Login
          </button>
          <p className="mt-4">
            Don't have an account? <button onClick={() => navigate('/register')} className="text-gray-900 hover:underline">Register</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
