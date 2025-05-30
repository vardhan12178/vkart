import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import Slider from 'react-slick';
import { FaStar, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ProductCard = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }, [id, fetchRelatedProducts]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity })); // Pass the quantity here
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const truncatedDescription = (description) => {
    const lines = description.split('\n');
    const visibleLines = isDescriptionExpanded ? lines : lines.slice(0, 4);
    const isTruncated = lines.length > 4;
    return (
      <div>
        <p>{visibleLines.join('\n')}</p>
        {isTruncated && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-orange-500 hover:text-orange-600 transition-colors duration-300 font-semibold mt-2"
          >
            {isDescriptionExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    );
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={index} className="text-yellow-500 text-lg" />
        ))}
        {halfStar === 1 && <FaStar className="text-yellow-500 text-lg" />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaStar key={index} className="text-gray-300 text-lg" />
        ))}
      </div>
    );
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-16 mb-20 px-4 py-12">
      {/* Product Details */}
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-40 to-orange-40 rounded-lg shadow-lg p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
        {/* Product Image */}
        <div className="flex-shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
          <img
            src={product.image}
            alt={product.title}
            className="w-full max-h-96 object-contain mb-2 mx-auto transform hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.title}</h1>
          <div className="flex items-center justify-start mb-4 space-x-4">
            <div className="flex items-center space-x-1">
              {renderStars(product.rating.rate)}
              <p className="text-gray-700 text-sm font-semibold ml-2">{product.rating.rate.toFixed(1)}</p>
            </div>
            <div className="text-gray-400">|</div>
            <p className="text-gray-500 text-sm">{product.rating.count} Reviews</p>
          </div>
          <div className="text-gray-700 mb-4">
            {truncatedDescription(product.description)}
          </div>
          <div className="flex items-center justify-center md:justify-start mb-4 space-x-4">
            <div className="flex flex-col md:flex-row items-center space-x-2">
              <p className="text-2xl font-bold text-gray-800">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(product.price * 75)}</p>
              <p className="text-sm text-gray-500 line-through">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(product.price * 75 * 1.2)}</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start mb-4 space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              >
                <FaChevronDown className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              >
                <FaChevronUp className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300 text-sm font-semibold tracking-wide"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Related Products</h2>
        <Slider {...settings}>
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="p-2">
              <Link to={`/product/${relatedProduct.id}`} className="block bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center items-center mb-4">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.title}
                    className="w-full max-h-40 object-contain mb-2 mx-auto"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-semibold text-center text-gray-900">{relatedProduct.title}</h3>
                <p className="text-sm text-gray-600 text-center">₹{(relatedProduct.price * 75).toFixed(2)}</p>
                <div className="flex justify-center mt-2">
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