import React, { useState, useEffect } from 'react';
import moment from 'moment';
import OrderStages from './OrderStages';

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
    <div className="order-card bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
        <img 
          src={order.products[0].image} 
          alt="Product" 
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-6 border border-gray-200 shadow-sm"
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Order #{order._id}</h3>
          <p className="text-base text-gray-600 mb-1">Items: {order.products.length}</p>
          <p className="text-base text-gray-600 mb-1">Total Price: ₹{(order.totalPrice).toFixed(2)}</p>
          <p className="text-base text-gray-600">Status: <span className={`font-semibold ${getStatusColor(currentStatus)}`}>{currentStatus}</span></p>
        </div>
        <button 
          onClick={handleClick} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 mt-4 sm:mt-0 transition-all duration-300 transform hover:scale-105"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>
      {showDetails && (
        <>
          <div className="order-details mt-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Order Details</h4>
            <p className="text-base text-gray-700 mb-4"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
            <h5 className="text-lg font-semibold mb-4 text-gray-900">Products:</h5>
            {order.products.map((product, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start mb-4">
                <img 
                  src={product.image} 
                  alt="Product" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-6 border border-gray-200 shadow-sm"
                  style={{ objectFit: 'contain' }}
                  loading="lazy"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  <p className="text-sm text-gray-600">Price: ₹{(product.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-stages mt-8">
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