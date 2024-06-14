import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Welcome to Vkart</h1>
          <p className="text-lg">Discover the latest trends and shop with confidence!</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-md">
            <Link to="/products">Shop Now</Link>
          </button>
        </div>

        {/* Carousel Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Special Offers</h2>
          <div className="flex flex-wrap gap-4 md:-mx-2">
            {/* Sample carousel items (replace with actual carousel component) */}
            <div className="w-full md:w-1/3 px-2">
              <img src="https://via.placeholder.com/800x400" alt="Offer 1" className="w-full h-auto rounded-lg shadow-md mb-2" />
              <p className="text-sm text-gray-600">Exclusive Discounts - Limited Time Only!</p>
            </div>
            <div className="w-full md:w-1/3 px-2">
              <img src="https://via.placeholder.com/800x400" alt="Offer 2" className="w-full h-auto rounded-lg shadow-md mb-2" />
              <p className="text-sm text-gray-600">New Arrivals - Shop Now!</p>
            </div>
            <div className="w-full md:w-1/3 px-2">
              <img src="https://via.placeholder.com/800x400" alt="Offer 3" className="w-full h-auto rounded-lg shadow-md mb-2" />
              <p className="text-sm text-gray-600">Free Shipping on Orders Over $50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
