# 🛒 VKart — Full-Stack MERN E-Commerce Platform

> A modern MERN-based e-commerce platform with AI-powered product search, secure authentication, and real-time order updates.

🔴 **Live Demo:**  
https://vkart.balavardhan.dev/

📂 **Frontend Repository:**  
https://github.com/vardhan12178/vkart  

📂 **Backend Repository:**  
https://github.com/vardhan12178/backend

---

# 📌 Overview

VKart is a **full-stack e-commerce web application built using the MERN stack**.  
The project focuses on scalable backend design, efficient caching, secure authentication, and a modern user experience.

Key highlights include:

- AI-powered **semantic product search (RAG)**
- **AI shopping assistant chatbot**
- Redis-powered caching
- Real-time notifications using WebSockets
- Secure authentication with **JWT, Google OAuth, and 2FA**
- Razorpay payment integration
- Prime membership system
- Wallet and refund management
- Fully responsive UI

---

# 🚀 Tech Stack

## Frontend

| Category | Technologies |
|---|---|
Core | React 18, React Router v6, Redux Toolkit |
UI | Tailwind CSS, Headless UI, Heroicons, Framer Motion |
Auth | Google OAuth (@react-oauth/google) |
Charts | Recharts |
SEO | React Helmet Async |
Real-time | Socket.io Client |

---

## Backend

| Category | Technologies |
|---|---|
Core | Node.js, Express |
Database | MongoDB Atlas (Mongoose) |
Caching | Redis |
Auth | JWT, bcryptjs, Speakeasy (TOTP 2FA), Google Auth Library |
Security | Helmet, CORS, Rate Limiting |
AI/Search | Gemini embeddings, MongoDB Atlas Vector Search |
Payments | Razorpay SDK |
Cloud Storage | AWS S3 |
Email | Resend |
Real-time | Socket.io |
Documents | PDFKit |


---

# 🧩 Features

## 🛍️ Storefront

- Product catalog with filtering and sorting
- Category and price filtering
- Search with autocomplete suggestions
- Wishlist system
- Product comparison tool

---

## 🤖 AI Semantic Search

VKart includes an **AI-powered product search system** that allows users to search using natural language.

- Uses **vector embeddings**
- MongoDB Atlas `$vectorSearch`
- Semantic product discovery instead of simple keyword matching

---

## 🤖 AI Shopping Assistant

An **AI chatbot assistant** powered by Gemini that helps users discover products and get recommendations.

---

## 🔐 Authentication & Security

- JWT authentication with HTTP-only cookies
- Google OAuth login
- Two-factor authentication (TOTP)
- Password reset system
- Email verification using Resend
- Rate limiting and security middleware

---

## 💳 Payments & Wallet

- Razorpay payment integration
- Wallet system for refunds and balance management

Supported payment methods:

- Card
- UPI
- Wallet
- Cash on Delivery

---

## 📦 Order Management

Complete order lifecycle tracking.

Order pipeline:

Placed → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered → Cancelled

Features include:

- Order status timeline
- Refund processing
- Return management
- PDF invoice generation
- Real-time order updates via Socket.io

---

## 👑 Prime Membership

VKart includes a **Prime subscription system** with configurable membership plans.

Features:

- Multiple membership tiers
- Prime-exclusive discounts
- Razorpay subscription purchase flow
- Membership status tracking
- Automatic expiration

---

## 🔔 Real-Time Notifications

Socket.io enables real-time notifications for:

- Order updates
- Admin alerts
- Refund notifications
- System messages

Users receive notifications through a **notification bell with unread badge**.

---

## 📊 Admin Dashboard

The admin panel allows complete platform management.

### Product Management
- Product CRUD
- Image uploads to AWS S3
- Category management
- Featured product toggles

### Order Management
- View all orders
- Update order status
- Manage returns and refunds

### User Management
- Block / unblock users
- Reset passwords
- Disable 2FA
- Grant admin roles

### Promotions
- Create coupons
- Configure sales
- Manage Prime membership plans

### Store Settings
- Store branding
- Announcement bar
- Support contact info

---

# ⚡ Performance & Caching

VKart uses **Redis caching** to reduce database load and improve response time.

| Cache Key | TTL | Description |
|---|---|---|
home:data | 5 min | Aggregated homepage data |
products:page | 5 min | Product listing cache |
product:{id} | 10 min | Individual product page |
sale:active | 1 min | Active sale data |
profile:{userId} | 1 hr | User profile data |

Features:

- Automatic cache invalidation
- Pattern-based cache clearing
- Null caching to prevent DB misses

---

# 🏗️ Architecture


React Frontend (Netlify)
│
▼
Express API (Render)
│
▼
MongoDB Atlas
│
├── Redis Cache
├── AWS S3 Storage
│
Socket.io (Real-time updates)
│
Gemini AI (Search + Chatbot)


---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repositories

```bash
git clone https://github.com/vardhan12178/vkart.git
git clone https://github.com/vardhan12178/backend.git
2️⃣ Backend Setup
cd backend
npm install
npm run dev

Create .env

PORT=5000
MONGO_URI=your_mongodb_connection
REDIS_URL=your_redis_url

JWT_SECRET=your_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
S3_BUCKET=your_bucket

GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_key

GOOGLE_CLIENT_ID=your_google_client_id
3️⃣ Frontend Setup
cd vkart
npm install
npm start

Create .env

REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
📁 Project Structure

vkart/
├── public/
├── src/
│ ├── components/
│ ├── redux/
│ ├── services/
│ ├── seo/
│ └── utils/
│
backend/
├── controllers/
├── routes/
├── models/
├── middleware/
├── services/
├── utils/
└── scripts/


👨‍💻 Author

Bala Vardhan
Full-Stack MERN Developer

Portfolio
https://balavardhan.dev

GitHub
https://github.com/vardhan12178

⭐ If you like this project

Consider giving the repository a star ⭐
