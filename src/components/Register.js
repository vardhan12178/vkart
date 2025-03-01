import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from './axiosInstance';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

const Register = () => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !userId || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!passwordMatch) {
      setError('Passwords do not match.');
      return;
    }

    const userData = {
      name,
      username: userId,
      email,
      password,
      confirmPassword,
    };

    try {
      const response = await axios.post('https://vkart-t64z.onrender.com/api/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess(response.data.message);
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);

      setName('');
      setUserId('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Registration API Error:', error);
      setError('Registration failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-8 transform transition-transform duration-300 hover:scale-105">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Create an Account</h1>
          <p className="text-gray-700 text-lg sm:text-xl">Join us and start exploring!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2 text-lg">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="userId" className="block text-gray-700 font-semibold mb-2 text-lg">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500"
              placeholder="Enter your User ID"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-lg">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500"
              placeholder="Enter your email address"
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
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-6 w-6 text-gray-600 hover:text-green-600 transition duration-300" />
                ) : (
                  <EyeIcon className="h-6 w-6 text-gray-600 hover:text-green-600 transition duration-300" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-lg">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 shadow-sm transition duration-300 text-gray-800 placeholder-gray-500 ${
                  passwordMatch ? 'focus:border-green-600 focus:ring-green-200' : 'focus:border-red-600 focus:ring-red-200'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 px-4 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-6 w-6 text-gray-600 hover:text-green-600 transition duration-300" />
                ) : (
                  <EyeIcon className="h-6 w-6 text-gray-600 hover:text-green-600 transition duration-300" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gradient-to-l hover:from-green-600 hover:to-green-500 transition duration-300 text-lg"
          >
            Register
          </button>
          <div className="text-center">
            <p className="text-gray-700 text-lg">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold underline transition duration-300">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;