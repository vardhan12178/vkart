import React from 'react';
import { FaBullhorn, FaEye } from 'react-icons/fa';

const About = () => {
  return (
    <div className="py-16 px-6 md:px-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-10">
        <h2 className="text-gray-900 text-4xl md:text-5xl font-extrabold text-center mb-10 md:mb-12">About Us</h2>
        <div className="space-y-12">
          <div className="p-6 md:p-8 bg-white rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start">
            <FaBullhorn className="text-orange-500 text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-0 md:mr-6 transition-transform duration-300 transform hover:scale-110" />
            <div className="text-center md:text-left">
              <h3 className="text-gray-900 text-2xl md:text-3xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                At Vkart, our mission is to revolutionize online shopping with a curated selection of premium products and unparalleled customer service. We aim to foster strong connections with our customers, ensuring trust and satisfaction in every transaction.
              </p>
            </div>
          </div>
          <div className="p-6 md:p-8 bg-white rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start">
            <FaEye className="text-orange-500 text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-0 md:mr-6 transition-transform duration-300 transform hover:scale-110" />
            <div className="text-center md:text-left">
              <h3 className="text-gray-900 text-2xl md:text-3xl font-semibold mb-4">Our Vision</h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                Our vision is to redefine the online shopping landscape by being the go-to destination for diverse, high-quality products and exceptional service. We are committed to innovation and adapting to market trends to continually surpass customer expectations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
