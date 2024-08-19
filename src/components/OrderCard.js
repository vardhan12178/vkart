import React, { useState } from 'react';

const OrderCard = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="order-card bg-white p-4 shadow-md rounded-lg mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
        <img 
          src={order.products[0].image} 
          alt="Product" 
          className="w-16 h-16 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4"
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />
        <div className="flex-1">
          <h3 className="text-sm sm:text-lg font-semibold mb-1">Order #{order._id}</h3>
          <p className="text-base sm:text-lg">Items: {order.products.length}</p>
          <p className="text-base sm:text-lg">Total Price: ₹{(order.totalPrice).toFixed(2)}</p>
          <p className="text-base sm:text-lg">Status: {order.stage}</p>
        </div>
        <button 
          onClick={handleClick} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 mt-4 sm:mt-0"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>
      {showDetails && (
        <div className="order-details mt-4">
          <h4 className="text-base sm:text-lg font-semibold mb-2">Order Details</h4>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          <h5 className="text-base sm:text-md font-semibold mt-4">Products:</h5>
          {order.products.map((product, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start mb-2">
              <img 
                src={product.image} 
                alt="Product" 
                className="w-12 h-12 mt-4 object-cover rounded-lg mb-2 sm:mb-0 sm:mr-4"
                style={{ objectFit: 'contain' }}
                loading="lazy"
              />
              <div>
                <p><strong>{product.name}</strong></p>
                <p>Quantity: {product.quantity}</p>
                <p>Price: ₹{(product.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
