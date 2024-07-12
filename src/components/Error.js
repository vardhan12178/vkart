import React from 'react'
import { Link } from 'react-router-dom'
import { ExclamationCircleIcon } from '@heroicons/react/outline'

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ExclamationCircleIcon className="w-16 h-16 text-red-600" />
      <h1 className="mt-4 text-4xl font-bold text-red-600">404 Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-700">The page you are looking for does not exist.</p>
      <p className="mt-2 text-gray-500">It might have been removed, renamed, or did not exist in the first place.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition duration-300">
        Go to Homepage
      </Link>
    </div>
  )
}

export default Error
