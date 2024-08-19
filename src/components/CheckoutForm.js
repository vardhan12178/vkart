import React, { useState } from 'react';
import Dropdown from './Dropdown';

const CheckoutForm = ({ onOrderPlaced }) => {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [formData, setFormData] = useState({
    creditCardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    mobileNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const paymentOptions = ['Credit Card', 'PhonePe', 'PayPal', 'Google Pay', 'Paytm', 'CRED'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.address) newErrors.address = 'Address is required';

    if (paymentMethod === 'Credit Card') {
      if (!formData.creditCardNumber) newErrors.creditCardNumber = 'Credit card number is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
    } else if (['PhonePe', 'PayPal', 'Google Pay', 'Paytm', 'CRED'].includes(paymentMethod)) {
      if (!formData.upiId) newErrors.upiId = 'UPI ID is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setFormSubmitted(true);
      simulateOrderProgress();
    } else {
      setErrors(newErrors);
    }
  };

  const simulateOrderProgress = () => {
    setTimeout(() => {
      onOrderPlaced(formData); 
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Payment Method</label>
        <Dropdown
          options={paymentOptions}
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value)}
        />
      </div>
      {paymentMethod === 'Credit Card' && (
        <>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Credit Card Number</label>
            <input
              type="text"
              name="creditCardNumber"
              value={formData.creditCardNumber}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full"
            />
            {errors.creditCardNumber && <p className="text-red-500 mt-1">{errors.creditCardNumber}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Expiry Date</label>
            <input
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full"
            />
            {errors.expiryDate && <p className="text-red-500 mt-1">{errors.expiryDate}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">CVV</label>
            <input
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full"
            />
            {errors.cvv && <p className="text-red-500 mt-1">{errors.cvv}</p>}
          </div>
        </>
      )}
      {['PhonePe', 'PayPal', 'Google Pay', 'Paytm', 'CRED'].includes(paymentMethod) && (
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">UPI ID</label>
          <input
            type="text"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 w-full"
          />
          {errors.upiId && <p className="text-red-500 mt-1">{errors.upiId}</p>}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Mobile Number</label>
        <input
          type="text"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-3 w-full"
        />
        {errors.mobileNumber && <p className="text-red-500 mt-1">{errors.mobileNumber}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Shipping Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-3 w-full"
        />
        {errors.address && <p className="text-red-500 mt-1">{errors.address}</p>}
      </div>
      <button
        type="submit"
        className="bg-orange-400 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition duration-300 w-full"
      >
        Place Order
      </button>
      {formSubmitted && <p className="text-green-500 mt-4">Order is being processed...</p>}
    </form>
  );
};

export default CheckoutForm;
