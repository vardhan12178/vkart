import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, clearCart } from '../redux/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import CheckoutForm from './CheckoutForm';
import OrderStages from './OrderStages';
import axios from './axiosInstance';  
const mongoose = require('mongoose');


const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [totalItemsOrdered, setTotalItemsOrdered] = useState(0);

  const handleIncrement = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity(id));
  };

  const handleBuyNow = () => {
    setShowPaymentDetails(true);
  };
  const generateObjectId = () => new mongoose.Types.ObjectId();
  const handleOrderPlaced = async (orderDetails) => {
    try {
      const itemsOrdered = cartItems.reduce((total, item) => total + item.quantity, 0);
      setTotalItemsOrdered(itemsOrdered);

      const orderData = {
        products: cartItems.map(item => ({
          productId: generateObjectId(),
          name: item.title,
          image: item.image,
          quantity: item.quantity,
          price: item.price*75,
        })),
        totalPrice: cartItems.reduce((total, item) => total + item.price*75 * item.quantity, 0),
        stage: 'Pending',
        shippingAddress: orderDetails.address
      };

    await axios.post('/api/orders', orderData);

    
      dispatch(clearCart());
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order placement error:', error);
    }
  };

  const totalCost = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50 mt-16">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-gray-400 mb-4" />
          <p className="text-lg text-gray-600">Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50 mt-16">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-xl">
        {!orderPlaced ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center md:text-center">Your Shopping Cart</h1>
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex flex-col md:flex-row items-center md:items-start border-b last:border-b-0 p-4">
                  <div className="w-24 h-24 flex items-center justify-center overflow-hidden rounded-lg mb-4 mr-4 md:mb-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                    <div className="md:mr-4 mb-4 md:mb-0">
                      <h2 className="text-xl font-semibold">{item.name}</h2>
                      <p className="text-gray-600 text-lg mt-2">₹{(item.price * 75).toFixed(2)}</p>
                      <div className="flex flex-col md:flex-row items-center md:items-start mt-4 md:mt-2">
                        <div className="flex items-center">
                          <button onClick={() => handleDecrement(item.id)} className="bg-gray-800 text-white px-3 py-1 rounded-full mr-2">-</button>
                          <span className="text-lg font-medium">{item.quantity}</span>
                          <button onClick={() => handleIncrement(item.id)} className="bg-gray-800 text-white px-3 py-1 rounded-full ml-2">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800">Total: ₹{(totalCost * 75).toFixed(2)}</h2>
            </div>
            {!showPaymentDetails && (
              <button
                onClick={handleBuyNow}
                className="bg-green-600 text-white px-6 py-3 rounded-full mt-6 w-full md:w-auto hover:bg-green-700 transition duration-300"
              >
                Buy Now
              </button>
            )}
            {showPaymentDetails && <CheckoutForm onOrderPlaced={handleOrderPlaced} />}
          </>
        ) : (
          <div className="text-center">
            <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order placed successfully!</h2>
            <p className="text-lg text-gray-700 mb-4">
              You have placed an order for {totalItemsOrdered} {totalItemsOrdered > 1 ? 'items' : 'item'}.
            </p>
            <OrderStages currentStage="Shipping" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
