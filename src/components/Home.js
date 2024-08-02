import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-between w-full max-w-6xl p-4 text-center">
          <h1 className="text-white text-5xl font-extrabold mb-4 animate-slide-in-left">Vkart</h1>
          <p className="text-gray-100 text-xl mb-6">Shop with us, we have the best products available online.</p>
          <Link to="/products">
            <button className="bg-white text-indigo-700 px-8 py-3 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 mb-6">
              Shop now
            </button>
          </Link>
        </div>
      </div>

      <section className="bg-gray-50 py-8">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Why Shop With Us?</h2>
          <div className="flex flex-wrap justify-center">
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Free Shipping</h3>
                <p className="text-gray-700">Enjoy free shipping on all orders over $50. Fast and reliable delivery service.</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Quality Products</h3>
                <p className="text-gray-700">Our products are sourced from top brands and undergo strict quality control checks.</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Customer Support</h3>
                <p className="text-gray-700">We offer 24/7 customer support to assist you with any inquiries or issues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-indigo-700 py-16 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Join Our Newsletter</h2>
          <p className="mb-8">Sign up for our newsletter to receive exclusive offers and the latest news.</p>
          <form className="flex justify-center">
            <input
              type="email"
              className="px-4 py-2 w-1/2 rounded-l-lg focus:outline-none bg-white text-black"
              placeholder="Enter your email"
            />
            <button className="bg-white text-indigo-700 px-4 py-2 rounded-r-lg hover:bg-gray-100 transition duration-300">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <section className="bg-gray-50 py-8">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">What Our Customers Say</h2>
          <div className="flex flex-wrap justify-center">
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">John Doe</h3>
                <p className="text-gray-700">"Great products and amazing service. Highly recommend!"</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Jane Smith</h3>
                <p className="text-gray-700">"Quick delivery and excellent customer support. Will shop again!"</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Alex Johnson</h3>
                <p className="text-gray-700">"Top-notch quality and free shipping. What more could you ask for?"</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
