import React, { useState, useEffect } from 'react';
import axios from './axiosInstance';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-8 transform transition-transform duration-300 hover:scale-105">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Welcome Back</h1>
          <p className="text-gray-700 text-lg sm:text-xl">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-gray-700 font-semibold mb-2 text-lg">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-200 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500"
              placeholder="Enter your User ID"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-lg">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-200 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-4 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-6 w-6 text-gray-600 hover:text-orange-600 transition duration-300" />
                ) : (
                  <EyeIcon className="h-6 w-6 text-gray-600 hover:text-orange-600 transition duration-300" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 transition duration-300 text-lg"
          >
            Login
          </button>
          <p className="text-center text-lg">
            Don’t have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-orange-600 hover:text-orange-700 font-semibold underline transition duration-300"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;