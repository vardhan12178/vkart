import React, { useState } from 'react';

const OrderCard = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="order-card bg-white p-4 shadow-md rounded-lg">
      <div className="flex items-center mb-4">
        <img src={order.products[0].image} alt="Product" className="w-16 h-16 object-cover rounded-lg mr-4" />
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">Order #{order._id}</h3>
          <p className="text-lg">Items: {order.products.length}</p>
          <p className="text-lg">Total Price: ₹{(order.totalPrice * 75).toFixed(2)}</p>
          <p className="text-lg">Status: {order.stage}</p>
        </div>
        <button onClick={handleClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>
      {showDetails && (
        <div className="order-details mt-4">
          <h4 className="text-lg font-semibold mb-2">Order Details</h4>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          {order.upiId && <p><strong>UPI ID:</strong> {order.upiId}</p>}
          <h5 className="text-md font-semibold mt-4">Products:</h5>
          {order.products.map((product, index) => (
            <div key={index} className="flex items-center mb-2">
              <img src={product.image} alt="Product" className="w-12 h-12 object-cover rounded-lg mr-4" />
              <div>
                <p><strong>{product.name}</strong></p>
                <p>Quantity: {product.quantity}</p>
                <p>Price: ₹{(product.price * 75).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
