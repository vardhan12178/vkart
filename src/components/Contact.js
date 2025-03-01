import React, { useState } from 'react';
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

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
    <div className="py-16 px-6 md:px-8 bg-gradient-to-r from-orange-50 to-orange-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-gray-900 text-4xl md:text-5xl font-extrabold text-center mb-12">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
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
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 transition duration-300 w-full"
              >
                <FaPaperPlane className="inline-block mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Get in Touch</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <FaMapMarkerAlt className="text-orange-500 text-2xl" />
                <p className="text-gray-700 text-lg">123 Vkart Street, E-Commerce City, India</p>
              </div>
              <div className="flex items-center space-x-4">
                <FaPhone className="text-orange-500 text-2xl" />
                <p className="text-gray-700 text-lg">+91 123 456 7890</p>
              </div>
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-orange-500 text-2xl" />
                <p className="text-gray-700 text-lg">support@vkart.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;