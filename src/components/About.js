import React from 'react';
import { FaBullhorn, FaEye } from 'react-icons/fa';

const About = () => {
  return (
    <div className="py-12 px-6 mt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-gray-800 text-4xl font-extrabold text-center mb-8">About Us</h2>
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col sm:flex-row items-start">
            <FaBullhorn className="text-orange-500 text-6xl sm:text-7xl lg:text-8xl xl:text-9xl mb-4 sm:mb-0 sm:mr-6" />
            <div>
              <h3 className="text-gray-800 text-2xl sm:text-3xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                At Vkart, our mission is to provide an exceptional online shopping experience by offering a diverse selection
                of high-quality products and delivering outstanding customer service. We strive to build lasting relationships
                with our customers through trust and satisfaction in every interaction.
              </p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col sm:flex-row items-start">
            <FaEye className="text-orange-500 text-6xl sm:text-7xl lg:text-8xl xl:text-9xl mb-4 sm:mb-0 sm:mr-6" />
            <div>
              <h3 className="text-gray-800 text-2xl sm:text-3xl font-semibold mb-4">Our Vision</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Our vision is to transform online shopping by becoming a top choice for a wide array of products and an unwavering
                commitment to customer satisfaction. We are dedicated to continuous innovation and adapting to evolving market trends
                to exceed our customers' expectations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
