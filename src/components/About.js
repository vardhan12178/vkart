import React from 'react';
import { FaBullhorn, FaEye, FaRocket, FaHandsHelping } from 'react-icons/fa';

const About = () => {
  return (
    <div className="py-16 px-6 md:px-8 bg-gradient-to-r from-orange-50 to-orange-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-gray-900 text-4xl md:text-5xl font-extrabold text-center mb-12">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <FaBullhorn className="text-orange-500 text-5xl mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                At Vkart, our mission is to revolutionize online shopping with a curated selection of premium products and unparalleled customer service. We aim to foster strong connections with our customers, ensuring trust and satisfaction in every transaction.
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <FaEye className="text-orange-500 text-5xl mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our vision is to redefine the online shopping landscape by being the go-to destination for diverse, high-quality products and exceptional service. We are committed to innovation and adapting to market trends to continually surpass customer expectations.
              </p>
            </div>
          </div>

          {/* Values Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <FaHandsHelping className="text-orange-500 text-5xl mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                We believe in integrity, transparency, and customer-centricity. These values guide every decision we make, ensuring that we deliver the best possible experience to our customers.
              </p>
            </div>
          </div>

          {/* Innovation Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <FaRocket className="text-orange-500 text-5xl mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                We are constantly innovating to bring you the latest trends and technologies. From seamless checkout experiences to personalized recommendations, we strive to make shopping with us effortless and enjoyable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;