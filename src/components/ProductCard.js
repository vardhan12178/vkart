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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
        <img src={product.image} alt={product.title} className="w-full h-48 object-cover mb-4 rounded-lg" />
        <p className="text-lg mb-2">₹{(product.price * 75).toFixed(2)}</p>
        <p className="text-gray-600">{product.description}</p>
        <button
          onClick={handleAddToCart}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
