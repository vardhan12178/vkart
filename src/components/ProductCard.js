import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

const ProductCard = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  if (!product) {
    return <div className="container mx-auto mt-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-4 mb-20">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 flex space-x-4">
        <div className="flex-shrink-0  p-4 rounded-lg">
          <img
            src={product.image}
            alt={product.title}
            className="w-48 h-64 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1  p-3 rounded-lg">
          <h1 className="text-2xl font-bold mb-6">{product.title}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="flex items-center">
            <p className="text-lg font-bold text-gray-800 mr-4">₹{(product.price * 75).toFixed(2)}</p>
            <button
              onClick={handleAddToCart}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
