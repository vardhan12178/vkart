import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Your message has been sent!');
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className="p-6 mt-20 bg-gray-100">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-gray-900 text-4xl font-bold mb-6 text-center">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-lg font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="block text-lg font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full h-40"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
