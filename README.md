# 🛒 VKart — Full-Stack MERN E-Commerce Platform

> Curated Shopping, Fast Delivery

🔴 **Live Demo:** [vkart.balavardhan.dev](https://vkart.balavardhan.dev/)

📂 **Frontend Repo:** [github.com/vardhan12178/vkart](https://github.com/vardhan12178/vkart)
📂 **Backend Repo:** [github.com/vardhan12178/backend](https://github.com/vardhan12178/backend)

VKart is a production-grade e-commerce web application built using the MERN stack. The project demonstrates backend-leaning system design with Redis caching, AI-assisted semantic search (RAG), real-time updates via WebSockets, dual payment gateways, and a fully responsive modern UI.

---

## 🚀 Tech Stack

### Frontend
| Category | Technologies |
|---|---|
| **Core** | React 18, React Router v6, Redux Toolkit |
| **UI** | Tailwind CSS, Headless UI, Heroicons, Framer Motion |
| **Payments** | Stripe (React Elements), Razorpay |
| **Auth** | Google OAuth (@react-oauth/google) |
| **Charts** | Recharts |
| **SEO** | React Helmet Async |
| **Real-time** | Socket.io Client |

### Backend
| Category | Technologies |
|---|---|
| **Core** | Node.js (ESM), Express 4 |
| **Database** | MongoDB Atlas (Mongoose 8) |
| **Caching** | Redis (ioredis) |
| **Auth** | JWT, bcryptjs, Speakeasy (TOTP 2FA), Google Auth Library |
| **Security** | Helmet, CORS, CSRF, Rate Limiting, Mongo Sanitize, HPP |
| **AI/Search** | Google Gemini 2.5 Flash, LangChain, Vector Embeddings (text-embedding-004) |
| **Payments** | Razorpay SDK, Stripe SDK |
| **Cloud** | AWS S3 (@aws-sdk/client-s3), Multer-S3 |
| **Email** | Resend |
| **Real-time** | Socket.io |
| **Documents** | PDFKit (invoices), QRCode |
| **Scheduling** | node-cron |
| **Logging** | Winston |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Netlify |
| Backend API | Render |
| Database | MongoDB Atlas |
| File Storage | AWS S3 (ap-south-1) |
| Caching | Redis |
| Containerized | Docker + Docker Compose + AWS ECS (Fargate) |

---

## 🧩 Features

### 🛍️ Storefront
- **Product Catalog** — Listing with advanced filters (category, price range, rating, sort), search with autocomplete suggestions
- **AI Semantic Search** — RAG-style vector search using MongoDB Atlas `$vectorSearch` and Google Gemini embeddings
- **AI Shopping Assistant** — Floating chat widget powered by Gemini 2.5 Flash with contextual product recommendations
- **Sales & Promotions** — Time-bound sales with per-category discounts, dynamic sale banners, Prime-exclusive discount tiers
- **Coupons** — Percent/flat discount codes with min-order, max-discount cap, per-user usage limits
- **Product Comparison** — Side-by-side product comparison tool
- **Wishlist** — Persistent wishlist synced with user profile

### 🔐 Authentication & Security
- **JWT Authentication** with HTTP-only cookie-based sessions
- **Google OAuth 2.0** — One-click sign-in
- **Two-Factor Authentication (2FA)** — TOTP via authenticator apps with QR setup, backup codes, AES-encrypted secret storage
- **Email Verification** — Required on registration with resend functionality
- **Password Recovery** — Forgot/reset password flow via email
- **Token Blacklisting** — JWT invalidation with TTL-based auto-cleanup
- **Security Middleware** — Helmet, CORS whitelist, CSRF protection, rate limiting, NoSQL injection prevention, HPP

### 💳 Payments & Wallet
- **Dual Payment Gateways** — Razorpay (server-side) + Stripe (client-side Elements)
- **Built-in Wallet** — Top-up via Razorpay, balance tracking, transaction history, pay at checkout with wallet
- **Payment Methods** — Card, UPI, COD, Wallet
- **Coupon Validation** — Real-time coupon application at checkout

### 📦 Order Management
- **8-Stage Order Pipeline** — Placed → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered → Cancelled
- **Full Status History Timeline** — Every stage change recorded with timestamps
- **Returns & Refunds** — Return initiation with 7-stage return tracking, refund to wallet or original payment method
- **Auto-Refund Scheduler** — Daily cron job (2 AM) for automated refund processing
- **PDF Invoice Generation** — Auto-increment invoice numbers, downloadable PDFs via PDFKit
- **Real-time Order Updates** — Socket.io push notifications on stage changes

### 👑 Prime Membership
- **Configurable Plans** — Multiple tiers with duration, pricing, and feature lists
- **Prime-Exclusive Discounts** — Additional sale discounts for Prime members
- **Razorpay Payment Flow** — Purchase and verification
- **Status Tracking** — Active membership badge, auto-expiration

### 🔔 Real-Time Notifications
- **Socket.io Integration** — JWT-authenticated WebSocket connections
- **Notification Types** — Order updates, alerts, user actions, system messages, returns, refunds
- **Admin Notifications** — Separate admin notification channel
- **Notification Bell** — Unread count badge, mark as read

### 📊 Admin Dashboard
- **Product Management** — Full CRUD with S3 image upload, variant support, featured/active toggles
- **Order Management** — View all orders, update stages, process returns/refunds/replacements
- **User Management** — List users, block/unblock, force password reset, disable 2FA, toggle admin role
- **Review Moderation** — View, hide/show, or delete product reviews
- **Coupon Management** — Create and manage discount codes
- **Sales & Promotions** — Create time-bound sales with per-category and Prime-specific discounts
- **Membership Plan Management** — CRUD for Prime membership tiers
- **Store Settings** — Store name, tagline, support info, GST number, logo upload
- **Announcement Bar** — Configurable site-wide announcements with custom colors and links
- **Analytics** — Dashboard overview with charts (Recharts)

### 🌐 Additional Features
- **Blog** — Blog listing and post detail pages
- **Newsletter** — Email subscribe/unsubscribe
- **Dynamic Sitemap** — Auto-generated XML sitemap at `/sitemap.xml`
- **SEO Optimization** — Per-route meta tags, OpenGraph, Twitter Cards, Google site verification
- **Cookie Consent Banner** — GDPR-friendly cookie notice
- **Announcement Bar** — Admin-configurable promotional banner
- **Responsive Design** — Mobile-first UI with Tailwind CSS

---

## ⚡ Performance & Caching

VKart uses Redis for multi-layer caching to minimize database calls:

| Cache Key | TTL | Description |
|---|---|---|
| `home:data` | 5 min | Aggregated home page payload (featured, new arrivals, active sale) |
| `products:raw:page1:limit20` | 5 min | Default product listing |
| `product:{id}` | 10 min | Individual product detail |
| `sale:active` | 1 min | Current active sale |
| `suggest:{query}` | 5 min | Search autocomplete results |
| `profile:{userId}` | 1 hr | User profile data |

- **Cache invalidation** on all write operations (create/update/delete products, sales, reviews)
- **Pattern-based invalidation** via `SCAN` + `DEL` (production-safe, no `KEYS` command)
- **Null caching** to prevent repeated DB misses for empty results

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React SPA  │────▶│  Express API  │────▶│  MongoDB     │
│   (Netlify)  │◀────│  (Render)     │◀────│  Atlas       │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
               ┌────▼────┐  ┌─────▼─────┐
               │  Redis   │  │  AWS S3    │
               │  Cache   │  │  Storage   │
               └──────────┘  └───────────┘
                    │
               ┌────▼────────────┐
               │  Socket.io       │
               │  (Real-time)     │
               └──────────────────┘
                    │
               ┌────▼────────────┐
               │  Gemini AI       │
               │  (Search + Chat) │
               └──────────────────┘
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repositories
```bash
git clone https://github.com/vardhan12178/vkart.git
git clone https://github.com/vardhan12178/backend.git
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key
AES_KEY=your_32_byte_aes_key

RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret

AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET=your_s3_bucket

GEMINI_API_KEY=your_gemini_api_key

RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@yourdomain.com

GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Frontend Setup
```bash
cd vkart
npm install
npm start
```

Create a `.env` file inside the `vkart` folder:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Local Development
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🧪 Testing

### Frontend Tests
```bash
npm test
```
- Jest 27 + React Testing Library
- Component tests for auth flows (Login, ForgotPassword, ResetPassword)
- Redux slice tests

### Backend Tests
```bash
cd backend
npm test
```
- Jest 29 + Supertest + mongodb-memory-server
- API integration tests for auth, orders, and products
- In-memory MongoDB for isolated test environments

---

## 🐳 Docker

### Frontend
```bash
docker-compose up --build
```
Multi-stage build: Node 20 Alpine (build) → Nginx Alpine (serve)

### Backend
```bash
cd backend
docker-compose up --build
```
Node 18 Alpine container on port 5000

---

## 📁 Project Structure

```
vkart/
├── public/                  # Static assets
├── src/
│   ├── components/          # ~60 React components
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── blog/            # Blog components
│   │   └── ...              # Storefront components
│   ├── redux/               # Redux Toolkit slices & store
│   ├── seo/                 # Per-route SEO config
│   ├── services/            # API service layer
│   └── utils/               # Frontend utilities
├── backend/
│   ├── controllers/         # 19 route controllers
│   ├── routes/              # Express route definitions
│   ├── models/              # 10 Mongoose models
│   ├── middleware/           # Auth, admin, validation, security
│   ├── services/            # AI, Email, Refund scheduler
│   ├── utils/               # Redis, S3, Socket.io, Crypto
│   ├── scripts/             # Data vectorization & localization
│   └── tests/               # Backend integration tests
└── build/                   # Production build output
```

---

## 📊 Project Stats

| Metric | Count |
|---|---|
| Frontend Pages | 30+ |
| Admin Dashboard Pages | 10 |
| React Components | ~60 |
| API Endpoints | 75+ |
| Mongoose Models | 10 |
| Redux Slices | 5 |
| Backend Services | 3 |

---

## 👤 Author

**Bala Vardhan**
Full-Stack Developer (MERN)

