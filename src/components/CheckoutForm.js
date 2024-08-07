import React, { useState } from 'react';

const CheckoutForm = ({ onOrderPlaced }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.address) newErrors.address = 'Address is required';

    if (paymentMethod === 'creditCard') {
      if (!formData.creditCardNumber) newErrors.creditCardNumber = 'Credit card number is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
    } else if (['phonepe', 'paypal', 'gpay', 'paytm', 'cred'].includes(paymentMethod)) {
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
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Payment Method</label>
        <select 
          name="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border rounded-lg p-3 w-full"
        >
          <option value="creditCard">Credit Card</option>
          <option value="phonepe">PhonePe</option>
          <option value="paypal">PayPal</option>
          <option value="gpay">Google Pay</option>
          <option value="paytm">Paytm</option>
          <option value="cred">CRED</option>
        </select>
      </div>
      {paymentMethod === 'creditCard' && (
        <>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Credit Card Number</label>
            <input 
              type="text"
              name="creditCardNumber"
              value={formData.creditCardNumber}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
            {errors.creditCardNumber && <p className="text-red-500">{errors.creditCardNumber}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">Expiry Date</label>
            <input 
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
            {errors.expiryDate && <p className="text-red-500">{errors.expiryDate}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">CVV</label>
            <input 
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
            {errors.cvv && <p className="text-red-500">{errors.cvv}</p>}
          </div>
        </>
      )}
      {['phonepe', 'paypal', 'gpay', 'paytm', 'cred'].includes(paymentMethod) && (
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">UPI ID</label>
          <input 
            type="text"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full"
          />
          {errors.upiId && <p className="text-red-500">{errors.upiId}</p>}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Mobile Number</label>
        <input 
          type="text"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full"
        />
        {errors.mobileNumber && <p className="text-red-500">{errors.mobileNumber}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Shipping Address</label>
        <input 
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full"
        />
        {errors.address && <p className="text-red-500">{errors.address}</p>}
      </div>
      <button 
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 w-full"
      >
        Place Order
      </button>
      {formSubmitted && <p className="text-green-500 mt-4">Order is being processed...</p>}
    </form>
  );
};

export default CheckoutForm;
