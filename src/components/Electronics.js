import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid';
import CustomDropdown from './CustomDropdown';

const Electronics = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products/category/electronics');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();

      let sortedData = [...data];
      if (sortOption) {
        sortedData.sort((a, b) => {
          let compareA = a[sortOption];
          let compareB = b[sortOption];
          if (sortOption === 'title') {
            compareA = compareA.toLowerCase();
            compareB = compareB.toLowerCase();
          } else if (sortOption === 'rating') {
            compareA = a.rating.rate;
            compareB = b.rating.rate;
          }

          if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
          if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
      setProducts(sortedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [sortOption, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (option) => {
    setSortOption(option.value);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, index) => (
          <span key={index} className="text-yellow-500">★</span>
        ))}
        {halfStar === 1 && <span className="text-yellow-500">☆</span>}
        {[...Array(emptyStars)].map((_, index) => (
          <span key={index} className="text-gray-300">★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-8 mb-20">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Electronics</h1>
      
      <div className="flex flex-col items-center mb-8">
        <div className="max-w-lg w-full mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search electronics..."
            className="border border-gray-300 rounded-lg p-4 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between w-full gap-4 mb-4">
          <div className="flex items-center flex-grow md:justify-start gap-2">
            <label className="text-md md:text-lg font-medium text-gray-700">Sort by:</label>
            <CustomDropdown
              options={[
                { value: '', label: 'None' },
                { value: 'price', label: 'Price' },
                { value: 'title', label: 'Name' },
                { value: 'rating', label: 'Rating' }
              ]}
              value={sortOption}
              onChange={handleSortChange}
              label="Sort by"
            />
          </div>
          <button
            onClick={toggleSortOrder}
            className="flex items-center p-1 text-xs md:p-2 md:text-sm text-gray-900 hover:bg-gray-100 rounded-md"
          >
            {sortOrder === 'asc' ? (
              <ArrowUpIcon className="w-5 h-5" />
            ) : (
              <ArrowDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="flex justify-center items-center col-span-3 h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Link to={`/product/${product.id}`}>
                <div className="flex justify-center items-center mb-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="max-h-48 object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                <h2 className="text-lg font-semibold mb-2 text-center text-gray-900">{product.title}</h2>
                <p className="text-gray-600 text-center text-xl font-bold">₹{(product.price * 75).toFixed(2)}</p>
                <div className="flex justify-center mt-2">
                  {renderStars(product.rating.rate)}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Electronics;
