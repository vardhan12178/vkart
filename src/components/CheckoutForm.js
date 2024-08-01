import React, { useState } from 'react';

const CheckoutForm = ({ onOrderPlaced }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    simulateOrderProgress();
  };

  const simulateOrderProgress = () => {
    setTimeout(() => {
      onOrderPlaced();
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Payment Method</label>
        <select 
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border rounded-lg p-3 w-full"
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
            <label className="block text-lg font-medium mb-2">Credit Card Number</label>
            <input type="text" className="border rounded-lg p-3 w-full" required />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Expiry Date</label>
            <input type="text" className="border rounded-lg p-3 w-full" required />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">CVV</label>
            <input type="text" className="border rounded-lg p-3 w-full" required />
          </div>
        </>
      )}

      {(paymentMethod === 'phonepe' || paymentMethod === 'paypal' || paymentMethod === 'gpay' || paymentMethod === 'paytm' || paymentMethod === 'cred') && (
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">UPI ID</label>
          <input type="text" className="border rounded-lg p-3 w-full" required />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Address</label>
        <input type="text" placeholder="Enter your address" className="border rounded-lg p-3 w-full" required />
      </div>

      {!formSubmitted && (
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">Place Order</button>
      )}
      {formSubmitted && (
        <div className="text-center mt-4">
          <p className="text-green-600 text-xl font-bold">Order placed successfully!</p>
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
