🛒 VKart — MERN E-Commerce Platform

🔴 Live Demo: https://vkartshop.netlify.app

📂 Frontend Repository: https://github.com/vardhan12178/vkart

📂 Backend Repository: https://github.com/vardhan12178/backend

VKart is a full-stack e-commerce web application built using the MERN stack.
The project emphasizes production-style architecture, backend-driven logic, and modern features such as Redis caching, AI-assisted semantic search, and real-time updates.

🚀 Tech Stack
Frontend

React.js

Tailwind CSS

Framer Motion

React Router

Backend

Node.js

Express.js

MongoDB (Mongoose)

Redis (Caching)

AI / Search

Vector Embeddings

RAG-style Semantic Search

Integrations

Razorpay (Test Mode)

JWT Authentication

Google OAuth 2.0

Two-Factor Authentication (2FA)

Socket.io (Real-time updates)

AWS S3 (Image Storage)

Deployment

Frontend: Netlify

Backend API: Render

Database: MongoDB Atlas

🧩 Features
User Features

Secure authentication using JWT

Google OAuth and Two-Factor Authentication (2FA)

Product listing with advanced search and filters

AI-assisted semantic product search

Cart and checkout workflow

Real-time order status tracking

Fully responsive, modern UI

Admin Features

Role-based admin dashboard

Product and inventory management

Order status management

Basic analytics and reporting

⚙️ Setup Instructions
1️⃣ Clone the Repositories
git clone https://github.com/vardhan12178/vkart.git
git clone https://github.com/vardhan12178/backend.git

2️⃣ Backend Setup
cd backend
npm install
npm run dev


Create a .env file inside the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AI_API_KEY=your_ai_key

3️⃣ Frontend Setup
cd vkart
npm install
npm start


Create a .env file inside the vkart folder:

REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com

🖥️ Local Development

Frontend: http://localhost:3000

Backend: http://localhost:5000

🧠 Architecture Notes

Backend manages authentication, business logic, caching, AI search, and real-time updates

Frontend focuses on UI rendering and user interaction

Redis is used to cache frequently accessed data for performance optimization

Semantic search is implemented using vector embeddings (RAG-style approach)

WebSockets enable live order status updates

📌 Project Scope

VKart is a portfolio project built to demonstrate:

Full-stack MERN development

Backend-leaning system design

Redis caching for performance optimization

AI-assisted semantic search

Real-time application architecture

👤 Author

Bala Vardhan
Full-Stack Developer (MERN)
