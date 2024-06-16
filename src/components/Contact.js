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
    // Implement logic to send email or handle the form submission (e.g., using API)
    console.log(formData);
    alert('Your message has been sent!');

    // Optionally, clear the form fields
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className="p-4 mb-20">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-blue-500 text-3xl font-bold mb-4 text-center">Contact Us</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2">Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="border rounded p-2 w-full" required />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="border rounded p-2 w-full" required />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block mb-2">Message</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} className="border rounded p-2 w-full h-32" required></textarea>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
