# KSPK Foods

KSPK Foods is a full-stack food ordering platform with:

- a React + Vite customer frontend
- an Express + MongoDB backend
- customer, restaurant, and admin roles
- cart, checkout, Cash on Delivery and card payments
- reviews, profile management, and order history

This repository currently contains the active JavaScript backend and the active React frontend. There is also a `food-app-backend-java` folder in the workspace, but the app flow in this repo is wired to the JavaScript backend in `food-app-backend-js`.

## Main Features

### Customer

- Browse all foods without location-based restriction
- Search and filter foods by category
- View food details
- Add items to cart
- Checkout with:
  - Cash on Delivery
  - Card payment via Stripe
- Save delivery address and profile details
- Leave ratings and reviews after a successful order
- View order history with:
  - search
  - status filters
  - sorting
  - repeat order
  - history removal for completed/failed orders

### Restaurant

- Register restaurant account
- Wait for admin approval before login
- Access restaurant dashboard
- Add and manage food items
- View and manage restaurant orders

### Admin

- View dashboard overview
- Manage all food listings
- Monitor all orders
- Approve or reject pending restaurants
- Create admin users

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- Bootstrap 5
- Bootstrap Icons
- Axios
- React Toastify
- Stripe React SDK

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Stripe
- Cloudinary
- Nodemailer

## Project Structure

```text
food-app/
├─ foodies/                 # React frontend
├─ food-app-backend-js/     # Active Node/Express backend
├─ food-app-backend-java/   # Older / alternate backend folder
└─ README.md
```

## Important App Flows

### Signup Flow

- Customer signup collects basic account details first
- Address is requested on the next step after signup
- Restaurant signup includes restaurant-specific onboarding fields

### Review Flow

- Ratings and reviews are stored in the backend
- Customers can review a food only after a successful order containing that food
- Food cards and food detail pages display backend-driven ratings

### Payment Flow

- `COD` creates the order immediately
- `CARD` creates a Stripe payment intent and confirms the payment on the frontend

## Environment Variables

Create a `.env` file in `food-app-backend-js/`.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
FRONTENDURL=http://localhost:5173

STRIPE_PUBLIC_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret

EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password_or_app_password
RECEIVER_EMAIL=where_contact_messages_should_be_sent

PORT=8080
```

Notes:

- `EMAIL_USER`, `EMAIL_PASS`, and `RECEIVER_EMAIL` are optional for basic contact form usage.
- If email is not configured, contact messages are still saved to MongoDB.
- The frontend uses `VITE_BACKEND_URL` and `VITE_STRIPE_PUBLIC_KEY` in `foodies/.env`.

Example frontend `.env`:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

## Installation

### 1. Install frontend dependencies

```bash
cd foodies
npm install
```

### 2. Install backend dependencies

```bash
cd ../food-app-backend-js
npm install
```

## Run the App Locally

Open two terminals.

### Terminal 1: start backend

```bash
cd food-app-backend-js
npm run dev
```

Backend default URL:

```text
http://localhost:8080
```

### Terminal 2: start frontend

```bash
cd foodies
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Available Scripts

### Frontend: `foodies`

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend: `food-app-backend-js`

```bash
npm run dev
npm start
```

## API Overview

The backend exposes routes for:

- authentication and registration
- contact form submission
- food listing and food detail
- customer cart
- order creation and verification
- profile management
- restaurant approval
- food reviews

Main route groups:

- `/api`
- `/api/food`
- `/api/cart`
- `/api/orders`

## Current Dashboards

### Admin Dashboard

- platform overview
- order insights
- quick management links
- restaurant approval monitoring

### Restaurant Dashboard

- order and revenue snapshot
- menu management shortcuts
- recent restaurant orders

## Build Status

The frontend currently builds successfully with:

```bash
cd foodies
npm run build
```

There may be a Vite warning about bundle size being over 500 kB. This is currently a warning only, not a build failure.

## Known Notes

- The active backend is `food-app-backend-js`
- The contact form now stores messages even if SMTP email credentials are missing
- Admin users do not add food directly from the sidebar
- Restaurant users still have menu creation access

## Suggested Default Accounts / Roles

You can create or use these role types in the system:

- `CUSTOMER`
- `RESTAURANT`
- `ADMIN`

Restaurant accounts must be approved by an admin before they can access the restaurant panel.

## Future Improvements

- Split large frontend bundles with route-based code splitting
- Add backend tests and frontend UI tests
- Add image optimization and lazy loading
- Add analytics and reporting for admin and restaurant dashboards

## License

This project currently does not define a license in the repository. Add one if you plan to distribute it publicly.
