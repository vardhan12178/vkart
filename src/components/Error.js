import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <ExclamationCircleIcon className="w-20 h-20 text-orange-500" />
      <h1 className="mt-6 text-4xl font-bold text-orange-500">404 Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">The page you are looking for does not exist.</p>
      <p className="mt-2 text-gray-500">It might have been removed, renamed, or did not exist in the first place.</p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg text-lg font-semibold hover:bg-orange-700 transition duration-300"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default Error;
