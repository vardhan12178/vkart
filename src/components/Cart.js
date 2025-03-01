import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, removeFromCart, clearCart } from '../redux/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheckCircle, faTimesCircle, faTrash, faHeart } from '@fortawesome/free-solid-svg-icons';
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

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
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

          price: item.price * 75,

        })),

        totalPrice: cartItems.reduce((total, item) => total + item.price * 75 * item.quantity, 0),

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
  const totalCost = cartItems.reduce((total, item) => total + item.price * 75 * item.quantity, 0);

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 mt-16">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-orange-500 mb-4" />
          <p className="text-lg text-gray-600">Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 mt-16">
      <div className="w-full max-w-6xl bg-white p-8 rounded-lg shadow-lg">
        {!orderPlaced ? (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Your Shopping Cart</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="col-span-2">
                <ul className="space-y-6">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex flex-col md:flex-row items-center md:items-start border-b last:border-b-0 p-4 hover:shadow-lg transition-shadow duration-300">
                      <div className="w-32 h-32 flex items-center justify-center overflow-hidden rounded-lg mb-4 md:mb-0 md:mr-6">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                        <div className="md:mr-6 mb-4 md:mb-0">
                          <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                          <p className="text-gray-600 text-lg mt-2">₹{(item.price * 75).toFixed(2)}</p>
                          <div className="flex flex-col md:flex-row items-center mt-4 md:mt-2">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleDecrement(item.id)}
                                className="bg-orange-600 text-white px-3 py-1 rounded-full mr-2 hover:bg-orange-700 transition duration-300"
                              >
                                -
                              </button>
                              <span className="text-lg font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleIncrement(item.id)}
                                className="bg-orange-600 text-white px-3 py-1 rounded-full ml-2 hover:bg-orange-700 transition duration-300"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-600 hover:text-red-700 transition duration-300"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 transition duration-300"
                          >
                            <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Summary */}
              <div className="col-span-1">
                <div className="bg-orange-50 p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-gray-700">Subtotal</p>
                      <p className="text-gray-900 font-semibold">₹{totalCost.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-700">Shipping</p>
                      <p className="text-gray-900 font-semibold">Free</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-700">Tax</p>
                      <p className="text-gray-900 font-semibold">₹{(totalCost * 0.18).toFixed(2)}</p>
                    </div>
                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex justify-between">
                        <p className="text-xl font-bold text-gray-900">Total</p>
                        <p className="text-xl font-bold text-gray-900">₹{(totalCost * 1.18).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  {!showPaymentDetails && (
                    <button
                      onClick={handleBuyNow}
                      className="bg-orange-600 text-white px-6 py-3 rounded-full mt-6 w-full hover:bg-orange-700 transition duration-300"
                    >
                      Proceed to Checkout
                    </button>
                  )}
                </div>
              </div>
            </div>
            {showPaymentDetails && <CheckoutForm onOrderPlaced={handleOrderPlaced} />}
            {isLoading && <p className="text-center mt-4">Placing your order...</p>}
            {error && (
              <div className="flex items-center justify-center mt-4 text-red-600">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                <p>{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order placed successfully!</h2>
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