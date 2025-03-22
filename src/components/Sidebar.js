import React, { useState } from 'react';
import CustomDropdown from './CustomDropdown';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid';

const Sidebar = ({
  sortOption,
  handleSortChange,
  category,
  handleCategoryChange,
  priceRange,
  setPriceRange,
  toggleSortOrder,
  sortOrder,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State to toggle filter visibility on mobile

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    // Convert INR input to USD for filtering (divide by 75)
    const valueInUSD = Number(value) / 75;
    setPriceRange((prev) => ({
      ...prev,
      [name]: valueInUSD >= 0 ? valueInUSD : 0, // Ensure non-negative values
    }));
  };

  // Convert priceRange back to INR for display purposes
  const displayPriceRange = {
    min: Math.round(priceRange.min * 75),
    max: Math.round(priceRange.max * 75),
  };

  return (
    <div className="w-full lg:w-72 bg-white rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
      {/* Toggle Button for Mobile */}
      <div className="lg:hidden p-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg flex items-center justify-between hover:from-orange-600 hover:to-red-600 transition-all duration-200"
        >
          <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          {isFilterOpen ? (
            <ArrowUpIcon className="w-5 h-5" />
          ) : (
            <ArrowDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Filter Section - Hidden on mobile by default */}
      <div
        className={`p-4 lg:p-6 space-y-4 lg:space-y-6 ${
          isFilterOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <h2 className="text-2xl lg:text-3xl font-extrabold mb-4 lg:mb-6 text-gray-900">
          Filters & Sort
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2 tracking-wide">
            Sort By
          </label>
          <CustomDropdown
            options={[
              { value: '', label: 'None' },
              { value: 'price', label: 'Price' },
              { value: 'title', label: 'Name' },
              { value: 'rating', label: 'Rating' },
            ]}
            value={sortOption}
            onChange={handleSortChange}
            label="Sort by"
            className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:bg-gray-100 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2 tracking-wide">
            Category
          </label>
          <CustomDropdown
            options={[
              { value: '', label: 'All' },
              { value: 'electronics', label: 'Electronics' },
              { value: "men's clothing", label: "Men's Clothing" },
              { value: "women's clothing", label: "Women's Clothing" },
              { value: 'jewelery', label: 'Jewelry' },
            ]}
            value={category}
            onChange={handleCategoryChange}
            label="Category"
            className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:bg-gray-100 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2 tracking-wide">
            Price Range
          </label>
          <div className="flex items-center gap-2 lg:gap-4">
            <input
              type="number"
              name="min"
              value={displayPriceRange.min}
              onChange={handlePriceChange}
              className="w-1/2 p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:bg-gray-100 transition-all duration-200 placeholder-gray-400"
              placeholder="Min"
            />
            <span className="text-gray-400 font-semibold">—</span>
            <input
              type="number"
              name="max"
              value={displayPriceRange.max}
              onChange={handlePriceChange}
              className="w-1/2 p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:bg-gray-100 transition-all duration-200 placeholder-gray-400"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2 tracking-wide">
            Sort Order
          </label>
          <button
            onClick={toggleSortOrder}
            className="w-full p-2 lg:p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg flex items-center justify-between hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
          >
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            {sortOrder === 'asc' ? (
              <ArrowUpIcon className="w-5 h-5" />
            ) : (
              <ArrowDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;