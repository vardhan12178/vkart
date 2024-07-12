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
    <form onSubmit={handleSubmit} className="mt-4 bg-white p-6 rounded-lg shadow-md mb-10">
      <h2 className="text-xl text-gray-800 font-bold mb-4">Payment Details</h2>
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

      {(paymentMethod === 'phonepe' || paymentMethod === 'paypal' || paymentMethod === 'gpay' || paymentMethod === 'paytm' || paymentMethod === 'cred') && (
        <div className="mb-4">
          <label className="block mb-2">UPI ID</label>
          <input type="text" className="border rounded p-2 w-full" required />
        </div>
      )}

      {!formSubmitted && (
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded">Place Order</button>
      )}
      {formSubmitted && (
        <div className="text-center mt-4">
          <p className="text-gray-900 text-xl font-bold">Order placed successfully!</p>
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
