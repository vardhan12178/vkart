import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity } from '../redux/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [showForm, setShowForm] = useState(false);

  const handleIncrement = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity(id));
  };

  const handleBuyNow = () => {
    setShowForm(true);
  };

  const totalCost = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Cart</h1>
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        <ul>
          {cartItems.map((item) => (
            <li key={item.id} className="border p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover mr-4 rounded-lg" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">₹{(item.price * 75).toFixed(2)} x {item.quantity}</p>
                <div className="flex items-center mt-2">
                  <button onClick={() => handleDecrement(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">-</button>
                  <span className="mx-2">{item.quantity}</span>
                  <button onClick={() => handleIncrement(item.id)} className="bg-blue-500 text-white px-2 py-1 rounded">+</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <h2 className="text-xl font-bold">Total: ₹{(totalCost * 75).toFixed(2)}</h2>
        </div>
        <button
          onClick={handleBuyNow}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Buy Now
        </button>
        {showForm && <CheckoutForm />}
      </div>
    </div>
  );
};

const CheckoutForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Order placed successfully!');
    // Here you can handle the form submission, e.g., send the data to an API
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-white p-6 rounded-lg shadow-md mb-10">
      <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
      <div className="mb-4">
        <label className="block mb-2">First Name</label>
        <input type="text" className="border rounded p-2 w-full" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Last Name</label>
        <input type="text" className="border rounded p-2 w-full" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Address</label>
        <input type="text" className="border rounded p-2 w-full" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Pincode</label>
        <input type="text" className="border rounded p-2 w-full" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Country</label>
        <input type="text" className="border rounded p-2 w-full" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2">State</label>
        <input type="text" className="border rounded p-2 w-full" required />
      </div>

      <h2 className="text-xl font-bold mb-4">Payment Method</h2>
      <div className="mb-4">
        <label className="block mb-2">Payment Method</label>
        <select 
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="creditCard">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="phonepe">PhonePe</option>
          <option value="gpay">GPay</option>
          <option value="paytm">Paytm</option>
          <option value="cred">Cred</option>
        </select>
      </div>

      {paymentMethod === 'creditCard' && (
        <>
          <div className="mb-4">
            <label className="block mb-2">Credit Card Number</label>
            <input type="text" className="border rounded p-2 w-full" required />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Expiry Date</label>
            <input type="text" className="border rounded p-2 w-full" required />
          </div>
          <div className="mb-4">
            <label className="block mb-2">CVV</label>
            <input type="text" className="border rounded p-2 w-full" required />
          </div>
        </>
      )}

      {(paymentMethod === 'phonepe' || paymentMethod === 'gpay' || paymentMethod === 'paytm' || paymentMethod === 'cred') && (
        <div className="mb-4">
          <label className="block mb-2">UPI ID</label>
          <input type="text" className="border rounded p-2 w-full" required />
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Place Order</button>
    </form>
  );
};

export default Cart;
