import React, { useState, useEffect } from 'react';
import axios from './axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import '../styles.css'; 

const Register = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true); 
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('/api/register', {
        username: userId,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      });

      setSuccess(response.data.message); 
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Registration API Error:', error);
      setError('Registration failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gradient-to-br from-green-200 to-green-400 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-8 space-y-6 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">Create an Account</h1>
        <p className="text-gray-600 text-center mb-6 text-lg">Join us and start exploring!</p>
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 shadow-sm transition duration-300 text-gray-700 placeholder-gray-400"
              placeholder="Enter your User ID"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-sm">
              Email
            </label>
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
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">
              Password
            </label>
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
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none shadow-sm transition duration-300 text-gray-700 placeholder-gray-400 ${passwordMatch ? 'focus:border-green-600' : 'border-red-500 focus:border-red-500'}`}
                placeholder="Re-enter your password"
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
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Register
          </button>
          <p className="text-center">
            Already have an account? <button onClick={() => navigate('/login')} className="text-green-600 hover:underline">Login</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
