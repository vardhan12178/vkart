import React from 'react';

const About = () => {
  return (
    <div className="py-12 px-6 mt-20 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-gray-900 text-4xl font-bold text-center mb-8">About Us</h2>
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-gray-900 text-3xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              At Vkart, our mission is to curate an exceptional online shopping experience by offering a wide selection
              of high-quality products and delivering outstanding customer service. We aim to build trust and loyalty
              with our customers through reliability and satisfaction in every interaction.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-gray-900 text-3xl font-semibold mb-4">Our Vision</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our vision is to redefine online shopping by becoming a preferred platform known for its diverse range
              of products and unwavering commitment to customer satisfaction. We aspire to innovate continuously,
              adapting to evolving market trends and surpassing customer expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
