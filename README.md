# VKart Frontend

Frontend for VKart, a MERN e-commerce platform with AI-assisted discovery, secure checkout, Prime membership, real-time notifications, and an admin dashboard.

Live demo: https://vkart.balavardhan.dev/

Repositories:
- Frontend: https://github.com/vardhan12178/vkart
- Backend: https://github.com/vardhan12178/backend

## Overview

This app provides:
- Product listing, filtering, search, wishlist, and comparison
- AI shopping assistant and semantic product discovery
- Login, Google OAuth, 2FA flows, and profile management
- Razorpay and wallet-based checkout flows
- Prime membership purchase and status tracking
- Real-time user and admin notifications with Socket.io
- Admin tools for products, orders, users, coupons, sales, reviews, and settings

## Tech Stack

### Frontend

| Category | Technologies |
| --- | --- |
| Core | React 18, React Router v6, Redux Toolkit |
| Data | Axios, TanStack React Query |
| UI | Tailwind CSS, Headless UI, Heroicons, Framer Motion |
| Auth | Google OAuth |
| Real-time | socket.io-client |
| Charts | Recharts |
| SEO | react-helmet-async |
| Payments | Razorpay, Stripe |

### Backend

The frontend depends on the separate backend repo for:
- Express API
- MongoDB
- Redis caching
- Razorpay and Stripe verification
- Socket.io server
- AWS S3 uploads
- Resend email flows

## Local Setup

### 1. Clone both repos

```bash
git clone https://github.com/vardhan12178/vkart.git
git clone https://github.com/vardhan12178/backend.git
```

### 2. Start the backend

```bash
cd backend
npm install
npm start
```

Create `backend/.env` with the backend values you use locally, for example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key
AES_KEY=your_32_byte_aes_key

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET=your_s3_bucket

GEMINI_API_KEY=your_gemini_api_key

RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@yourdomain.com

GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start the frontend

```bash
cd vkart
npm install
npm run dev
```

Create `vkart/.env` with:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
VITE_DEV_API_PROXY=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 4. Local URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Available Scripts

```bash
npm run dev
npm run build
npm test
npm run preview
```

## Testing

### Frontend

```bash
npm test -- --runInBand
```

Current frontend coverage includes login, forgot/reset password, checkout payment, and order payload tests.

### Backend

```bash
cd backend
npm test
```

Backend tests use Jest, Supertest, and mongodb-memory-server.

## Deployment Notes

- The frontend is built with Vite.
- Dev requests to `/api` and `/socket.io` are proxied to the backend server.
- Production builds are generated into `dist/`.

## Frontend Structure

```text
vkart/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── blog/
│   │   └── ...
│   ├── query/
│   ├── redux/
│   ├── seo/
│   └── utils/
├── index.html
├── vite.config.mjs
└── package.json
```

Author: Bala Vardhan
