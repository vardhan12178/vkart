import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products?limit=6');
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }
        const data = await response.json();
        setFeaturedProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

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
      <div className="container mx-auto mt-4 flex justify-center items-center h-screen">
        <div className="flex justify-center items-center h-full">
          <div className="bars-spinner">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-images1.jpeg)' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-6xl px-4 py-8 text-center">
          <motion.h1 
            className="hero-title text-orange-100 text-3xl sm:text-5xl font-extrabold mb-4" 
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1 }}
          >
            Discover the Best Products
          </motion.h1>
          <motion.p 
            className="text-orange-100 text-lg mb-6" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.5 }}
          >
            Shop the latest trends and deals at unbeatable prices.
          </motion.p>
          <motion.div 
            className="flex justify-center" 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 1 }}
          >
            <Link to="/products">
              <button className="bg-transparent border-2 border-orange-100 text-orange-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg hover:bg-orange-400 hover:text-white transition duration-300 transform hover:scale-105">
                Shop Now
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
      <section className="bg-gray-100 py-8 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Why Shop With Us?</h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">Discover the benefits of shopping with us: quality products, exceptional customer service, and great deals.</p>
          <div className="flex flex-wrap justify-center">
            <div className="w-full sm:w-1/3 px-2 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center">
                <img src="delivery-truck1.png" alt="Delivery Truck" className="w-12 sm:w-16 h-12 sm:h-16 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Free Shipping</h3>
                <p className="text-gray-700 text-sm sm:text-base text-center">Enjoy free shipping on all orders over $50. Fast and reliable delivery service.</p>
              </div>
            </div>
            <div className="w-full sm:w-1/3 px-2 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center">
                <img src="badge.png" alt="Quality Products" className="w-12 sm:w-16 h-12 sm:h-16 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Quality Products</h3>
                <p className="text-gray-700 text-sm sm:text-base text-center">Our products are sourced from top brands and undergo strict quality control checks.</p>
              </div>
            </div>
            <div className="w-full sm:w-1/3 px-2 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center">
                <img src="customer-support.png" alt="Customer Support" className="w-12 sm:w-16 h-12 sm:h-16 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Customer Support</h3>
                <p className="text-gray-700 text-sm sm:text-base text-center">We offer 24/7 customer support to assist you with any inquiries or issues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Featured Products</h2>
          <Slider {...settings}>
            {featuredProducts.map(product => (
              <div key={product.id} className="p-2">
                <Link to={`/product/${product.id}`} className="block bg-white rounded-lg shadow-lg p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full max-h-40 object-contain mb-2 mx-auto"
                    loading="lazy"
                  />
                  <h3 className="text-sm font-semibold text-center text-gray-900">{product.title}</h3>
                  <div className="flex justify-center items-center mb-2">
                    <p className="text-sm text-gray-700 mr-4">₹{(product.price * 75).toFixed(2)}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <FaStar key={index} className={index < Math.floor(product.rating.rate) ? "text-yellow-500" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <section className="bg-gray-100 py-8">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">What Our Customers Say</h2>
          <div className="flex flex-wrap justify-center">
            {[{
              name: "Amit",
              rating: 5,
              text: '"Great products and amazing service. Highly recommend!"',
              image: "Amit.png"
            }, {
              name: "Priya",
              rating: 4,
              text: '"Quick delivery and excellent customer support. Will shop again!"',
              image: "priya.png"
            }, {
              name: "Rohit",
              rating: 5,
              text: '"Top-notch quality and free shipping. What more could you ask for?"',
              image: "Rohit.png"
            }].map((testimonial, index) => (
              <div key={index} className="w-full sm:w-1/3 px-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{testimonial.name}</h3>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, index) => (
                      <FaStar key={index} className={index < testimonial.rating ? "text-yellow-500" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-center">{testimonial.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 px-4 sm:px-6 text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Join Our Newsletter</h2>
          <p className="text-gray-700 mb-6">Subscribe to our newsletter and stay updated with the latest news, offers, and promotions.</p>
          <form className="flex flex-col sm:flex-row items-center justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mr-4 sm:w-1/2 px-4 py-2 mb-4 sm:mb-0 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-l-md rounded-r-md shadow-lg hover:bg-orange-300 transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;
