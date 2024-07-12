import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, clearCart } from '../redux/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import CheckoutForm from './CheckoutForm';
import OrderStages from './OrderStages';

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

  const handleOrderPlaced = () => {
    const itemsOrdered = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalItemsOrdered(itemsOrdered); 
    setOrderPlaced(true);
    dispatch(clearCart());
  };

  const totalCost = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-gray-500 mb-4" />
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        {!orderPlaced ? (
          <>
            <h1 className="text-3xl text-gray-900 font-bold mb-4 text-center">Your Shopping Cart</h1>
            <ul>
              {cartItems.map((item) => (
                <li key={item.id} className="border p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row items-center md:items-start">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-contain mr-4 rounded-lg mb-4 md:mb-0" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
                    <p className="text-gray-600 mb-2">₹{(item.price * 75).toFixed(2)} x {item.quantity}</p>
                    <div className="flex items-center">
                      <button onClick={() => handleDecrement(item.id)} className="bg-gray-700 text-white px-2 py-1 rounded mr-2">-</button>
                      <span className="text-base md:text-lg">{item.quantity}</span> 
                      <button onClick={() => handleIncrement(item.id)} className="bg-gray-700 text-white px-2 py-1 rounded ml-2">+</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h2 className="text-lg text-gray-800 md:text-xl font-bold">Total: ₹{(totalCost * 75).toFixed(2)}</h2> 
            </div>
            {!showPaymentDetails && (
              <button
                onClick={handleBuyNow}
                className="bg-gray-900 text-white px-4 py-2 rounded mt-4 w-full md:w-auto"
              >
                Buy Now
              </button>
            )}
            {showPaymentDetails && <CheckoutForm onOrderPlaced={handleOrderPlaced} />}
          </>
        ) : (
          <div className="text-center">
            <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-gray-900 mb-2 md:mb-4" />
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Order placed successfully!</h2> 
            <p className="text-base md:text-lg mb-4">
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