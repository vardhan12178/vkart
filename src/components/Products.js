import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchProducts = useCallback(async () => {
    let url = 'https://fakestoreapi.com/products';
    if (category) {
      url += `/category/${category}`;
    }
    const response = await fetch(url);
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
  }, [sortOption, category, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <>
        {[...Array(fullStars)].map((_, index) => (
          <span key={index} className="text-yellow-500">★</span>
        ))}
        {halfStar === 1 && <span className="text-yellow-500">★</span>}
        {[...Array(emptyStars)].map((_, index) => (
          <span key={index} className="text-gray-300">★</span>
        ))}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 mt-8 mb-20">
      <h1 className="text-blue-500 text-3xl font-bold mb-8 text-center">Products</h1>
      <div className="flex justify-center mb-8">
        <div className="max-w-lg w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products..."
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div className="flex justify-between mb-8">
        <div>
          <label className="mr-2 font-semibold">Sort by:</label>
          <select onChange={handleSortChange} value={sortOption} className="border rounded p-2">
            <option value="">None</option>
            <option value="price">Price</option>
            <option value="title">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold">Category:</label>
          <select onChange={handleCategoryChange} value={category} className="border rounded p-2">
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelery</option>
            <option value="men's clothing">Men's Clothing</option>
            <option value="women's clothing">Women's Clothing</option>
          </select>
        </div>
        <button onClick={toggleSortOrder} className="flex items-center text-blue-500">
          {sortOrder === 'asc' ? (
            <ArrowUpIcon className="w-6 h-6" />
          ) : (
            <ArrowDownIcon className="w-6 h-6" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product.id}`}>
              <div className="flex justify-center items-center mb-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-h-48 object-contain" loading='lazy'
                />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-center">{product.title}</h2>
              <p className="text-gray-600 text-center">₹{(product.price * 75).toFixed(2)}</p>
              <div className="flex justify-center">
                {renderStars(product.rating.rate)}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
