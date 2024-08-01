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
    <div className="bg-gradient-to-br from-purple-200 to-indigo-400 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 sm:p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 text-center">Welcome Back</h1>
        <p className="text-gray-600 text-center mb-6 text-base sm:text-lg">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-gray-700 font-semibold mb-2 text-sm">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
              placeholder="Enter your User ID"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-600" /> : <EyeIcon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
          <p className="text-center text-sm">
            Don’t have an account? <button onClick={() => navigate('/register')} className="text-indigo-600 hover:underline font-medium">Register</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
