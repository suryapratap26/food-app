# KSPK Foods

KSPK Foods is a full-stack food ordering platform built with a React frontend and an Express + MongoDB backend.

It supports:

- customer, restaurant, and admin roles
- restaurant approval flow
- cart and checkout
- Cash on Delivery and Stripe card payments
- backend-driven food ratings and reviews
- profile editing and saved addresses
- customer order history
- admin and restaurant dashboards
- contact form message storage

This repository currently uses:

- `foodies` as the active frontend
- `food-app-backend-js` as the active backend

The `food-app-backend-java` folder exists in the repo, but the current working application flow in this project is connected to the JavaScript backend.

## Features

### Customer Features

- Browse all foods without location restriction
- Search foods and filter by category
- View food details
- View backend-based star ratings and review counts
- Add food to cart
- Checkout with:
  - Cash on Delivery
  - Card payment with Stripe
- Save and update profile details
- Save and update delivery address
- Add reviews only after a successful order
- View full order history
- Search, filter, sort, repeat, and remove eligible order history entries

### Restaurant Features

- Register a restaurant account
- Wait for admin approval before accessing the dashboard
- View restaurant dashboard
- Add food items
- Manage menu items
- Manage restaurant orders

### Admin Features

- View admin dashboard
- Monitor orders
- Manage food listings
- Approve or reject restaurants
- Create admin accounts

## UI Highlights

The current UI includes:

- redesigned customer-facing theme
- improved text contrast for readability
- upgraded home hero section
- improved cart, contact, footer, and category browsing sections
- redesigned admin and restaurant dashboards
- larger full-width review section on the food details page

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
- MongoDB
- Mongoose
- JWT authentication
- Stripe
- Cloudinary
- Nodemailer

## Project Structure

```text
food-app/
├─ foodies/                 # Active React frontend
├─ food-app-backend-js/     # Active Express + MongoDB backend
├─ food-app-backend-java/   # Older / alternate backend folder
└─ README.md
```

## Core Flows

### Signup Flow

- Customer signup collects only account details first
- Customer address is collected on the next page after signup
- Restaurant signup collects restaurant setup information during registration

### Review Flow

- Reviews are stored in the backend on food records
- Only customers can submit reviews
- A customer must have a successful order containing that food before reviewing
- Food cards and food detail pages display backend-driven ratings

### Payment Flow

- `COD`
  - order is created immediately
  - payment is marked as pending cash collection
- `CARD`
  - order is created with a Stripe payment intent
  - payment is confirmed on the frontend

### Contact Flow

- Contact form messages are saved to MongoDB
- If email credentials are configured, the backend also sends the message by email
- If email credentials are missing, contact submissions still succeed and are stored

## Environment Variables

Create a `.env` file inside `food-app-backend-js/`.

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

- `EMAIL_USER`, `EMAIL_PASS`, and `RECEIVER_EMAIL` are optional.
- If email is not configured, the contact form still stores messages in MongoDB.

Create a frontend `.env` file inside `foodies/`.

Example:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

## Installation

### Install frontend dependencies

```bash
cd foodies
npm install
```

### Install backend dependencies

```bash
cd ../food-app-backend-js
npm install
```

## Run Locally

Use two terminals.

### Terminal 1: backend

```bash
cd food-app-backend-js
npm run dev
```

Backend default URL:

```text
http://localhost:8080
```

### Terminal 2: frontend

```bash
cd foodies
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Available Scripts

### Frontend (`foodies`)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend (`food-app-backend-js`)

```bash
npm run dev
npm start
```

## API Areas

Main backend route groups:

- `/api`
- `/api/food`
- `/api/cart`
- `/api/orders`

These cover:

- auth and registration
- profile management
- food listing and food details
- food reviews
- contact form submission
- cart management
- order creation and verification
- admin restaurant approval

## Dashboards

### Admin Dashboard

- platform overview
- quick actions
- recent order snapshot
- order status mix
- pending restaurant monitoring

### Restaurant Dashboard

- restaurant overview
- revenue and active order visibility
- quick menu and order actions
- recent restaurant orders

## Build

Frontend production build:

```bash
cd foodies
npm run build
```

The frontend currently builds successfully.

There may still be a Vite warning about bundle size being above 500 kB. That warning does not block the build.

## Roles

The application currently uses:

- `CUSTOMER`
- `RESTAURANT`
- `ADMIN`

Restaurant accounts must be approved by an admin before they can log in to the restaurant dashboard.

## Current Notes

- Active backend: `food-app-backend-js`
- Contact form submissions are stored even if email credentials are missing
- Admin users do not have the add-food shortcut in the sidebar
- Restaurant users still manage food from their dashboard
- Customers now see all foods instead of location-limited items

## Suggested Next Improvements

- route-based code splitting to reduce bundle size
- automated backend tests
- UI consistency updates for remaining older admin forms and tables
- analytics and reporting widgets
- richer restaurant business metrics
