import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Product from './models/Product';
import Order from './models/Order';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Seed initial products (run once)
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        stock: 15
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with fitness tracking',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        stock: 20
      },
      {
        name: 'Laptop Backpack',
        description: 'Durable backpack with laptop compartment',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        stock: 30
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with multiple ports',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
        stock: 25
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with blue switches',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        stock: 12
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        stock: 40
      }
    ]);
    console.log('Products seeded');
  }
};

seedProducts();

// Routes

// Get all products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create payment intent
app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, customerInfo, items } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email
      }
    });

    // Create order in database
    const order = new Order({
      items,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerAddress: customerInfo.address,
      totalAmount: amount,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    await order.save();

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: order._id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Update order status
app.post('/api/orders/:orderId/complete', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'completed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get order details
app.get('/api/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});