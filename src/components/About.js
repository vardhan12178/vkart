import React from 'react';

const About = () => {
  return (
    <div className="py-8 px-4 bg-gray-100 mb-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-gray-800 text-3xl font-bold text-center mb-8">About Us</h2>
        <div className="md:flex md:h-auto md:space-x-8">
          <div className="flex-shrink-0 w-full md:w-1/2">
            <img
              className="object-cover w-full h-auto rounded-lg"
              src="https://img.freepik.com/premium-vector/final-choice-female-character-is-preparing-pay-online-order-application-that-takes-into-account-product-rating-price-color-delivery-address-woman-adds-items-shopping-cart_776652-2226.jpg?w=740"
              alt="About Us"
              loading="lazy"
              style={{height: '100%'}}
            />
          </div>
          <div className="flex flex-col justify-between w-full md:w-1/2">
            <div className="flex flex-col justify-between h-full">
              <div className="p-6 bg-white rounded-lg shadow-md flex-1 mb-8 md:mb-4">
                <h3 className="text-gray-800 text-2xl font-semibold mb-2">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  At Vkart, our mission is to curate an exceptional online shopping experience by offering a wide selection
                  of high-quality products and delivering outstanding customer service. We aim to build trust and loyalty
                  with our customers through reliability and satisfaction in every interaction.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md flex-1">
                <h3 className="text-gray-800 text-2xl font-semibold mb-2">Our Vision</h3>
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
    </div>
  );
};

export default About;
