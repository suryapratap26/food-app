import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import corsMiddleware from './config/cors.config.js';
import configureCloudinary from './config/cloudinary.config.js';
import { authenticate, requireAuth } from './middleware/auth.middleware.js';
import userRoutes from './routes/user.routes.js';
import foodRoutes from './routes/food.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGODB_URI in environment variables.');
  process.exit(1);
}

configureCloudinary();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticate);


app.use('/api', userRoutes);
app.use('/api/food', foodRoutes);


app.use(requireAuth);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () =>
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
  );
}

export default app;
