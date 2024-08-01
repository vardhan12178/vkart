import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <ExclamationCircleIcon className="w-20 h-20 text-red-600" />
      <h1 className="mt-6 text-5xl font-bold text-red-600">404 Page Not Found</h1>
      <p className="mt-4 text-xl text-gray-700">The page you are looking for does not exist.</p>
      <p className="mt-2 text-gray-500">It might have been removed, renamed, or did not exist in the first place.</p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700 transition duration-300"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default Error;
