# ShopMart — Secure Online Shopping Mart

This repository contains a full-stack demo application: a Next.js frontend and a FastAPI backend with MongoDB. It demonstrates secure authentication (JWT with refresh rotation), product/catalog management, cart & checkout, Stripe integration (Checkout sessions + webhook), and an admin console.

Quick start

1. Backend

- Create a Python virtual environment and install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

- Set environment variables (example `.env`):

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=shopmart
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

- Run the server:

```bash
uvicorn server:app --reload --port 8000
```

2. Frontend

- Install dependencies and run:

```bash
cd frontend
npm install
npm run dev
```

3. Seed data

- Use `backend/seed.py` to create an admin account and sample products.

Folders

- `backend/` — FastAPI app, routes under `routes/api`, DB connection and utilities.
- `frontend/` — Next.js (App Router) frontend with pages and components.

Important endpoints

- `POST /api/auth/register` — register
- `POST /api/auth/login` — login
- `GET /api/auth/me` — current user
- `GET /api/products` — list products
- `POST /api/products` — create product (admin)
- `POST /api/products/upload-image` — upload product image (multipart)
- `POST /api/payments/create-checkout-session` — creates Stripe Checkout session
- `POST /api/payments/webhook` — Stripe webhook

Development notes

- The frontend uses `credentials: 'include'` to send auth cookies to the backend.
- Admin pages are protected server-side via dependencies and client-side via middleware.

Security analysis and mitigations are in `SECURITY.md`.
