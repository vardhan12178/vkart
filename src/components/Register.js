import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from './axiosInstance'; 
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';
import '../styles.css';

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
      confirmPassword
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
    <div className="bg-gradient-to-br from-green-200 to-green-400 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-6 sm:p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 text-center">Create an Account</h1>
        <p className="text-gray-600 text-center mb-6 text-base sm:text-lg">Join us and start exploring!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2 text-sm">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="userId" className="block text-gray-700 font-semibold mb-2 text-sm">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
              placeholder="Enter your User ID"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-sm">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition duration-300 placeholder-gray-400 ${passwordMatch ? 'border-green-600' : 'border-red-600'}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              >
                {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
          >
            Register
          </button>
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:underline">
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
