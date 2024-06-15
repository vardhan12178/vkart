import React from 'react';

const About = () => {
  return (
    <div className="py-8 px-4 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <img
              className="w-64 h-64 object-cover rounded-lg"
              src="https://img.freepik.com/premium-vector/final-choice-female-character-is-preparing-pay-online-order-application-that-takes-into-account-product-rating-price-color-delivery-address-woman-adds-items-shopping-cart_776652-2226.jpg?w=740"
              alt="About Us" loading='lazy'
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                At Vkart, our mission is to curate an exceptional online shopping experience by offering a wide selection
                of high-quality products and delivering outstanding customer service. We aim to build trust and loyalty
                with our customers through reliability and satisfaction in every interaction.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                Our vision is to redefine online shopping by becoming a preferred platform known for its diverse range
                of products and unwavering commitment to customer satisfaction. We aspire to innovate continuously,
                adapting to evolving market trends and surpassing customer expectations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
