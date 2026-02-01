# E-commerce Store with Stripe Integration

An e-commerce application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring Stripe payment processing (test account).

## Features

- Browse products with images and descriptions
- Add/remove items from cart
- Adjust product quantities
- Stripe checkout
- Order confirmation and success page

## Environment Variables

### Backend (`.env` in `/backend` directory)

```bash
PORT=
MONGODB_URI=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
CLIENT_URL=
```

### Frontend (`.env` in `/frontend` directory)

```bash
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
```
