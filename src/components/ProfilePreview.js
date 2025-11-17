import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

export default function ProfilePreview() {
  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 sm:p-10 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-gray-200">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white shadow-md grid place-items-center ring-4 ring-white">
              <FaUser className="text-orange-500 text-4xl sm:text-5xl" />
            </div>

            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
              Your Profile
            </h1>

            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Login to access your account details, orders, and settings.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-10 bg-white">
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Sign in to view your full profile, manage your orders, update security, 
              browse previous activity, and access your personalized VKart dashboard.
            </p>

            <Link
             to="/login?redirect=/profile"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 text-white px-6 py-3 text-sm sm:text-base font-semibold shadow hover:bg-orange-600 transition"
            >
              <FaLock /> Sign In to Continue
            </Link>

            <div className="mt-4">
              <Link
                to="/register"
                className="text-orange-600 text-sm sm:text-base font-semibold hover:underline"
              >
                New user? Create an account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
