// ProductCard.js

import React from 'react';
import { useParams } from 'react-router-dom';


const ProductCard = () => {
  const { id } = useParams(); // Fetching id parameter from URL
  
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
  
  const product = products.find(p => p.id === parseInt(id)); // Finding product by id

  if (!product) {
    return <div className="container mx-auto mt-4">Product not found</div>;
  }

  return (
    <div className="container mx-auto mt-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded-lg" />
        <p className="text-lg mb-2">${product.price}</p>
        <p className="text-gray-600">{product.description}</p>
      </div>
    </div>
  );
};

export default ProductCard;
