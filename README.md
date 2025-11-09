🛒 VKart — MERN E-Commerce Platform

VKart is a full-stack e-commerce web app built with React, Node.js/Express, and MongoDB.
It supports secure authentication, cart & wishlist management, order tracking, and test-mode payments via Razorpay.

🚀 Tech Stack

Frontend: React, Tailwind CSS, Framer Motion, React Router
Backend: Node.js, Express, MongoDB (Mongoose)
Payments: Razorpay (Test Mode)
Authentication: JWT + Google OAuth + Two-Factor Authentication (2FA)
Deployment: Netlify (frontend) + Render (backend API)

⚙️ Setup Instructions

Clone both repos:

git clone https://github.com/vardhan12178/vkart.git
git clone https://github.com/vardhan12178/backend.git

Frontend
cd vkart
npm install
npm start

Backend
cd backend
npm install
npm run dev


The app runs locally at http://localhost:3000
.

🧩 Features

🔐 Secure login & signup with JWT

🔑 Two-Factor Authentication (2FA)

🛍️ Product listing, search & filters

🛒 Cart, wishlist, and order management

💳 Razorpay test payments

📦 Order tracking with stage indicators

🎨 Responsive, modern UI (Tailwind + Framer Motion)

🧠 Environment Variables

Create .env in both frontend and backend:

Frontend (vkart/.env)
REACT_APP_API_URL=https://your-api-url.onrender.com

Backend (backend/.env)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret

🖥️ Deployment

Frontend: Netlify

Backend: Render

Database: MongoDB Atlas
