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
        const response = await fetch('https://fakestoreapi.com/products?limit=10'); 
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
    slidesToShow: 4, 
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <header className="relative bg-gradient-to-r from-orange-100 to-orange-300 py-16 text-center">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center max-w-6xl mx-auto px-4 pt-24">
          <motion.h1
            className="text-white text-4xl sm:text-6xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Discover the Best Products
          </motion.h1>
          <motion.p
            className="text-white text-lg mb-6 max-w-xl mx-auto"
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
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105">
                Shop Now
              </button>
            </Link>
          </motion.div>
        </div>
      </header>
      <section className="bg-gray-100 py-12 px-4 sm:px-6">
  <div className="container mx-auto text-center">
    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">Why Shop With Us?</h2>
    <p className="text-gray-700 mb-6 text-sm sm:text-base">Discover the benefits of shopping with us: quality products, exceptional customer service, and great deals.</p>
    <div className="flex flex-wrap justify-center gap-6">
      <div className="w-full sm:w-1/3 px-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center">
          <img src="delivery-truck1.png" alt="Delivery Truck" className="w-16 h-16 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Free Shipping</h3>
          <p className="text-gray-700 text-sm sm:text-base text-center">Enjoy free shipping on all orders over $50. Fast and reliable delivery service.</p>
        </div>
      </div>
      <div className="w-full sm:w-1/3 px-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center">
          <img src="badge.png" alt="Quality Products" className="w-16 h-16 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Quality Products</h3>
          <p className="text-gray-700 text-sm sm:text-base text-center">Our products are sourced from top brands and undergo strict quality control checks.</p>
        </div>
      </div>
      <div className="w-full sm:w-1/3 px-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center">
          <img src="customer-support.png" alt="Customer Support" className="w-16 h-16 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Customer Support</h3>
          <p className="text-gray-700 text-sm sm:text-base text-center">We offer 24/7 customer support to assist you with any inquiries or issues.</p>
        </div>
      </div>
    </div>
  </div>
</section>


      <section className="bg-white py-12 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">Featured Products</h2>
          <Slider {...settings} className="mx-auto" >
            {featuredProducts.map(product => (
              <div key={product.id} className="p-4">
                <Link to={`/product/${product.id}`} className="block bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full max-h-48 object-contain mb-4 mx-auto"
                    loading="lazy"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{product.title}</h3>
                  <div className="flex justify-center items-center mb-2">
                    <p className="text-lg font-bold text-gray-900 mr-4">₹{(product.price * 75).toFixed(2)}</p>
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

      <section className="bg-gradient-to-r from-orange-100 to-orange-300 py-12 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">Join Our Newsletter</h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">Stay updated with our latest products and exclusive offers. Subscribe to our newsletter now!</p>
          <form className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 rounded-full border border-gray-300 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <section className="bg-gray-100 py-12 px-4 sm:px-6">
  <div className="container mx-auto text-center">
    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">What Our Customers Say</h2>
    <Slider
      {...settings}
      className="mx-auto text-gray-700"
      arrows={true} 
    >
      {[
        {
          text: "I had an amazing shopping experience! The product quality exceeded my expectations, and the customer service was excellent.",
          name: "Alice Johnson",
          role: "Verified Buyer",
          image: "https://randomuser.me/api/portraits/women/1.jpg"
        },
        {
          text: "Great selection of products and speedy delivery. I’ll definitely be shopping here again.",
          name: "Michael Smith",
          role: "Verified Buyer",
          image: "https://randomuser.me/api/portraits/men/2.jpg"
        },
        {
          text: "I love the user-friendly website and the variety of products available. My order arrived quickly and in perfect condition.",
          name: "Sarah Lee",
          role: "Verified Buyer",
          image: "https://randomuser.me/api/portraits/women/2.jpg"
        },
        {
          text: "Exceptional service and a fantastic range of products. Highly recommend to everyone looking for quality and value.",
          name: "John Doe",
          role: "Verified Buyer",
          image: "https://randomuser.me/api/portraits/men/3.jpg"
        },
        {
          text: "The checkout process was smooth, and the delivery was prompt. The product quality was top-notch.",
          name: "Emily Davis",
          role: "Verified Buyer",
          image: "https://randomuser.me/api/portraits/women/3.jpg"
        }
      ].map((testimonial, index) => (
        <div key={index} className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
            <div className="flex items-center justify-center">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  </div>
</section>

    </>
  );
};

export default Home;
