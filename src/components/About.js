// About.js
import React from 'react';

const About = () => {
  return (
    <div className=" p-4">
      <div className="max-w-2xl text-center mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-700">
              At EcommerceStore, our mission is to provide high-quality products with exceptional customer service.
              We aim to create a seamless shopping experience for our customers, ensuring satisfaction and reliability
              in every purchase.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-700">
              Our vision is to become a leading e-commerce platform known for its diverse range of products and
              commitment to customer-centric practices. We strive to innovate continuously, adapting to market trends
              and exceeding customer expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
