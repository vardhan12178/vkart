import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import Slider from 'react-slick';
import { Bars } from 'react-loading-icons'; // Import the loading icon

const ProductCard = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State to track loading
  const dispatch = useDispatch();

  const fetchRelatedProducts = useCallback(async (category) => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }
      const data = await response.json();
      setRelatedProducts(data.filter(item => item.id !== parseInt(id)));
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  }, [id]);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data);
      fetchRelatedProducts(data.category);
      setIsLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }, [id, fetchRelatedProducts]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto mt-4 flex justify-center items-center h-screen">
        <Bars stroke="#1a202c" className="w-12 h-12" />
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="container mx-auto mt-4 mb-20 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-shrink-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-full md:w-48 h-64 object-cover rounded-lg"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
          <div className="flex items-center mb-4">
            {renderStars(product.rating.rate)}
          </div>
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
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        <Slider {...settings}>
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="p-2">
              <Link to={`/product/${relatedProduct.id}`} className="block bg-white rounded-lg shadow-md p-4">
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.title}
                  className="w-full h-40 object-contain mb-2"
                  loading="lazy"
                />
                <h3 className="text-sm font-semibold">{relatedProduct.title}</h3>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">₹{(relatedProduct.price * 75).toFixed(2)}</p>
                  {renderStars(relatedProduct.rating.rate)}
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ProductCard;
