import React from 'react';
import { Link } from 'react-router-dom';


const Products = () => {

const products = [
    {
      id: 1,
      name: "Product 1",
      image: "https://via.placeholder.com/150",
      price: 100,
      description: "This is the description of Product 1.",
    },
    {
      id: 2,
      name: "Product 2",
      image: "https://via.placeholder.com/150",
      price: 150,
      description: "This is the description of Product 2.",
    },
    {
      id: 3,
      name: "Product 3",
      image: "https://via.placeholder.com/150",
      price: 120,
      description: "This is the description of Product 3.",
    },
  ];
  
  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded-lg shadow-md">
            <Link to={`/product/${product.id}`}>
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2 rounded-lg" />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-600">${product.price}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
