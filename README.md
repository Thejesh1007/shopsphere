# 🛍️ ShopSphere

A full-stack e-commerce platform built with React, Node.js, Express, Prisma ORM, PostgreSQL, and a mock payment gateway.

![ShopSphere](https://img.shields.io/badge/status-live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## 🌐 Live Demo

- **Frontend:** *(add after deploying frontend)*
- **Backend API:** https://shopsphere-backend.onrender.com/api/health

## ✨ Features

### Customer
- Browse products with search, category filter, and pagination
- Product detail page with image, stock status, and reviews
- Add to cart with quantity control, wishlist toggle
- Full checkout flow with mock payment gateway (HMAC verified)
- Order history with real-time status tracking
- Star ratings and reviews with one-review-per-product enforcement

### Admin
- Dashboard with stats: total users, products, orders, revenue
- Low stock alerts and recent orders overview
- Full product CRUD (create, edit, delete with category assignment)
- Order management with status updates (pending → shipped → delivered)
- User management with role-based access protection

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios, Context API |
| Backend | Node.js, Express.js, JWT Auth, RBAC middleware |
| Database | PostgreSQL, Prisma ORM |
| Payment | Mock Razorpay gateway with HMAC SHA-256 verification |
| Deployment | Render (backend + database) |

## 🗄️ Database Schema

8 models: User, Category, Product, CartItem, Wishlist, Order, OrderItem, Payment, Review

Key design decisions:
- `@@unique([userId, productId])` on CartItem, Wishlist, Review — prevents duplicates at DB level
- `onDelete: Cascade` on all user-linked records — clean data on user deletion
- `prisma.$transaction` for order placement — atomic stock decrement + cart clear
- Payment stored separately from Order — order exists before payment, not after

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
npm install
# Create .env with DATABASE_URL, JWT_SECRET, PORT
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

### Default Admin Account
```
Email: admin@shopsphere.com
Password: admin123
```

## 📁 Project Structure
```
shopsphere/
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/     # All page components
│       ├── components/ # Reusable UI components
│       ├── context/   # AuthContext, CartContext, ToastContext
│       └── services/  # Axios instance with interceptors
└── backend/           # Node.js + Express
    └── src/
        ├── routes/    # API route definitions
        ├── controllers/ # Business logic
        ├── middleware/ # JWT auth, admin check
        └── lib/       # Prisma singleton
```

## 🔐 API Endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/cart | Customer |
| POST | /api/orders | Customer |
| POST | /api/payments/create-order | Customer |
| POST | /api/payments/verify | Customer |
| GET | /api/admin/stats | Admin |
| PUT | /api/admin/orders/:id/status | Admin |

## 👤 Author

**Thejesh Kambhalamatam**
- GitHub: [@Thejesh1007](https://github.com/Thejesh1007)
- LeetCode: [Thejesh07](https://leetcode.com/u/Thejesh07/)