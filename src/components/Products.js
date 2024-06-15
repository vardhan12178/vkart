import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    let url = 'https://fakestoreapi.com/products';
    if (category) {
      url += `/category/${category}`;
    }
    const response = await fetch(url);
    const data = await response.json();

    let sortedData = [...data];
    if (sortOption === 'price') {
      sortedData.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'name') {
      sortedData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'rating') {
      sortedData.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    setProducts(sortedData);
  }, [sortOption, category]);

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

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 mt-8 mb-20">
      <h1 className="text-3xl font-bold mb-8 text-center">Products</h1>
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
            <option value="name">Name</option>
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product.id}`}>
              <div className="flex justify-center items-center mb-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-h-48 object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-center">{product.title}</h2>
              <p className="text-gray-600 text-center">₹{(product.price * 75).toFixed(2)}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
