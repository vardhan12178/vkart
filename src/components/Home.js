import React from 'react';

const Home = () => {
  return (
    <div className="bg-gray-100 p-4">
      {/* Header Section */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to Our Ecommerce Store</h1>
        <p className="text-lg">Discover the latest trends and shop with confidence!</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-md">
          Shop Now
        </button>
      </div>

      {/* Carousel Section */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Special Offers</h2>
        <div className="overflow-hidden">
          <div className="flex -mx-2">
            {/* Sample carousel items (replace with actual carousel component) */}
            <div className="w-full px-2">
              <img src="https://via.placeholder.com/800x300" alt="Carousel Item 1" className="w-full h-auto rounded-lg shadow-md mb-2" />
              <p className="text-sm text-gray-600">Exclusive Discounts - Limited Time Only!</p>
            </div>
            <div className="w-full px-2">
              <img src="https://via.placeholder.com/800x300" alt="Carousel Item 2" className="w-full h-auto rounded-lg shadow-md mb-2" />
              <p className="text-sm text-gray-600">New Arrivals - Shop Now!</p>
            </div>
            <div className="w-full px-2">
              <img src="https://via.placeholder.com/800x300" alt="Carousel Item 3" className="w-full h-auto rounded-lg shadow-md mb-2" />
              <p className="text-sm text-gray-600">Free Shipping on Orders Over $50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
