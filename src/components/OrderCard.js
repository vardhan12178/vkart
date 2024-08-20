import React, { useState, useEffect } from 'react';
import moment from 'moment';
import OrderStages from './OrderStages'; // Make sure this component is styled appropriately

const OrderCard = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    const calculateStatus = () => {
      const createdAt = moment(order.createdAt);
      const now = moment();
      const hoursSinceCreation = now.diff(createdAt, 'hours');
      const daysSinceCreation = now.diff(createdAt, 'days');

      if (hoursSinceCreation >= 72) {
        setCurrentStatus('Delivered');
      } else if (daysSinceCreation >= 2) {
        setCurrentStatus('Out for Delivery');
      } else if (daysSinceCreation >= 1) {
        setCurrentStatus('Shipped');
      } else if (hoursSinceCreation >= 4) {
        setCurrentStatus('Shipping');
      } else {
        setCurrentStatus('Pending');
      }
    };

    calculateStatus();
  }, [order.createdAt]);

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="order-card bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4 ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
        <img 
          src={order.products[0].image} 
          alt="Product" 
          className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4 border border-gray-200 shadow-sm"
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Order #{order._id}</h3>
          <p className="text-base text-gray-600 mb-1">Items: {order.products.length}</p>
          <p className="text-base text-gray-600 mb-1">Total Price: ₹{(order.totalPrice).toFixed(2)}</p>
          <p className="text-base text-gray-600">Status: <span className={`font-semibold ${getStatusColor(currentStatus)}`}>{currentStatus}</span></p>
        </div>
        <button 
          onClick={handleClick} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 mt-4 sm:mt-0 transition-colors duration-300"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>
      {showDetails && (
        <>
          <div className="order-details mt-4">
            <h4 className="text-lg font-semibold mb-2 text-gray-800">Order Details</h4>
            <p className="text-base text-gray-600 mb-2"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
            <h5 className="text-base font-semibold mt-4 text-gray-800">Products:</h5>
            {order.products.map((product, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start mb-2">
                <img 
                  src={product.image} 
                  alt="Product" 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg mb-2 sm:mb-0 sm:mr-4 border border-gray-200 shadow-sm"
                  style={{ objectFit: 'contain' }}
                  loading="lazy"
                />
                <div>
                  <p className="text-base text-gray-800"><strong>{product.name}</strong></p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  <p className="text-sm text-gray-600">Price: ₹{(product.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-stages mt-6 flex flex-col sm:flex-row items-center justify-between">
            <OrderStages currentStage={currentStatus} />
          </div>
        </>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Delivered':
      return 'text-green-600';
    case 'Out for Delivery':
      return 'text-yellow-600';
    case 'Shipped':
      return 'text-blue-600';
    case 'Shipping':
      return 'text-orange-600';
    case 'Pending':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export default OrderCard;
