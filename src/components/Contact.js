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
    <div className="p-8 bg-gradient-to-r mt-12 from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-10">
        <h2 className="text-gray-900 text-4xl font-extrabold mb-8 text-center">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label htmlFor="name" className="block text-xl font-semibold text-gray-800">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
              required
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="email" className="block text-xl font-semibold text-gray-800">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-lg p-4 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
              required
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="message" className="block text-xl font-semibold text-gray-800">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-lg p-4 w-full h-48 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-orange-600 transition duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
