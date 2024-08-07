import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Electronics = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products/category/electronics');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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
      <div className="flex justify-center mb-8">
        <div className="max-w-lg w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search electronics..."
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="flex justify-center items-center col-span-3 h-64">
            <div className="bars-spinner">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Link to={`/product/${product.id}`}>
                <div className="flex justify-center items-center mb-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="max-h-48 object-contain"
                    loading="lazy"
                  />
                </div>
                <h2 className="text-lg font-semibold mb-2 text-center text-gray-900">{product.title}</h2>
                <p className="text-gray-600 text-center">₹{(product.price * 75).toFixed(2)}</p>
                <div className="flex justify-center">
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
